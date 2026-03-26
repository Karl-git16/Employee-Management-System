from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import HTTPBasic, HTTPBasicCredentials
import secrets

app = FastAPI()

# Fake database
employees = [
    {"id": 0, "name": "John Doe", "position": "Software Engineer"},
    {"id": 1, "name": "Jane Smith", "position": "Product Manager"},
]

# Security setup
security = HTTPBasic()

# Hardcoded users
users_db = {
    "admin": {"password": "admin123", "role": "admin"},
    "user": {"password": "user123", "role": "user"},
}

# Authenticate user
def get_current_user(credentials: HTTPBasicCredentials = Depends(security)):
    username = credentials.username
    password = credentials.password

    if username not in users_db:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
            headers={"WWW-Authenticate": "Basic"},
        )

    user = users_db[username]

    if not secrets.compare_digest(password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
            headers={"WWW-Authenticate": "Basic"},
        )

    return {"username": username, "role": user["role"]}

# Admin-only check - RBAC
def get_admin_user(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return current_user

# Routes

@app.get("/employees")
def get_employees(current_user: dict = Depends(get_current_user)):
    return employees


@app.post("/employees")
def create_employee(emp: dict, current_user: dict = Depends(get_admin_user)):
    employees.append(emp)
    return emp


@app.get("/employees/{id}")
def get_employee(id: int, current_user: dict = Depends(get_current_user)):
    return employees[id]


@app.put("/employees/{id}")
def update_employee(id: int, emp: dict, current_user: dict = Depends(get_admin_user)):
    employees[id] = emp
    return emp


@app.delete("/employees/{id}")
def delete_employee(id: int, current_user: dict = Depends(get_admin_user)):
    return employees.pop(id)