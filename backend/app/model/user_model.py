from app.db import user_collection
from bson import ObjectId
from datetime import datetime

def create_user(user_data: dict):
    # Ensure department and position fields exist
    if "department" not in user_data:
        user_data["department"] = None
    if "position" not in user_data:
        user_data["position"] = None
    return user_collection.insert_one(user_data)

def get_user_by_username(username: str):
    return user_collection.find_one({"username": username})

def update_activity(user_id: str, action: str):
    activity = {
        "action": action,
        "timestamp": datetime.utcnow()
    }
    user_collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$push": {"activitylog": activity}}
    )