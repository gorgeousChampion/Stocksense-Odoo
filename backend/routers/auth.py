import hashlib
import secrets

from fastapi import APIRouter, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from database import engine
from models import User
from schemas import RegisterRequest, LoginRequest, AuthResponse


router = APIRouter(prefix="/api/auth", tags=["Authentication"])


def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)

    password_hash = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode(),
        salt.encode(),
        100000
    ).hex()

    return f"{salt}${password_hash}"


def verify_password(password: str, stored_hash: str) -> bool:
    try:
        salt, password_hash = stored_hash.split("$")

        calculated_hash = hashlib.pbkdf2_hmac(
            "sha256",
            password.encode(),
            salt.encode(),
            100000
        ).hex()

        return secrets.compare_digest(
            calculated_hash,
            password_hash
        )

    except ValueError:
        return False


@router.post("/register", response_model=AuthResponse)
def register_user(user: RegisterRequest):
    with Session(engine) as db:

        existing_user = db.scalar(
            select(User).where(
                User.email == user.email.lower()
            )
        )

        if existing_user:
            raise HTTPException(
                status_code=400,
                detail="Email already registered"
            )

        new_user = User(
            first_name=user.first_name,
            last_name=user.last_name,
            email=user.email.lower(),
            password_hash=hash_password(user.password)
        )

        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        token = secrets.token_urlsafe(32)

        new_user.auth_token = token

        db.commit()

        return {
            "message": "Registration successful",
            "token": token,
            "user_id": new_user.id,
            "first_name": new_user.first_name,
            "last_name": new_user.last_name,
            "email": new_user.email
        }


@router.post("/login", response_model=AuthResponse)
def login_user(user: LoginRequest):
    with Session(engine) as db:

        existing_user = db.scalar(
            select(User).where(
                User.email == user.email.lower()
            )
        )

        if not existing_user:
            raise HTTPException(
                status_code=401,
                detail="Invalid email or password"
            )

        if not verify_password(
            user.password,
            existing_user.password_hash
        ):
            raise HTTPException(
                status_code=401,
                detail="Invalid email or password"
            )

        token = secrets.token_urlsafe(32)

        existing_user.auth_token = token

        db.commit()

        return {
            "message": "Login successful",
            "token": token,
            "user_id": existing_user.id,
            "first_name": existing_user.first_name,
            "last_name": existing_user.last_name,
            "email": existing_user.email
        }


@router.post("/logout")
def logout_user(token: str):
    with Session(engine) as db:

        user = db.scalar(
            select(User).where(
                User.auth_token == token
            )
        )

        if user:
            user.auth_token = None
            db.commit()

        return {
            "message": "Logged out successfully"
        }