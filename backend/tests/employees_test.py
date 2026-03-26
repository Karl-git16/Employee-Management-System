import pytest

# Test GET /employees
def test_get_employees(client, base_url, seeded_employee):
    response = client.get(f"{base_url}/employees")
    assert response.status_code == 200
    data = response.json()

    assert isinstance(data, list)
    assert any(emp["name"] == seeded_employee["name"] for emp in data)


# Test POST /employees/employee
def test_add_employee(client, base_url, new_employee_payload):
    response = client.post(f"{base_url}/employees/employee", json=new_employee_payload)

    assert response.status_code == 201
    assert response.json()["message"] == "Employee added successfully"


# Test PUT /employees/{employee_id}
def test_update_employee(client, base_url, seeded_employee, update_payload):
    emp_id = seeded_employee["employee_id"]

    response = client.put(f"{base_url}/employees/{emp_id}", json=update_payload)

    assert response.status_code == 200
    assert response.json()["message"] == "Employee updated successfully"


# Test DELETE /employees/{employee_id}
def test_delete_employee(client, base_url, new_employee_id):
    response = client.delete(f"{base_url}/employees/{new_employee_id}")

    assert response.status_code == 200
    assert response.json()["message"] == "Employee deleted successfully"


# Test GET /employees/department/{department}
def test_get_employee_by_department(client, base_url, seeded_employee):
    dept = seeded_employee["department"]

    response = client.get(f"{base_url}/employees/department/{dept}")
    assert response.status_code == 200


# Test GET /employees/{employee_id}
def test_get_employee_by_id(client, base_url, seeded_employee):
    emp_id = seeded_employee["employee_id"]

    response = client.get(f"{base_url}/employees/{emp_id}")
    assert response.status_code == 200