from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field, field_validator
from utils.constants import CATEGORIES

class GoalStatus(str, Enum):
    ACTIVE = "active"
    COMPLETED = "completed"

class GoalBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    category: str
    target_date: datetime # Made mandatory
    status: GoalStatus = GoalStatus.ACTIVE

    @field_validator('category')
    def validate_category(cls, v: str) -> str:
        if v not in CATEGORIES:
            raise ValueError(f"Category must be one of: {CATEGORIES}")
        return v

class GoalCreate(GoalBase):
    pass # user_id will be added by the service layer from the authenticated user

class Goal(GoalBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class GoalInDB(Goal):
    """Database representation of a goal including sensitive fields"""
    class Config:
        from_attributes = True