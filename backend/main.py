from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

import models, schemas, crud
from database import SessionLocal, engine
import ai_service

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="MyFridgePal API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Startup event to seed test user
@app.on_event("startup")
def startup_event():
    db = SessionLocal()
    test_email = "test@example.com"
    user = crud.get_user_by_email(db, email=test_email)
    if not user:
        user_in = schemas.UserCreate(email=test_email, password="password123")
        crud.create_user(db, user=user_in)
        print(f"Created test user: {test_email} / password123")
    db.close()

@app.get("/")
def read_root():
    return {"message": "Welcome to MyFridgePal API"}

@app.get("/health")
def health_check():
    return {"status": "ok"}

# Fridge Endpoints (Assuming user_id=1 for MVP)
@app.post("/fridges/", response_model=schemas.Fridge)
def create_fridge(fridge: schemas.FridgeCreate, db: Session = Depends(get_db)):
    # Hardcoded user_id for MVP
    return crud.create_user_fridge(db=db, fridge=fridge, user_id=1)

@app.get("/fridges/", response_model=List[schemas.Fridge])
def read_fridges(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    fridges = crud.get_fridges(db, user_id=1, skip=skip, limit=limit)
    return fridges

@app.get("/fridges/{fridge_id}", response_model=schemas.Fridge)
def read_fridge(fridge_id: int, db: Session = Depends(get_db)):
    db_fridge = crud.get_fridge(db, fridge_id=fridge_id, user_id=1)
    if db_fridge is None:
        raise HTTPException(status_code=404, detail="Fridge not found")
    return db_fridge

@app.delete("/fridges/{fridge_id}", response_model=schemas.Fridge)
def delete_fridge(fridge_id: int, db: Session = Depends(get_db)):
    db_fridge = crud.delete_fridge(db, fridge_id=fridge_id, user_id=1)
    if db_fridge is None:
        raise HTTPException(status_code=404, detail="Fridge not found")
    return db_fridge

@app.post("/fridges/{fridge_id}/items/", response_model=schemas.Item)
def create_item_for_fridge(
    fridge_id: int, item: schemas.ItemCreate, db: Session = Depends(get_db)
):
    # Check if fridge exists (for this user, assuming user_id=1)
    db_fridge = crud.get_fridge(db, fridge_id=fridge_id, user_id=1)
    if db_fridge is None:
        raise HTTPException(status_code=404, detail="Fridge not found")
    return crud.create_fridge_item(db=db, item=item, fridge_id=fridge_id)

@app.get("/fridges/{fridge_id}/items/", response_model=List[schemas.Item])
def read_items(fridge_id: int, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    # Check if fridge exists
    db_fridge = crud.get_fridge(db, fridge_id=fridge_id, user_id=1)
    if db_fridge is None:
        raise HTTPException(status_code=404, detail="Fridge not found")
    items = crud.get_items(db, fridge_id=fridge_id, skip=skip, limit=limit)
    return items

@app.delete("/items/{item_id}", response_model=schemas.Item)
def delete_item(item_id: int, db: Session = Depends(get_db)):
    # In a real app we'd verify ownership here too
    db_item = crud.delete_item(db, item_id=item_id)
    if db_item is None:
         raise HTTPException(status_code=404, detail="Item not found")
    return db_item

@app.put("/items/{item_id}", response_model=schemas.Item)
def update_item(item_id: int, item_update: schemas.ItemUpdate, db: Session = Depends(get_db)):
    db_item = crud.update_item(db, item_id=item_id, item_update=item_update)
    if db_item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    return db_item

from fastapi import UploadFile, File

@app.post("/scan-nutrition")
async def scan_nutrition(file: UploadFile = File(...)):
    contents = await file.read()
    nutrition = ai_service.analyze_nutrition_label(contents)
    if not nutrition:
        raise HTTPException(status_code=400, detail="Could not analyze image")
    return nutrition

@app.get("/fridges/{fridge_id}/analysis")
def analyze_fridge(fridge_id: int, db: Session = Depends(get_db)):
    try:
        # Verify fridge exists
        db_fridge = crud.get_fridge(db, fridge_id=fridge_id, user_id=1)
        if not db_fridge:
             raise HTTPException(status_code=404, detail="Fridge not found")
             
        items = crud.get_items(db, fridge_id=fridge_id, limit=1000)
        print(f"DEBUG: Found {len(items)} items for analysis.")
        
        analysis = ai_service.analyze_fridge_health(items)
        print("DEBUG: Analysis successful:", analysis)
        return analysis
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

@app.get("/items/expiring", response_model=List[schemas.Item])
def read_expiring_items(db: Session = Depends(get_db)):
    return crud.get_expiring_items(db, user_id=1)

@app.post("/recipes/generate")
def generate_recipes(db: Session = Depends(get_db)):
    # 1. Fetch all items across all fridges for user 1
    items = crud.get_all_user_items(db, user_id=1)
    
    if not items:
        return []
        
    # 2. Call AI
    recipes = ai_service.generate_recipes(items)
    return recipes

@app.post("/recipes/save", response_model=schemas.Recipe)
def save_recipe(recipe: schemas.RecipeCreate, db: Session = Depends(get_db)):
    # Assuming user_id=1 for MVP
    return crud.create_recipe(db=db, recipe=recipe, user_id=1)

@app.get("/recipes/", response_model=List[schemas.Recipe])
def read_recipes(db: Session = Depends(get_db)):
    return crud.get_recipes(db, user_id=1)

@app.delete("/recipes/{recipe_id}")
def delete_recipe(recipe_id: int, db: Session = Depends(get_db)):
    db_recipe = crud.delete_recipe(db, recipe_id=recipe_id, user_id=1)
    if db_recipe is None:
        raise HTTPException(status_code=404, detail="Recipe not found")
    return {"message": "Recipe deleted"}

@app.post("/goals/advice")
def get_goal_advice(request: schemas.GoalRequest, db: Session = Depends(get_db)):
    # 1. Fetch user items
    items = crud.get_all_user_items(db, user_id=1)
    
    # 2. Call AI
    advice = ai_service.generate_goal_advice(items, request.goal)
    if not advice:
        raise HTTPException(status_code=500, detail="Could not generate advice")
        
    return advice
