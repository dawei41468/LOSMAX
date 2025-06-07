from typing import Optional, List
from models.user import User
from database import get_db
from bson import ObjectId

class AdminService:
    @staticmethod
    async def list_users(
        page: int = 1,
        limit: int = 10,
        search_query: Optional[str] = None,
        role_filter: Optional[str] = None
    ) -> List[dict]:
        skip = (page - 1) * limit
        query = {}
        
        if search_query:
            query["$or"] = [
                {"email": {"$regex": search_query, "$options": "i"}},
                {"name": {"$regex": search_query, "$options": "i"}}
            ]
            
        if role_filter:
            query["role"] = {"$regex": f"^{role_filter}$", "$options": "i"}
            
        db = await get_db()
        cursor = db.users.find(query, {"password": 0, "refresh_tokens": 0})
        users = await cursor.skip(skip).limit(limit).to_list(length=limit)
        
        return [
            {
                "id": str(user["_id"]),
                "email": user["email"],
                "name": user.get("name"),
                "role": user.get("role", "user"),
                "createdAt": user.get("created_at")
            }
            for user in users
        ]

    @staticmethod
    async def delete_user(user_id: str) -> None:
        try:
            db = await get_db()
            result = await db.users.delete_one({"_id": ObjectId(user_id)})
            if result.deleted_count == 0:
                raise ValueError("User not found")
        except Exception as e:
            raise ValueError(str(e))