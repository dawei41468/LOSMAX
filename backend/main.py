from contextlib import asynccontextmanager
from fastapi import FastAPI
import jwt
from jwt import PyJWTError
from config.settings import settings
from database import connect_to_mongo
from models.user import UserInDB, UserCreate
from routes import auth, goals, websocket, preferences # Added preferences router
from middleware.cors import setup_cors

@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_to_mongo()
    yield

app = FastAPI(lifespan=lifespan)
setup_cors(app)
app.include_router(websocket.router)

print(f"Loaded settings: {settings}")

@app.get("/")
async def root():
    return {"Hello": "World"}

@app.get("/test-user-model")
async def test_user_model():
    test_user = UserCreate(email="test@example.com", password="password123")
    # Simulating data that would come from DB or another source
    user_data_for_db_user = {"email": test_user.email, "hashed_password": "hashed_"+test_user.password, "id": "test_id_123"}
    db_user = UserInDB(**user_data_for_db_user)
    return {
        "input": test_user.model_dump(), # Pydantic v2 uses model_dump()
        "output": db_user.model_dump() # Pydantic v2 uses model_dump()
    }

app.include_router(auth.router)
app.include_router(goals.router)
app.include_router(preferences.router) # Included preferences router

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
    goal = await service.create_goal({
        "title": "Run 5km",
        "description": "Daily running goal",
        "category": test_category,
        "user_id": test_user,
        "target_value": 5,
        "current_value": 0,
        "status": "active"
    })
    print(f"Created goal: {goal.title} (ID: {goal.id})")
    
    # Test get
    fetched = await service.get_goal(goal.id)
    print(f"Fetched goal: {fetched.title if fetched else 'Not found'}")
    
    # Test update
    updated = await service.update_goal(goal.id, {"current_value": 1})
    print(f"Updated current_value to: {updated.current_value}")
    
    # Test category validation
    try:
        await service.create_goal({
            "title": "Invalid Category",
            "category": "invalid_category",
            "user_id": test_user
        })
    except ValueError as e:
        print(f"Category validation failed as expected: {e}")
    
    # Cleanup
    await service.delete_goal(goal.id)
    print("Test completed, cleanup done")

if __name__ == "__main__":
    asyncio.run(test_goal_service())