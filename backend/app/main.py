from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import user
import uvicorn
import os

from app.features.battle.router import router as battle_router
from app.features.npc.router import router as npc_router
from app.features.questions.router import router as questions_router
from app.routes import user

app = FastAPI(title="CHEMMA API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def health_check():
    return {"status": "ok", "message": "Chemma Oracle Backend is running"}

app.include_router(questions_router, prefix="/api", tags=["Questions"])
app.include_router(npc_router, prefix="/api/npc", tags=["NPC"])
app.include_router(battle_router, prefix="/api/battle", tags=["Battle"])
app.include_router(user.router, prefix="/api/user", tags=["User"])

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
