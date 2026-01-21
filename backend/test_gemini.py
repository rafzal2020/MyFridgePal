import os
from google import genai
from dotenv import load_dotenv

# Load env variables
load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
print(f"API Key present: {bool(api_key)}")

if api_key:
    # Print first few chars to verify proper loading
    print(f"API Key prefix: {api_key[:4]}...")
    
    # Check if user is still using the placeholder
    if api_key.startswith("your_actual"):
        print("\nERROR: You are still using the placeholder API key!")
        print("Please edit backend/.env and paste your real Google Gemini API Key.")
        exit()

    try:
        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model='gemini-1.5-flash',
            contents='Say hello'
        )
        print("\nSuccess! Response from Gemini:")
        print(response.text)
    except Exception as e:
        print(f"\nError calling Gemini API: {e}")
else:
    print("No API Key found in .env")
