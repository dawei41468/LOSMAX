import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from jose import jwt
from jose.exceptions import JWTError as PyJWTError
from config.settings import settings
from database import connect_to_mongo
from models.user import UserInDB, UserCreate
from models.goal import GoalCreate
from datetime import datetime
from routes import auth, goals, websocket, preferences, task, admin # Added preferences and task router
from middleware.cors import setup_cors

def mask_sensitive_settings(settings_obj):
    """Mask sensitive information in settings for logging purposes."""
    sensitive_fields = ['SECRET_KEY', 'REFRESH_SECRET_KEY', 'MONGODB_URL']
    masked_settings = {}

    for key, value in settings_obj.__dict__.items():
        if key in sensitive_fields and isinstance(value, str):
            if key == 'MONGODB_URL' and '@' in value:
                # Mask MongoDB URL credentials: mongodb://user:pass@host -> mongodb://***:***@host
                protocol, rest = value.split('://', 1)
                if '@' in rest:
                    credentials, host = rest.split('@', 1)
                    masked_settings[key] = f"{protocol}://***:***@{host}"
                else:
                    masked_settings[key] = value
            else:
                # Mask other sensitive strings
                masked_settings[key] = "***MASKED***"
        else:
            masked_settings[key] = value

    return masked_settings

@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_to_mongo()
    yield

app = FastAPI(lifespan=lifespan)
setup_cors(app)
app.include_router(websocket.router)

print(f"Loaded settings: {mask_sensitive_settings(settings)}")

@app.get("/")
async def root():
    return {"Hello": "World"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "version": "1.0.0"}

@app.get("/test-user-model")
async def test_user_model():
    test_user = UserCreate(email="test@example.com", password="password123")
    # Simulating data that would come from DB or another source
    user_data_for_db_user = {
        "email": test_user.email,
        "hashed_password": "hashed_"+test_user.password,
        "id": "test_id_123",
        "disabled": False,
        "refresh_tokens": [],
        "notifications_enabled": False,
        "role": "User"
    }
    db_user = UserInDB(**user_data_for_db_user)
    return {
        "input": test_user.model_dump(), # Pydantic v2 uses model_dump()
        "output": db_user.model_dump() # Pydantic v2 uses model_dump()
    }

app.include_router(auth.router)
app.include_router(goals.router)
app.include_router(preferences.router) # Included preferences router
app.include_router(task.router) # Included task router
app.include_router(admin.router) # Included admin router

async def test_goal_service():
    """Test GoalService functionality"""
    from backend.services.goal_service import GoalService
    from backend.models.goal import Goal
    import asyncio
    
    service = GoalService()
    test_user = "test_user_123"
    test_category = "health"
    
    print("\n=== Testing GoalService ===")
    
    # Test create
    goal_data = GoalCreate(
        title="Run 5km",
        description="Daily running goal",
        category=test_category,
        target_date=datetime.utcnow()
    )
    goal = await service.create_goal(goal_data, test_user)
    print(f"Created goal: {goal.title} (ID: {goal.id})")

    # Test get
    fetched = await service.get_goal(goal.id)
    print(f"Fetched goal: {fetched.title if fetched else 'Not found'}")

    # Test update
    updated = await service.update_goal(goal.id, test_user, {"description": "Updated description"})
    if updated:
        print(f"Updated description to: {updated.description}")
    else:
        print("Update failed")

    # Test category validation
    try:
        invalid_goal_data = GoalCreate(
            title="Invalid Category",
            description="Test description",
            category="invalid_category",
            target_date=datetime.utcnow()
        )
        await service.create_goal(invalid_goal_data, test_user)
    except ValueError as e:
        print(f"Category validation failed as expected: {e}")

    # Cleanup
    await service.delete_goal(goal.id, test_user)
    print("Test completed, cleanup done")

if __name__ == "__main__":
    asyncio.run(test_goal_service())