from datetime import datetime
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: Optional[str] = None

class RefreshToken(BaseModel):
    token: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: datetime

class UserInDB(BaseModel):
    email: EmailStr
    name: Optional[str] = None
    hashed_password: str
    disabled: Optional[bool] = False
    refresh_tokens: List[RefreshToken] = []
    # User preferences
    morning_deadline: Optional[str] = "09:00 AM" # Changed to AM/PM
    evening_deadline: Optional[str] = "10:00 PM" # Changed to AM/PM
    notifications_enabled: Optional[bool] = False
    language: Optional[str] = "en"

    def add_refresh_token(self, token: str, expires_at: datetime) -> None:
        """Add a new refresh token to user's tokens list"""
        self.refresh_tokens.append(RefreshToken(
            token=token,
            expires_at=expires_at
        ))

    def revoke_refresh_token(self, token: str) -> bool:
        """Revoke a refresh token by removing it from the list"""
        initial_count = len(self.refresh_tokens)
        self.refresh_tokens = [t for t in self.refresh_tokens if t.token != token]
        return len(self.refresh_tokens) < initial_count

    def verify_refresh_token(self, token: str) -> bool:
        """Verify if refresh token exists and is not expired"""
        now = datetime.utcnow()
        for t in self.refresh_tokens:
            if t.token == token and t.expires_at > now:
                return True
        return False

class User(UserInDB):
    pass

class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: Optional[str] = None
    name: Optional[str] = None
    refresh_token: Optional[str] = None

# Pydantic models for User Preferences
class UserPreferencesBase(BaseModel):
    morning_deadline: str = Field(default="09:00 AM", description="Morning deadline in HH:MM AM/PM format") # Updated default and description
    evening_deadline: str = Field(default="10:00 PM", description="Evening deadline in HH:MM AM/PM format") # Updated default and description
    notifications_enabled: bool = Field(default=False, description="Enable/disable notifications")
    language: str = Field(default="en", description="User's preferred language code (e.g., 'en', 'zh')")

class UserPreferencesResponse(UserPreferencesBase):
    pass

class UserPreferencesUpdate(BaseModel):
    morning_deadline: Optional[str] = None
    evening_deadline: Optional[str] = None
    notifications_enabled: Optional[bool] = None
    language: Optional[str] = None