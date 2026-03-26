#Query the database for employee information
from app.config.database import employees_collection
from app.schemas.employee_schema import Employee, EmployeeResponse

#GET request to retrieve all employees from the database
def get_all_employees():
    return list(employees_collection.find({}, {"_id": 0}))

#POST request to add a new employee to the database (if implemented)
def add_employee(employee_data: dict):
    return employees_collection.insert_one(employee_data)

#PUT request to update an existing employee in the database (if implemented)
def update_employee(employee_id: str, update_data: dict):
    return employees_collection.update_one({"employee_id": employee_id}, {"$set": update_data})

#DELETE request to delete an employee from the database (if implemented)
def delete_employee(employee_id: str):
    return employees_collection.delete_one({"employee_id": employee_id})

#GET request to retrieve employees by department from the database (if implemented)
def get_employees_by_department(department: str):
    return list(employees_collection.find({"department": department}, {"_id": 0}))

#GET request to retrieve an employee by ID from the database (if implemented)
def get_employee_by_id(employee_id: str):
    return employees_collection.find_one({"employee_id": employee_id}, {"_id": 0})
