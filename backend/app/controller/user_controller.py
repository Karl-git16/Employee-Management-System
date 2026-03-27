from app.model.user_model import create_user, get_user_by_username, update_activity
from app.utils.utils import hash_password, verify_password, create_access_token
from fastapi import HTTPException

def register_new_user(data, current_user=None):
    existing = get_user_by_username(data.username)
    if existing:
        raise HTTPException(status_code=409, detail="User already exists")

    # Allow first user to be any role, else only admin can assign roles other than "user"
    from app.db import user_collection
    user_count = user_collection.count_documents({})
    if user_count == 0:
        role = data.role
    elif current_user and current_user.get("role") == "admin":
        role = data.role
    else:
        role = "user"

    user_dict = {
        "username": data.username,
        "email": data.email,
        "password": hash_password(data.password),
        "role": role,
        "department": getattr(data, "department", None) if hasattr(data, "department") else None,
        "position": getattr(data, "position", None) if hasattr(data, "position") else None,
        "activitylog": []
    }

    result = create_user(user_dict)
    return {"msg": "User created", "id": str(result.inserted_id)}

def login_user(data):
    user = get_user_by_username(data.username)

    if not user or not verify_password(data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({
        "username": user["username"],
        "role": user["role"],
        "email": user["email"],
    })

    # Log activity
    update_activity(str(user["_id"]), "User logged in")

    return {"token": token, "role": user["role"]}