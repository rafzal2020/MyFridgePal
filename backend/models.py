from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Date, JSON
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)

    fridges = relationship("Fridge", back_populates="owner")
    recipes = relationship("Recipe", back_populates="owner")

class Recipe(Base):
    __tablename__ = "recipes"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    instructions = Column(JSON) 
    matching_ingredients = Column(JSON)
    missing_ingredients = Column(JSON)
    time = Column(String)
    difficulty = Column(String)
    user_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="recipes")

class Fridge(Base):
    __tablename__ = "fridges"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="fridges")
    items = relationship("Item", back_populates="fridge")

class Item(Base):
    __tablename__ = "items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    quantity = Column(Integer, default=1)
    unit = Column(String, nullable=True) # e.g., "kg", "lbs", "count"
    expiration_date = Column(Date, nullable=True)
    nutritional_info = Column(JSON, nullable=True)
    notes = Column(String, nullable=True)
    fridge_id = Column(Integer, ForeignKey("fridges.id"))

    fridge = relationship("Fridge", back_populates="items")
