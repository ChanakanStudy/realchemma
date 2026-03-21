export async function callGeminiAPI(prompt) {
    try {
        const response = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt: prompt })
        });
        const data = await response.json();
        return data.response || "พลังงานผันผวน ข้าไม่สามารถรวบรวมคำตอบได้ในขณะนี้...";
    } catch (error) {
        console.error("API Error:", error);
        return "💥 คลื่นพลังงานเวทมนตร์ถูกตัดขาด ไม่สามารถติดต่อกับหอสมุดเวทได้ในขณะนี้";
    }
}
