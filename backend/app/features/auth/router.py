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

from fastapi import APIRouter

router = APIRouter()


# ---------------------------------------------------------------------------
# POST /api/auth/login
# ---------------------------------------------------------------------------
@router.post("/login")
async def login(body: dict):
    """
    Level 1: Frontend handles auth locally. This stub is reserved for Level 2.

    Level 2 implementation:
      - Validate email + password against DB
      - Return JWT access token + player profile
    """
    return {
        "status": "stub",
        "message": "Auth is handled client-side in Level 1. This endpoint is reserved for Level 2 (JWT).",
    }


# ---------------------------------------------------------------------------
# POST /api/auth/register
# ---------------------------------------------------------------------------
@router.post("/register")
async def register(body: dict):
    """
    Level 2 implementation:
      - Validate email format, check uniqueness in DB
      - Hash password with bcrypt
      - Insert new user, return JWT
    """
    return {
        "status": "stub",
        "message": "Registration not yet implemented. Reserved for Level 2.",
    }


# ---------------------------------------------------------------------------
# GET /api/auth/me
# ---------------------------------------------------------------------------
@router.get("/me")
async def me():
    """
    Level 2 implementation:
      - Decode JWT from Authorization: Bearer <token> header
      - Return full player profile from DB
    """
    return {
        "status": "stub",
        "message": "Session validation not yet implemented. Reserved for Level 2.",
    }
