import httpx
from app.core.config import GEMINI_API_KEY, SYSTEM_PROMPT

async def get_oracle_response(prompt: str) -> str:
    if not GEMINI_API_KEY:
        return "🔮 ขาดแหล่งพลังงาน (API Key ยังไม่ได้ตั้งค่าใน Backend) กรุณาแจ้งผู้ดูแลระบบ"

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key={GEMINI_API_KEY}"
    
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "systemInstruction": {"parts": [{"text": SYSTEM_PROMPT}]}
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(url, json=payload)
            response.raise_for_status()
            data = response.json()
            
            oracle_response = data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "พลังงานผันผวน ข้าไม่สามารถรวบรวมคำตอบได้ในขณะนี้...")
            return oracle_response
    except Exception as e:
        print(f"Error calling Gemini: {e}")
        return "💥 คลื่นพลังงานเวทมนตร์ถูกตัดขาด ไม่สามารถติดต่อกับหอสมุดเวทได้ในขณะนี้"
