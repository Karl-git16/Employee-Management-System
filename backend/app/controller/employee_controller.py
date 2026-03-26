from fastapi import HTTPException
from app.model.employee_model import (
    get_all_employees, add_employee, update_employee,
    delete_employee, get_employees_by_department, get_employee_by_id
)
from app.schemas.employee_schema import Employee

# GET all employees
def fetch_all_employees():
    employees = get_all_employees()
    return [Employee(**emp) for emp in employees]


# ADD employee
def add_new_employee(employee_data: Employee):
    existing_employees = get_all_employees()

    if any(emp["employee_id"] == employee_data.employee_id for emp in existing_employees):
        raise HTTPException(status_code=400, detail="Employee with this ID already exists")  

    add_employee(employee_data.model_dump())
    return {"message": "Employee added successfully", "employee": employee_data}


# UPDATE employee
def update_existing_employee(employee_id: str, update_data: Employee):
    existing_employees = get_all_employees()

    if not any(emp["employee_id"] == employee_id for emp in existing_employees):
        raise HTTPException(status_code=404, detail="Employee not found")  

    update_employee(employee_id, update_data.model_dump(exclude_unset=True))

    updated_employees = get_all_employees()
    updated_employee = next(
        (emp for emp in updated_employees if emp["employee_id"] == employee_id),
        None
    )

    if updated_employee is None:
        raise HTTPException(status_code=404, detail="Employee not found after update")  

    return {
        "message": "Employee updated successfully",
        "employee": Employee(**updated_employee)
    }


# DELETE employee
def delete_existing_employee(employee_id: str):
    existing_employees = get_all_employees()

    if not any(emp["employee_id"] == employee_id for emp in existing_employees):
        raise HTTPException(status_code=404, detail="Employee not found")  

    delete_employee(employee_id)
    return {"message": "Employee deleted successfully"}


# GET by department
def fetch_employees_by_department(department: str):
    employees = get_employees_by_department(department)

    if not employees:
        raise HTTPException(status_code=404, detail="No employees found in this department")  

    return [Employee(**emp) for emp in employees]


# GET by ID
def fetch_employee_by_id(employee_id: str):
    employee = get_employee_by_id(employee_id)

    if employee is None:
        raise HTTPException(status_code=404, detail="Employee not found")  

    return Employee(**employee)