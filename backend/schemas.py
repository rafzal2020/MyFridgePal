from pydantic import BaseModel
from typing import List, Optional, Any
from datetime import date

# Item Schemas
class ItemBase(BaseModel):
    name: str
    quantity: int = 1
    unit: Optional[str] = None
    expiration_date: Optional[date] = None
    nutritional_info: Optional[Any] = None
    notes: Optional[str] = None

class ItemCreate(ItemBase):
    pass

class ItemUpdate(BaseModel):
    name: Optional[str] = None
    quantity: Optional[int] = None
    unit: Optional[str] = None
    expiration_date: Optional[date] = None
    notes: Optional[str] = None
    nutritional_info: Optional[Any] = None

class Item(ItemBase):
    id: int
    fridge_id: int

    class Config:
        from_attributes = True

# Fridge Schemas
class FridgeBase(BaseModel):
    name: str

class FridgeCreate(FridgeBase):
    pass

class Fridge(FridgeBase):
    id: int
    user_id: int
    items: List[Item] = []

    class Config:
        from_attributes = True

# User Schemas
class UserBase(BaseModel):
    email: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    is_active: bool
    fridges: List[Fridge] = []

    class Config:
        from_attributes = True

# Recipe Schemas
class RecipeBase(BaseModel):
    title: str
    instructions: List[str]
    matching_ingredients: List[str]
    missing_ingredients: List[str]
    time: str
    difficulty: str

class RecipeCreate(RecipeBase):
    pass

class Recipe(RecipeBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

# Goal Schemas
class GoalRequest(BaseModel):
    goal: str
