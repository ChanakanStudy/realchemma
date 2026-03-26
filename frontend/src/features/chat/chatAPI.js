export async function callGeminiAPI(prompt, history = []) {
    try {
        const response = await fetch("/api/npc/npc-chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                message: prompt,
                history: history
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error("API Error Response:", errorData);
            return `💢 พลังงานปั่นป่วน (Error ${response.status}): เจ้าต้องการถามสิ่งใดนะ? ลองใหม่อีกครั้งได้ไหม`;
        }

        const data = await response.json();
        return data.reply || "พลังงานผันผวน ข้าไม่สามารถรวบรวมคำตอบได้ในขณะนี้...";
    } catch (error) {
        console.error("API Error:", error);
        return "💥 คลื่นพลังงานเวทมนตร์ถูกตัดขาด ไม่สามารถติดต่อกับหอสมุดเวทได้ในขณะนี้";
    }
}
