from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta, timezone
from fastapi import HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer
import os
from dotenv import load_dotenv
from uuid import uuid4

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES"))

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

# Password
def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(plain, hashed):
    return pwd_context.verify(plain, hashed)

# JWT
def create_access_token(data: dict):
    to_encode = data.copy()
    now = datetime.now(timezone.utc)
    expire = now + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({
        "exp": expire,      # ✅ correct expiry
        "iat": now,         # ✅ issued-at is NOW, not future
        "jti": str(uuid4())
    })
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str):
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Dependency
def get_current_user(token: str = Depends(oauth2_scheme)):
    payload = decode_token(token)
    return payload

def admin_required(user=Depends(get_current_user)):
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    return user

# Add below existing code

ROLE_PERMISSIONS = {
    "admin":   ["create_user", "delete_user", "view_users", "update_user", "view_employees", "view_self"],
    "manager": ["view_users", "update_user", "view_employees", "view_self"],
    "user":    ["view_self", "view_employees"],
}

def check_permission(user_role: str, required_permission: str):
    permissions = ROLE_PERMISSIONS.get(user_role, [])
    return required_permission in permissions


def permission_required(permission: str):
    def wrapper(user=Depends(get_current_user)):
        role = user.get("role")

        if not check_permission(role, permission):
            raise HTTPException(
                status_code=403,
                detail=f"Permission '{permission}' required"
            )
        return user
    return wrapper