from datetime import datetime
from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field, field_validator

class TaskStatus(str, Enum):
    pending = "pending"
    complete = "complete"
    incomplete = "incomplete"

class TaskCreate(BaseModel):
    goal_id: str
    title: str = Field(..., min_length=1, max_length=100)
    status: TaskStatus = TaskStatus.pending

    @field_validator('goal_id')
    @classmethod
    def validate_goal_id(cls, v):
        if not v or not isinstance(v, str):
            raise ValueError("goal_id must be a non-empty string")
        return v

class Task(TaskCreate):
    id: Optional[str] = None
    user_id: str
    created_at: datetime

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }