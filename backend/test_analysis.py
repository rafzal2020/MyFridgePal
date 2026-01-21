import models, schemas, crud
from database import SessionLocal
import ai_service
import time

def test_analysis():
    db = SessionLocal()
    try:
        print("Fetching items...")
        items = crud.get_items(db, fridge_id=1, limit=100) # Assuming fridge 1 exists
        print(f"Found {len(items)} items.")
        
        start_time = time.time()
        print("Calling analyze_fridge_health...")
        result = ai_service.analyze_fridge_health(items)
        end_time = time.time()
        
        print(f"Analysis took {end_time - start_time:.2f} seconds.")
        print("Result:", result)
        
    except Exception as e:
        print(f"Test crashed: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    test_analysis()
