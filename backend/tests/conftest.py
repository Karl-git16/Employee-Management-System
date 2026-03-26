import pytest
from fastapi.testclient import TestClient
from app.main import app
import uuid

def pytest_addoption(parser):
    parser.addoption("--base-url", action="store", default="", help="Base URL prefix")
    parser.addoption("--employee-id", action="store", default="EMP001")
    parser.addoption("--new-employee-id", action="store", default="EMP002")
    parser.addoption("--department", action="store", default="Engineering")

@pytest.fixture
def client():
    return TestClient(app)

@pytest.fixture
def base_url(request):
    return request.config.getoption("--base-url")

@pytest.fixture
def employee_id(request):
    return request.config.getoption("--employee-id")

@pytest.fixture
def new_employee_id(request):
    return request.config.getoption("--new-employee-id")

@pytest.fixture
def department(request):
    return request.config.getoption("--department")

@pytest.fixture
def new_employee_payload(new_employee_id):
    return {
        "employee_id": new_employee_id,
        "name": "Jane Doe",
        "email": "jane.doe@example.com",
        "position": "Product Manager",
        "department": "Product",
        "salary": 90000,
        "status": "active"
    }

@pytest.fixture
def update_payload():
    return {
        "name": "John Doe Updated",
        "email": "john.doe.updated@example.com",
    }


@pytest.fixture
def seeded_employee(client):
    unique_id = f"EMP_{uuid.uuid4().hex[:6]}"

    payload = {
        "employee_id": unique_id,
        "name": "John Doe",
        "email": f"{unique_id}@example.com",
        "position": "Engineer",
        "department": "Engineering",
        "salary": 80000,
        "status": "active"
    }

    response = client.post("/employees/employee", json=payload)
    assert response.status_code in [200, 201], response.json()

    return payload