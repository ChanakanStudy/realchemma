from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import questions, npc

app = FastAPI(title="Chemma Oracle API")

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

app.include_router(questions.router, prefix="/api", tags=["Oracle"])
app.include_router(npc.router, prefix="/api", tags=["NPC"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
