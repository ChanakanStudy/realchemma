import React, { useState, useEffect, useRef } from 'react';
import { useGameContext } from '../../core/GameContext';
import { callGeminiAPI } from './chatAPI';
import { formatFormula } from '../../core/utils';
import { eventBus } from '../../core/EventBus';
import { EVENTS } from '../../core/constants';

export default function ChatScreen() {
    const { chatOpen, setChatOpen } = useGameContext();
    const [chatMessages, setChatMessages] = useState([
        { type: 'oracle', text: 'ยินดีต้อนรับนักเรียนเจ้าแห่งศาสตร์เคมี... เจ้ามีคำถามใดจะถามหรือไม่?' },
    ]);
    const [chatInput, setChatInput] = useState('');
    const [chatLoading, setChatLoading] = useState(false);
    
    const chatHistoryRef = useRef(null);
    const chatInputRef = useRef(null);

    // Auto-scroll on new messages
    useEffect(() => {
        if (chatHistoryRef.current) {
            chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
        }
    }, [chatMessages, chatLoading, chatOpen]);

    // Focus input when opened
    useEffect(() => {
        if (chatOpen && chatInputRef.current) {
            setTimeout(() => chatInputRef.current.focus(), 100);
        }

        // Listener for triggered prompts (e.g. from Inventory)
        const handleTriggerPrompt = (prompt) => {
            setChatOpen(true);
            // We need to wait for state update or use a ref-like approach
            // But here we can just call sendMessage with the prompt directly
            if (prompt) {
                setTimeout(() => {
                    executeSendMessage(prompt);
                }, 300);
            }
        };

        const unsub = eventBus.on(EVENTS.TRIGGER_CHAT_WITH_PROMPT, handleTriggerPrompt);
        return () => unsub();
    }, [chatOpen, setChatOpen]);

    const executeSendMessage = async (text) => {
        if (!text || chatLoading) return;

        try {
            setChatMessages(prev => [...prev, { type: 'user', text }]);
            setChatInput('');
            setChatLoading(true);

            const historyPayload = chatMessages.map(msg => ({
                role: msg.type === 'user' ? 'user' : 'assistant',
                content: msg.text
            }));

            const response = await callGeminiAPI(text, historyPayload);
            setChatMessages(prev => [...prev, { type: 'oracle', text: response }]);
        } catch (error) {
            console.error("Chat Error:", error);
            setChatMessages(prev => [...prev, { 
                type: 'oracle', 
                text: "💥 พลังงานผันผวน... ข้าไม่สามารถตอบได้ในขณะนี้" 
            }]);
        } finally {
            setChatLoading(false);
        }
    };

    const sendMessage = () => executeSendMessage(chatInput.trim());

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') sendMessage();
    };

    if (!chatOpen) return null;

    return (
        <div className="chat-modal-overlay">
            <div id="chatUI" className="chat-container flex">
            <div className="chat-header">
                🧪 CHEMMA Lab Assistant
                <button className="close-chat" onClick={() => setChatOpen(false)}>×</button>
            </div>
            
            <div className="chat-box" id="chatHistory" ref={chatHistoryRef}>
                {chatMessages.map((msg, i) => (
                    <div key={i} className={msg.type === 'user' ? 'message-row user-row' : 'message-row bot-row'}>
                        <div 
                            className={msg.type === 'user' ? 'message user-msg' : 'message bot-msg'}
                            dangerouslySetInnerHTML={{ __html: formatFormula(msg.text) }}
                        />
                    </div>
                ))}
                
                {chatLoading && (
                    <div className="message-row bot-row">
                        <div className="message bot-msg typing-indicator">
                            กำลังคิดสูตรเคมี...
                        </div>
                    </div>
                )}
            </div>
            
            <div className="input-area">
                <input
                    type="text"
                    id="chatInput"
                    ref={chatInputRef}
                    placeholder="พิมพ์ถามเกี่ยวกับวิชาเคมี..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={chatLoading}
                />
                <button
                    id="sendBtn"
                    onClick={sendMessage}
                    disabled={chatLoading}
                    title="ส่งข้อความ"
                >
                    🚀
                </button>
            </div>
            </div>
        </div>
    );
}
