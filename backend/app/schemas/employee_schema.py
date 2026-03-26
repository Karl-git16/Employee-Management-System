#Defines Emplooyee schema for data validation and serialization
from pydantic import BaseModel, EmailStr
import datetime

class Employee(BaseModel):
    employee_id: str
    name: str
    email: EmailStr
    position: str
    department: str
    salary: float
    status: str

class EmployeeCreate(BaseModel):
    employee_id: str
    name: str
    email: EmailStr
    position: str
    department: str
    salary: float
    status: str
    createdAt: datetime.datetime = datetime.datetime.now()

class EmployeeUpdate(BaseModel):
    name: str | None = None
    email: EmailStr | None = None
    position: str | None = None
    department: str | None = None
    salary: float | None = None
    status: str | None = None
    updatedAt: datetime.datetime = datetime.datetime.now()

class EmployeeResponse(BaseModel):
    message: str
    employee: EmployeeCreate