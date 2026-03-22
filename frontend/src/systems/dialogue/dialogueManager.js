import { callGeminiAPI } from '/src/api/client.js?v=2';

let chatHistory = [];

export function openChat() {
    window.inChat = true;
    window.chatHistory = chatHistory;
    const chatUI = document.getElementById('chatUI');
    chatUI.style.display = 'flex';
}

export function closeChat() {
    window.inChat = false;
    document.getElementById('chatUI').style.display = 'none';
}

export async function sendMessage() {
    const input = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendBtn');
    const history = document.getElementById('chatHistory');
    const text = input.value.trim();

    if (!text) return;

    // User Message
    const userRow = document.createElement('div');
    userRow.className = 'message-row user-row';
    const userMsg = document.createElement('div');
    userMsg.className = 'message user-msg';
    userMsg.innerText = text;
    userRow.appendChild(userMsg);
    history.appendChild(userRow);
    input.value = '';

    // Disable UI
    input.disabled = true;
    sendBtn.disabled = true;
    
    // Typing
    const typingRow = document.createElement('div');
    typingRow.className = 'message-row bot-row';
    const typingMsg = document.createElement('div');
    typingMsg.className = 'message bot-msg typing-indicator';
    typingMsg.innerText = 'กำลังพินิจพิจารณาสูตรเคมี...';
    typingRow.appendChild(typingMsg);
    history.appendChild(typingRow);
    history.scrollTop = history.scrollHeight;

    const response = await callGeminiAPI(text);

    // Oracle Message
    history.removeChild(typingRow);
    const botRow = document.createElement('div');
    botRow.className = 'message-row bot-row';
    const oracleMsg = document.createElement('div');
    oracleMsg.className = 'message bot-msg';
    oracleMsg.innerText = response;
    botRow.appendChild(oracleMsg);
    history.appendChild(botRow);

    // Store in chat history for context
    chatHistory.push({ role: "user", content: text });
    chatHistory.push({ role: "assistant", content: response });

    input.disabled = false;
    sendBtn.disabled = false;
    input.focus();
    history.scrollTop = history.scrollHeight;
}
