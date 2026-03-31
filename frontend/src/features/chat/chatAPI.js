import { postNpcChat } from '../../api/client';

export async function callGeminiAPI(prompt, history = []) {
    try {
        const data = await postNpcChat(prompt, history);
        return data.reply || "พลังงานผันผวน ข้าไม่สามารถรวบรวมคำตอบได้ในขณะนี้...";
    } catch (error) {
        console.error("API Error:", error);
        return "💥 คลื่นพลังงานเวทมนตร์ถูกตัดขาด ไม่สามารถติดต่อกับหอสมุดเวทได้ในขณะนี้";
    }
}
