from fastapi import APIRouter, Depends
from app.schemas.user_schema import UserCreate, UserLogin
from app.controller.user_controller import register_new_user, login_user
from app.utils.utils import permission_required, get_current_user, admin_required
from app.db import user_collection
router = APIRouter()

# 🔓 Public
@router.post("/register")
def register(user: UserCreate):
    return register_new_user(user)

@router.post("/login")
def login(user: UserLogin):
    return login_user(user)

# 👤 User can view own profile
@router.get("/me")
def get_profile(user=Depends(permission_required("view_self"))):
    return {"user": user}

# 👥 Manager/Admin can view all users
@router.get("/")
def get_all_users(user=Depends(permission_required("view_users"))):
    users = list(user_collection.find({}, {"password": 0}))  # exclude passwords
    for u in users:
        u["_id"] = str(u["_id"])
    return users

# ✏️ Manager/Admin can update users
@router.put("/{user_id}")
def update_user(user=Depends(permission_required("update_user"))):
    return {"msg": "User updated"}

# ❌ Only Admin can delete
@router.delete("/{user_id}")
def delete_user(user=Depends(permission_required("delete_user"))):
    return {"msg": "User deleted"}


@router.get("/admin")
def admin_only(user=Depends(admin_required)):
    return {"msg": "Welcome admin"}