from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime

class ActivityLog(BaseModel):
    action: str
    timestamp: datetime

from pydantic import BaseModel, EmailStr, field_validator


class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    role: Optional[str] = "user"
    department: Optional[str] = None
    position: Optional[str] = None

    @field_validator("password")
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        if not any(c.isupper() for c in v):
            raise ValueError("Password must contain uppercase letter")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain a number")
        return v

class UserLogin(BaseModel):
    username: str
    password: str

class User(BaseModel):
    userid: Optional[str]
    username: str
    email: EmailStr
    role: str = "user"
    department: Optional[str] = None
    position: Optional[str] = None
    activitylog: List[ActivityLog] = []
    