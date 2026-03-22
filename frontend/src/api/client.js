export async function callGeminiAPI(prompt) {
    try {
        const response = await fetch("http://localhost:8001/api/npc-chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                message: prompt,
                history: window.chatHistory || []
            })
        });
        const data = await response.json();
        return data.reply || "พลังงานผันผวน ข้าไม่สามารถรวบรวมคำตอบได้ในขณะนี้...";
    } catch (error) {
        console.error("API Error:", error);
        return "💥 คลื่นพลังงานเวทมนตร์ถูกตัดขาด ไม่สามารถติดต่อกับหอสมุดเวทได้ในขณะนี้";
    }
}
