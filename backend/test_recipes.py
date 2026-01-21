import crud
from database import SessionLocal
import ai_service
import time
import json

def test_recipe_generation():
    db = SessionLocal()
    try:
        print("Fetching global items...")
        items = crud.get_all_user_items(db, user_id=1)
        print(f"Found {len(items)} items across all fridges.")
        
        if not items:
            print("Warning: No items found. Recipe generation will return empty list.")
            return

        print("Testing AI Recipe Generation...")
        start_time = time.time()
        recipes = ai_service.generate_recipes(items)
        end_time = time.time()
        
        print(f"Generation took {end_time - start_time:.2f} seconds.")
        print(f"Generated {len(recipes)} recipes.")
        print(json.dumps(recipes, indent=2))
        
    except Exception as e:
        print(f"Test Crashed: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    test_recipe_generation()
