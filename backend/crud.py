from sqlalchemy.orm import Session
import models, schemas
from datetime import date, timedelta
import ai_service

def get_expiring_items(db: Session, user_id: int):
    today = date.today()
    limit_date = today + timedelta(days=3)
    
    return db.query(models.Item).join(models.Fridge).filter(
        models.Fridge.user_id == user_id,
        models.Item.expiration_date != None,
        models.Item.expiration_date <= limit_date
    ).all()

def get_all_user_items(db: Session, user_id: int):
    """
    Fetch all items across all fridges for a specific user.
    """
    return db.query(models.Item).join(models.Fridge).filter(
        models.Fridge.user_id == user_id
    ).all()

def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()
def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate):
    fake_hashed_password = user.password + "notreallyhashed"
    db_user = models.User(email=user.email, hashed_password=fake_hashed_password, is_active=True)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_fridges(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.Fridge).filter(models.Fridge.user_id == user_id).offset(skip).limit(limit).all()

def create_user_fridge(db: Session, fridge: schemas.FridgeCreate, user_id: int):
    db_fridge = models.Fridge(**fridge.dict(), user_id=user_id)
    db.add(db_fridge)
    db.commit()
    db.refresh(db_fridge)
    return db_fridge

def delete_fridge(db: Session, fridge_id: int, user_id: int):
    db_fridge = db.query(models.Fridge).filter(models.Fridge.id == fridge_id, models.Fridge.user_id == user_id).first()
    if db_fridge:
        db.delete(db_fridge)
        db.commit()
    return db_fridge

def get_fridge(db: Session, fridge_id: int, user_id: int):
    return db.query(models.Fridge).filter(models.Fridge.id == fridge_id, models.Fridge.user_id == user_id).first()

def get_items(db: Session, fridge_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.Item).filter(models.Item.fridge_id == fridge_id).offset(skip).limit(limit).all()

def create_fridge_item(db: Session, item: schemas.ItemCreate, fridge_id: int):
    # Fetch nutrition info if not provided
    if not item.nutritional_info:
        item_data = item.dict()
        nutrition = ai_service.get_nutrition_info(item.name, item.quantity, item.unit, item.notes)
        if nutrition:
            item_data['nutritional_info'] = nutrition
        db_item = models.Item(**item_data, fridge_id=fridge_id)
    else:
        db_item = models.Item(**item.dict(), fridge_id=fridge_id)
        
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

def update_item(db: Session, item_id: int, item_update: schemas.ItemUpdate):
    db_item = db.query(models.Item).filter(models.Item.id == item_id).first()
    if not db_item:
        return None
    
    update_data = item_update.dict(exclude_unset=True)
    
    # If name, quantity, unit, or notes changed, we might want to re-fetch nutrition?
    # For now, let's only re-fetch if nutrition is NOT explicitly provided in the update
    # AND pertinent fields changed. 
    # But to keep it simple and per user request: "allow for comments... so AI has more context to update"
    # This implies we SHOULD re-fetch if notes/name/quantity/unit change.
    
    relevant_changes = any(k in update_data for k in ['name', 'quantity', 'unit', 'notes'])
    
    if relevant_changes and 'nutritional_info' not in update_data:
        # Re-fetch nutrition with new context
        name = update_data.get('name', db_item.name)
        quantity = update_data.get('quantity', db_item.quantity)
        unit = update_data.get('unit', db_item.unit)
        notes = update_data.get('notes', db_item.notes)
        
        nutrition = ai_service.get_nutrition_info(name, quantity, unit, notes)
        if nutrition:
            update_data['nutritional_info'] = nutrition

    for key, value in update_data.items():
        setattr(db_item, key, value)

    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

def delete_item(db: Session, item_id: int):
    db_item = db.query(models.Item).filter(models.Item.id == item_id).first()
    if db_item:
        db.delete(db_item)
        db.commit()
    return db_item

def create_recipe(db: Session, recipe: schemas.RecipeCreate, user_id: int):
    # Pass dict since we have lists/dicts in JSON columns
    recipe_data = recipe.dict()
    db_recipe = models.Recipe(**recipe_data, user_id=user_id)
    db.add(db_recipe)
    db.commit()
    db.refresh(db_recipe)
    return db_recipe

def get_recipes(db: Session, user_id: int):
    return db.query(models.Recipe).filter(models.Recipe.user_id == user_id).all()

def delete_recipe(db: Session, recipe_id: int, user_id: int):
    db_recipe = db.query(models.Recipe).filter(models.Recipe.id == recipe_id, models.Recipe.user_id == user_id).first()
    if db_recipe:
        db.delete(db_recipe)
        db.commit()
    return db_recipe
