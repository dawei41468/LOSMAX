from datetime import datetime
from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field, validator

class TaskStatus(str, Enum):
    todo = "todo"
    in_progress = "in_progress"
    done = "done"

class TaskCreate(BaseModel):
    goal_id: str
    title: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    status: TaskStatus = TaskStatus.todo

    @validator('goal_id')
    def validate_goal_id(cls, v):
        if not v or not isinstance(v, str):
            raise ValueError("goal_id must be a non-empty string")
        return v

class Task(TaskCreate):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }