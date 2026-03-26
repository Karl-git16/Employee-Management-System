#All API routes are defined here
from fastapi import APIRouter, Depends
from app.controller.employee_controller import fetch_all_employees, add_new_employee, update_existing_employee, delete_existing_employee, fetch_employees_by_department, fetch_employee_by_id
from app.schemas.employee_schema import Employee, EmployeeCreate, EmployeeResponse, EmployeeUpdate
import datetime
from app.utils.utils import permission_required

router = APIRouter()

#GET endpoint to retrieve all employees and add RBAC

@router.get("/", response_model=list[Employee])
def get_employees(user=Depends(permission_required("view_employees"))):
    return fetch_all_employees()

#POST endpoint to add a new employee (if implemented)
@router.post("/employee", response_model=EmployeeResponse, status_code=201)
def add_employee(employee: EmployeeCreate):
    employee.createdAt = datetime.datetime.now()
    add_new_employee(employee)
    return {"message": "Employee added successfully", "employee": employee}
    
#PUT endpoint to update an existing employee (if implemented)
@router.put("/{employee_id}", response_model=EmployeeResponse)
def update_employee(employee_id: str, update_data: EmployeeUpdate):
    update_data.updatedAt = datetime.datetime.now()
    result = update_existing_employee(employee_id, update_data)
    return result

#DELETE endpoint to delete an employee (if implemented)
@router.delete("/{employee_id}")
def delete_employee(employee_id: str):
    return delete_existing_employee(employee_id) 

#GET endpoint to retrieve employees by department (if implemented)
@router.get("/department/{department}", response_model=list[Employee])
def get_employees_by_department(department: str):
    return fetch_employees_by_department(department)

#GET endpoint to retrieve an employee by ID (if implemented)
@router.get("/{employee_id}", response_model=Employee)
def get_employee_by_id(employee_id: str):
    return fetch_employee_by_id(employee_id)
