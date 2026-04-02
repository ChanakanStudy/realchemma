from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import uuid4

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.core.security import create_access_token, verify_password, get_password_hash
from app.features.auth.schemas import UserRegister, UserLogin, TokenResponse

router = APIRouter()


def _serialize_user(user: User):
    return {
        "id": user.uuid,
        "legacy_id": user.id,
        "uuid": user.uuid,
        "username": user.username,
        "email": user.email,
        "name": user.name,
        "picture_url": user.picture_url,
        "chem_coin": user.chem_coin,
    }

@router.post("/register")
async def register(user_data: UserRegister, db: Session = Depends(get_db)):
    db_user = db.query(User).filter((User.username == user_data.username) | (User.email == user_data.email)).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username or email already registered")
        
    hashed_password = get_password_hash(user_data.password)
    new_user = User(
        uuid=str(uuid4()),
        username=user_data.username,
        email=user_data.email,
        hashed_password=hashed_password,
        name=user_data.username,
        chem_coin=0,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    access_token = create_access_token(data={"sub": new_user.uuid, "username": new_user.username})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": _serialize_user(new_user)
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
        
    access_token = create_access_token(data={"sub": user.uuid, "username": user.username})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": _serialize_user(user)
    }

@router.get("/me")
async def get_me(current_user: User = Depends(get_current_user)):
    return _serialize_user(current_user)
