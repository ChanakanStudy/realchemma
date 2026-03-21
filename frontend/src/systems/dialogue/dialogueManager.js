import { callGeminiAPI } from '/src/api/client.js?v=2';

export function openChat() {
    window.inChat = true;
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
    const userMsg = document.createElement('div');
    userMsg.className = 'chat-msg msg-user';
    userMsg.innerText = text;
    history.appendChild(userMsg);
    input.value = '';

    // Disable UI
    input.disabled = true;
    sendBtn.disabled = true;
    const typing = document.createElement('div');
    typing.className = 'chat-msg msg-oracle typing-indicator';
    typing.innerText = 'กำลังรวบรวมพลังเวท...';
    history.appendChild(typing);
    history.scrollTop = history.scrollHeight;

    const response = await callGeminiAPI(text);

    // Oracle Message
    history.removeChild(typing);
    const oracleMsg = document.createElement('div');
    oracleMsg.className = 'chat-msg msg-oracle';
    oracleMsg.innerText = response;
    history.appendChild(oracleMsg);

    input.disabled = false;
    sendBtn.disabled = false;
    input.focus();
    history.scrollTop = history.scrollHeight;
}
