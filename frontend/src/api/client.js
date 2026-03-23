export async function callGeminiAPI(prompt, history = []) {
    try {
        const response = await fetch("/api/npc-chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                message: prompt,
                history: history
            })
        });
        const data = await response.json();
        return data.reply || "พลังงานผันผวน ข้าไม่สามารถรวบรวมคำตอบได้ในขณะนี้...";
    } catch (error) {
        console.error("API Error:", error);
        return "💥 คลื่นพลังงานเวทมนตร์ถูกตัดขาด ไม่สามารถติดต่อกับหอสมุดเวทได้ในขณะนี้";
    }
}
