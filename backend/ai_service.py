import os
import json
from google import genai
from google.genai import types
from dotenv import load_dotenv
import base64

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Initialize client if key is present
client = None
if GEMINI_API_KEY:
    try:
        client = genai.Client(api_key=GEMINI_API_KEY)
    except Exception as e:
        print(f"Error initializing Gemini client: {e}")

def get_nutrition_info(item_name: str, quantity: float, unit: str = None, notes: str = None):
    """
    Fetches nutritional information for a given item using Gemini (google-genai SDK).
    Returns a dictionary with calories, protein, carbs, fat.
    """
    if not client:
        print("GenAI Client not initialized (missing API Key). Returning mock data.")
        return {
            "calories": 100 * quantity,
            "protein": 5 * quantity,
            "carbs": 10 * quantity,
            "fat": 2 * quantity
        }

    try:
        quantity_str = f"{quantity} {unit}" if unit else f"{quantity}"
        context_str = f"Context/Notes: {notes}" if notes else ""
        
        prompt = f"""
        Provide nutritional information for {quantity_str} of {item_name}.
        {context_str}
        
        Return ONLY a JSON object with the following keys:
        - calories (integer)
        - protein (float, in grams)
        - carbs (float, in grams)
        - fat (float, in grams)
        - sugar (float, in grams)
        - vitamins (list of strings, e.g. ["Vitamin C", "Calcium"])
        Do not include markdown formatting or explanations. just the raw JSON.
        """
        
        # Try primary model, fallback to 1.5-flash if 2.0 fails 404
        # Enforcing 1.5-flash as primary for stability per user issues
        response = client.models.generate_content(
            model='gemini-2.0-flash',
            contents=prompt
        )
        
        text = response.text.strip()
        # Clean up possible markdown code blocks
        if text.startswith("```json"):
            text = text[7:]
        if text.endswith("```"):
            text = text[:-3]
            
        data = json.loads(text.strip())
        return data
    except Exception as e:
        print(f"Error fetching nutrition data: {e}")
        return None

def analyze_fridge_health(items_list: list):
    """
    Analyzes the healthiness of a list of items.
    """
    if not client:
        return {"score": 0, "analysis": "AI Service unavailable."}

    try:
        # Convert items to a simple string list for the prompt
        inventory_text = "\n".join([f"- {item.name}: {item.quantity} {item.unit or ''} (Notes: {item.notes or ''})" for item in items_list])
        
        prompt = f"""
        You are a nutritionist. Analyze the following fridge inventory:
        {inventory_text}
        
        Provide a health analysis in JSON format with:
        - score (integer 1-10, where 10 is healthiest)
        - analysis (string, a paragraph explaining the score, mentioning specific good/bad items)
        - recommendations (list of strings, specific suggestions to improve balance)
        
        Return ONLY valid JSON.
        """
        
        # Enforcing 1.5-flash for stability
        response = client.models.generate_content(
            model='gemini-2.0-flash',
            contents=prompt
        )
            
        text = response.text.strip()
        if text.startswith("```json"):
            text = text[7:]
        if text.endswith("```"):
            text = text[:-3]
            
        return json.loads(text.strip())
    except Exception as e:
        print(f"Health analysis error: {e}")
        return {"score": 0, "analysis": "Could not generate analysis.", "recommendations": []}

def analyze_nutrition_label(image_bytes: bytes):
    """
    Analyzes an image of a nutrition label to extract data.
    """
    if not client:
        return None
        
    try:
        prompt = """
        Analyze this nutrition label. Extract the following per serving (or per container if specified):
        - calories (integer)
        - protein (float, in grams)
        - carbs (float, in grams)
        - fat (float, in grams)
        
        Return ONLY a JSON object with these keys. No markdown.
        """
        
        # Create image content part
        # For google-genai SDK, we typically pass the bytes or a Part object.
        # Checking typical usage: contents=[prompt, image]
        # Image can be passed as types.Part.from_bytes(data, mime_type)
        
        image_part = types.Part.from_bytes(data=image_bytes, mime_type="image/jpeg") 
        # Assuming jpeg/png, the API is flexible usually, or we can detect.
        
        response = client.models.generate_content(
            model='gemini-2.0-flash',
            contents=[prompt, image_part]
        )
        
        text = response.text.strip()
        if text.startswith("```json"):
            text = text[7:]
        if text.endswith("```"):
            text = text[:-3]
            
        data = json.loads(text.strip())
        return data  
    except Exception as e:
        print(f"Error analyzing label: {e}")
        return None

def generate_recipes(items_list: list):
    """
    Generates recipe suggestions based on inventory.
    """
    if not client:
        return []
        
    try:
        inventory_text = "\n".join([f"- {item.name}" for item in items_list])
        
        prompt = f"""
        You are a chef. Propose 5 recipes that can be made primarily with these ingredients:
        {inventory_text}
        
        CRITICAL: Prioritize recipes that require verified FEW additional ingredients. 
        If possible, suggest deep-pantry recipes that use ONLY these ingredients.
        
        Return a JSON array of objects with these keys:
        - title (string)
        - difficulty (string: Easy, Medium, Hard)
        - time (string, e.g. "30 mins")
        - instructions (list of strings)
        - matching_ingredients (list of strings, ingredients user HAS from the list)
        - missing_ingredients (list of strings, ingredients user NEEDS to buy)
        
        Return ONLY valid JSON.
        """
        
        # Reverting to 2.0-flash as per user request (User claimed 1.5 doesn't work)
        # However, we should wrap in try-except fallback just in case 2.0 fails again.
        try:
            response = client.models.generate_content(
                model='gemini-2.0-flash',
                contents=prompt
            )
        except Exception:
            response = client.models.generate_content(
                model='gemini-1.5-flash',
                contents=prompt
            )
        
        text = response.text.strip()
        if text.startswith("```json"):
            text = text[7:]
        if text.endswith("```"):
            text = text[:-3]
            
        return json.loads(text.strip())
    except Exception as e:
        print(f"Recipe generation error: {e}")
        return []
        return []

def generate_goal_advice(items_list: list, goal: str):
    """
    Generates dietary advice based on inventory and user goal.
    """
    if not client:
        return None
        
    try:
        inventory_text = "\n".join([f"- {item.name}" for item in items_list])
        
        prompt = f"""
        You are an expert Dietitian and Health Coach. 
        The user has this goal: "{goal}".
        The user has these items in their fridge:
        {inventory_text}
        
        Analyze how their current stock aligns with their goal.
        
        Return a JSON object with:
        - score (integer 1-10, alignment score)
        - assessment (string, 2 sentences analyzing their stock vs goal)
        - eat_list (list of strings, items from their fridge that ARE GOOD for this goal)
        - avoid_list (list of strings, items from their fridge that are NOT IDEAL for this goal)
        - shopping_list (list of strings, top 3-5 items to buy to support this goal)
        
        Return ONLY valid JSON.
        """
        
        # Using 2.0-flash with fallback to 1.5-flash
        try:
            response = client.models.generate_content(
                model='gemini-2.0-flash',
                contents=prompt
            )
        except Exception:
             response = client.models.generate_content(
                model='gemini-1.5-flash',
                contents=prompt
            )
        
        text = response.text.strip()
        if text.startswith("```json"):
            text = text[7:]
        if text.endswith("```"):
            text = text[:-3]
            
        return json.loads(text.strip())
    except Exception as e:
        print(f"Goal advice error: {e}")
        return None
