import pytest
from fastapi.testclient import TestClient
from fastapi import status
from datetime import datetime, timedelta, timezone
from jose import jwt
import os

from app.main import app
from app.utils.utils import SECRET_KEY, ALGORITHM
from app.db import user_collection

# Override env if needed
SECRET_KEY = os.getenv("SECRET_KEY", "testsecret")
ALGORITHM = os.getenv("ALGORITHM", "HS256")


# ---------------------------
# 🔧 Fixtures
# ---------------------------

@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture(autouse=True)
def clear_db():
    """Clear DB before & after each test"""
    user_collection.delete_many({})
    yield
    user_collection.delete_many({})


@pytest.fixture
def test_user(client):
    payload = {
        "username": "testuser",
        "email": "test@example.com",
        "password": "StrongPass123!",
        "department": "Engineering",
        "position": "Developer"
    }
    client.post("/auth/register", json=payload)
    return payload


@pytest.fixture
def admin_user(client):
    payload = {
        "username": "adminuser",
        "email": "admin@example.com",
        "password": "StrongPass123!",
        "role": "admin",
        "department": "Management",
        "position": "Admin"
    }
    client.post("/auth/register", json=payload)
    return payload


@pytest.fixture
def auth_token(client, test_user):
    res = client.post("/auth/login", json={
        "username": test_user["username"],
        "password": test_user["password"]
    })
    return res.json()["access_token"]


@pytest.fixture
def admin_token(client, admin_user):
    res = client.post("/auth/login", json={
        "username": admin_user["username"],
        "password": admin_user["password"]
    })
    return res.json()["access_token"]


def create_expired_token(username="testuser", role="user"):
    payload = {
        "username": username,
        "role": role,
        "exp": datetime.now(timezone.utc) - timedelta(minutes=1)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


# ---------------------------
# 🧪 Tests
# ---------------------------

def test_register_user_success(client):
    res = client.post("/auth/register", json={
        "username": "newuser",
        "email": "new@example.com",
        "password": "StrongPass123!",
        "department": "Engineering",
        "position": "Developer"
    })
    assert res.status_code == status.HTTP_200_OK
    assert "id" in res.json()


def test_register_duplicate_username_returns_409(client, test_user):
    res = client.post("/auth/register", json=test_user)
    assert res.status_code == status.HTTP_409_CONFLICT


def test_register_weak_password_returns_422(client):
    res = client.post("/auth/register", json={
        "username": "weakuser",
        "email": "weak@example.com",
        "password": "123",
        "department": "Engineering",
        "position": "Developer"
    })
    assert res.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


def test_login_success_returns_jwt(client, test_user):
    res = client.post("/auth/login", json={
        "username": test_user["username"],
        "password": test_user["password"]
    })
    assert res.status_code == status.HTTP_200_OK
    assert "access_token" in res.json()


def test_login_wrong_password_returns_401(client, test_user):
    res = client.post("/auth/login", json={
        "username": test_user["username"],
        "password": "WrongPassword!"
    })
    assert res.status_code == status.HTTP_401_UNAUTHORIZED
    assert res.json()["detail"] == "Invalid credentials"


def test_login_nonexistent_user_returns_401(client):
    res = client.post("/auth/login", json={
        "username": "ghost",
        "password": "SomePassword123!"
    })
    assert res.status_code == status.HTTP_401_UNAUTHORIZED
    assert res.json()["detail"] == "Invalid credentials"


def test_protected_route_without_token_returns_401(client):
    res = client.get("/auth/me")
    assert res.status_code == status.HTTP_401_UNAUTHORIZED


def test_protected_route_with_valid_token_succeeds(client, auth_token):
    res = client.get(
        "/auth/me",
        headers={"Authorization": f"Bearer {auth_token}"}
    )
    assert res.status_code == status.HTTP_200_OK


def test_protected_route_with_expired_token_returns_401(client):
    expired_token = create_expired_token()

    res = client.get(
        "/auth/me",
        headers={"Authorization": f"Bearer {expired_token}"}
    )
    assert res.status_code == status.HTTP_401_UNAUTHORIZED


def test_admin_route_with_user_role_returns_403(client, auth_token):
    res = client.get(
        "/auth/admin",
        headers={"Authorization": f"Bearer {auth_token}"}
    )
    assert res.status_code == status.HTTP_403_FORBIDDEN


# ---------------------------
# 🔥 Additional Coverage
# ---------------------------

def test_admin_route_with_admin_role_succeeds(client, admin_token):
    res = client.get(
        "/auth/admin",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert res.status_code == status.HTTP_200_OK


def test_token_tampering_returns_401(client, auth_token):
    tampered = auth_token + "corrupted"

    res = client.get(
        "/auth/me",
        headers={"Authorization": f"Bearer {tampered}"}
    )
    assert res.status_code == status.HTTP_401_UNAUTHORIZED


def test_missing_bearer_prefix_returns_401(client, auth_token):
    res = client.get(
        "/auth/me",
        headers={"Authorization": auth_token}
    )
    assert res.status_code == status.HTTP_401_UNAUTHORIZED


def test_register_missing_fields_returns_422(client):
    res = client.post("/auth/register", json={
        "username": "incomplete"
    })
    assert res.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


def test_login_missing_fields_returns_422(client):
    res = client.post("/auth/login", json={
        "username": "test"
    })
    assert res.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


def test_multiple_logins_generate_different_tokens(client, test_user):
    res1 = client.post("/auth/login", json=test_user)
    res2 = client.post("/auth/login", json=test_user)

    assert res1.json()["access_token"] != res2.json()["access_token"]