import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createGame } from './game/phaserGame';
import { callGeminiAPI } from './api/client';
import BattleScene from './components/battle/BattleScene';

export default function App() {
  const [gameState, setGameState] = useState('MENU');
  const [chatMessages, setChatMessages] = useState([
    { type: 'oracle', text: 'ยินดีต้อนรับนักเรียนเจ้าแห่งศาสตร์เคมี... เจ้ามีคำถามใดจะถามหรือไม่?' },
  ]);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatHistoryRef = useRef(null);
  const chatInputRef = useRef(null);
  const gameInitialized = useRef(false);

  // Initialize Phaser once game state becomes GAME
  useEffect(() => {
    if (gameState === 'GAME' && !gameInitialized.current) {
      gameInitialized.current = true;
      createGame('game-container');
    }
  }, [gameState]);

  // Expose game flow functions for Phaser WorldScene to call
  useEffect(() => {
    window.openChat = () => {
      window.inChat = true;
      setChatOpen(true);
    };
    window.closeChat = () => {
      window.inChat = false;
      setChatOpen(false);
    };
    window.startBattle = () => {
      setGameState('BATTLE');
      if (window.pScene) window.pScene.scene.pause();
    };
    window.quitBattle = () => {
      setGameState('GAME');
      if (window.pScene) window.pScene.scene.resume();
    };
    window.gameState = gameState;
    window.inChat = chatOpen;

    return () => {
      delete window.openChat;
      delete window.closeChat;
      delete window.startBattle;
      delete window.quitBattle;
    };
  }, [gameState, chatOpen]);

  // Keep window.gameState in sync
  useEffect(() => {
    window.gameState = gameState;
  }, [gameState]);

  // Scroll chat to bottom
  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [chatMessages, chatLoading]);

  const enterGame = useCallback(() => {
    const flash = document.getElementById('flashScreen');
    flash.style.opacity = '1';

    setTimeout(() => {
      setGameState('GAME');
      document.getElementById('game-container').style.display = 'block';
      
      // Reliable resume: poll until pScene is ready (fixes race condition)
      const resumeCheck = setInterval(() => {
        if (window.pScene) {
          window.pScene.scene.resume();
          clearInterval(resumeCheck);
        }
      }, 200);

      flash.style.transition = 'opacity 2s ease-out';
      flash.style.opacity = '0';
    }, 1000);
  }, []);

  const sendMessage = useCallback(async () => {
    const text = chatInput.trim();
    if (!text || chatLoading) return;

    setChatMessages(prev => [...prev, { type: 'user', text }]);
    setChatInput('');
    setChatLoading(true);

    const historyPayload = chatMessages.map(msg => ({
      role: msg.type === 'user' ? 'user' : 'assistant',
      content: msg.text
    }));

    const response = await callGeminiAPI(text, historyPayload);

    setChatMessages(prev => [...prev, { type: 'oracle', text: response }]);
    setChatLoading(false);
    if (chatInputRef.current) chatInputRef.current.focus();
  }, [chatInput, chatLoading]);

  const handleChatKeyPress = useCallback((e) => {
    if (e.key === 'Enter') sendMessage();
  }, [sendMessage]);

  const closeChat = useCallback(() => {
    window.inChat = false;
    setChatOpen(false);
  }, []);

  return (
    <>
      <div id="game-container"></div>

      {/* --- Main Menu UI --- */}
      {gameState === 'MENU' && (
        <div id="menuUI">
          <div className="logo-container">
            <h1 className="game-title">CHEMMA</h1>
            <p className="game-subtitle">THE ALCHEMIST ACADEMY</p>
          </div>

          <div className="start-prompt" onClick={enterGame}>
            CLICK TO ENTER ACADEMY
          </div>

          <div className="side-menu">
            <div className="icon-btn">⚙️</div>
            <div className="icon-btn">🏆</div>
          </div>
        </div>
      )}

      {/* --- Game HUD --- */}
      {gameState === 'GAME' && (
        <div id="gameHUD" style={{ display: 'block' }}>
          <div className="player-status">
            <div className="avatar">🧙</div>
            <div className="bars">
              <div className="bar-bg"><div id="hpFill" className="hp-fill"></div></div>
              <div className="bar-bg"><div id="mpFill" className="mp-fill"></div></div>
            </div>
            <div className="level-badge">1</div>
          </div>
          <div className="minimap-container">MINIMAP</div>
          <div className="controls-hint">[WASD] เดิน | [F] โต้ตอบ</div>
        </div>
      )}

      {/* --- Oracle Chat UI --- */}
      {chatOpen && (
        <div id="chatUI" className="chat-container" style={{ display: 'flex' }}>
          <div className="chat-header">
            🧪 CHEMMA Lab Assistant
            <button className="close-chat" onClick={closeChat}>×</button>
          </div>
          <div className="chat-box" id="chatHistory" ref={chatHistoryRef}>
            {chatMessages.map((msg, i) => (
              <div key={i} className={msg.type === 'user' ? 'message-row user-row' : 'message-row bot-row'}>
                <div className={msg.type === 'user' ? 'message user-msg' : 'message bot-msg'}>
                  {msg.text}
                </div>
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
              onKeyPress={handleChatKeyPress}
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
      )}

      {/* --- Battle UI Root --- */}
      {gameState === 'BATTLE' && (
        <div id="battle-root" style={{ display: 'block', position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 100 }}>
          <BattleScene onQuitBattle={() => {
            setGameState('GAME');
            if (window.pScene) window.pScene.scene.resume();
            document.getElementById('game-container').style.display = 'block';
          }} />
        </div>
      )}

      <div id="flashScreen" className="white-flash"></div>
    </>
  );
}
