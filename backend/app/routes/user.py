from fastapi import APIRouter, HTTPException
from app.models.schemas import UserProfile
import json
import os

router = APIRouter()

PROFILES_FILE = "student_profiles.json"

@router.post("/user/save")
async def save_user(profile: UserProfile):
    try:
        data = {}
        if os.path.exists(PROFILES_FILE):
            with open(PROFILES_FILE, "r") as f:
                data = json.load(f)
        
        data[profile.userId] = profile.dict()
        
        with open(PROFILES_FILE, "w") as f:
            json.dump(data, f, indent=4)
            
        return {"status": "success", "message": f"Profile saved for {profile.userId}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/user/load/{user_id}")
async def load_user(user_id: str):
    if not os.path.exists(PROFILES_FILE):
        return {"status": "not_found", "message": "No profiles found"}
    
    try:
        with open(PROFILES_FILE, "r") as f:
            data = json.load(f)
            
        if user_id in data:
            return {"status": "success", "data": data[user_id]}
        else:
            return {"status": "not_found", "message": "User profile not found"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
