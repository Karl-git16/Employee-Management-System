import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

#Test cases for GET /employees endpoint to list all employees
def test_get_employees():
    response = client.get("/employees")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    assert any(emp["name"] == "John Doe" for emp in response.json())
    assert any(emp["name"] != "Jane Doe" for emp in response.json())

#Test case for POST /employee endpoint to add a new employee (if implemented)
def test_add_employee():
    payload = {
        "employee_id": "EMP002",
        "name": "Jane Doe",
        "email": "jane.doe@example.com",
        "position": "Product Manager",
        "department": "Product",
        "salary": 90000,
        "status": "active"
    }
    response = client.post("/employees/employee", json=payload)
    assert response.status_code == 201 #condition1
    assert response.json()["message"] == "Employee added successfully" #condition2

#Test case for PUT /employees/{employee_id} endpoint to update an existing employee (if implemented)
def test_update_employee():
    # Implement test case for updating an employee using /employees/{employee_id} endpoint
    payload = {
        "name": "John Doe Updated",
        "email": "john.doe.updated@example.com",
    }
    response = client.put("/employees/EMP001", json=payload)
    assert response.status_code == 200
    assert response.json()["message"] == "Employee updated successfully"

#Test case for DELETE /employees/{employee_id} endpoint to delete an employee (if implemented)
def test_delete_employee():
    # Implement test case for deleting an employee using /employees/{employee_id} endpoint
    response = client.delete("/employees/EMP002")
    assert response.status_code == 200
    assert response.json()["message"] == "Employee deleted successfully"

#Test case for GET /employees/department/{department} endpoint to get an employee by department (if implemented)
def test_get_employee_by_department():
    # Implement test case for getting employees by department using /employees/department/{department} endpoint
    response = client.get("/employees/department/Engineering")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    assert any(emp["name"] == "John Doe Updated" for emp in response.json())
    
#Test case for GET /employees/{employee_id} endpoint to get an employee by ID (if implemented)
def test_get_employee_by_id():
    # Implement test case for getting an employee by ID using /employees/{employee_id} endpoint
    response = client.get("/employees/EMP001")
    assert response.status_code == 200
    assert response.json()["name"] == "John Doe Updated"

