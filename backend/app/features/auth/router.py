"""
auth/router.py — Authentication Routes (Level 1 Stub)

Current state: Returns mock responses. No real DB or JWT yet.

UPGRADE PATH TO LEVEL 2 (JWT Auth):
  1. Install: pip install python-jose[cryptography] passlib[bcrypt] sqlalchemy
  2. Replace the stub implementations below with real logic:
     - login: query DB, verify password hash, return signed JWT
     - register: hash password, insert user into DB
     - me: decode JWT from Authorization header, return user profile
  3. Uncomment the JWT_SECRET_KEY in .env and configure it.

No changes needed in main.py or frontend AuthContext — the adapter handles everything.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.core.security import create_access_token, verify_password, get_password_hash
from jose import jwt, JWTError
from app.core.security import SECRET_KEY, ALGORITHM
from app.features.auth.schemas import UserRegister, UserLogin, TokenResponse

router = APIRouter()

@router.post("/register")
async def register(user_data: UserRegister, db: Session = Depends(get_db)):
    db_user = db.query(User).filter((User.username == user_data.username) | (User.email == user_data.email)).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username or email already registered")
        
    hashed_password = get_password_hash(user_data.password)
    new_user = User(
        username=user_data.username,
        email=user_data.email,
        hashed_password=hashed_password,
        name=user_data.username
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    access_token = create_access_token(data={"sub": str(new_user.id), "username": new_user.username})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": new_user.id,
            "username": new_user.username,
            "email": new_user.email,
            "name": new_user.name
        }
    }

@router.post("/login")
async def login(user_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(
        (User.username == user_data.username_or_email) | (User.email == user_data.username_or_email)
    ).first()
    
    if not user or not user.hashed_password:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
        
    if not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
        
    access_token = create_access_token(data={"sub": str(user.id), "username": user.username})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "name": user.name
        }
    }

async def get_current_user(authorization: str = Header(None), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not authorization or not authorization.startswith("Bearer "):
        raise credentials_exception
        
    token = authorization.split(" ")[1]
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        raise credentials_exception
    return user

@router.get("/me")
async def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "username": current_user.username,
        "name": current_user.name,
        "email": current_user.email,
        "picture_url": current_user.picture_url
    }
