from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class PushSubscription(BaseModel):
    endpoint: str
    p256dh: str
    auth: str

class PushSubscriptionInDB(PushSubscription):
    id: Optional[str] = None
    user_id: str
    created_at: datetime = datetime.utcnow()
    updated_at: datetime = datetime.utcnow()

class NotificationRequest(BaseModel):
    user_id: str
    title: str
    body: str
    icon: Optional[str] = None
    badge: Optional[str] = None
    tag: Optional[str] = None