import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createGame } from './game/phaserGame';
import { callGeminiAPI, saveUserProfile, loadUserProfile } from './api/client';
import { loadGameState, saveGameState, addXP } from './core/userState';
import { ELEMENTS, matchRecipe } from './services/alchemyService';
import { PERIODIC_TABLE_DATA } from './services/elementData';
import BattleScene from './components/battle/BattleScene';
import PeriodicTable from './components/codex/PeriodicTable';
import InventoryUI from './components/inventory/InventoryUI';

export default function App() {
  const [gameState, setGameState] = useState('MENU');
  const [chatMessages, setChatMessages] = useState([
    { type: 'oracle', text: 'ยินดีต้อนรับนักเรียนเจ้าแห่งศาสตร์เคมี... เจ้ามีคำถามใดจะถามหรือไม่?' },
  ]);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // Advanced RPG States
  const [userData, setUserData] = useState(loadGameState());
  const [indexOpen, setIndexOpen] = useState(false);
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('backpack');
  const [levelUpNotif, setLevelUpNotif] = useState(null);
  const [storyNotif, setStoryNotif] = useState(null);
  const [crucible, setCrucible] = useState([]);

  const chatHistoryRef = useRef(null);
  const chatInputRef = useRef(null);
  const gameInitialized = useRef(false);

  // Initial Load from Backend (Sync)
  useEffect(() => {
    const syncWithBackend = async () => {
      const response = await loadUserProfile("default_student");
      if (response && response.status === "success") {
        console.log("Loaded profile from backend:", response.data);
        setUserData(response.data);
      }
    };
    syncWithBackend();
  }, []);

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

    // Progression & Inventory Bridges
    window.gainXP = (amount) => {
      setUserData(prev => {
        const next = addXP(prev, amount);
        if (next.leveledUp) {
          setLevelUpNotif(`LEVEL UP! You are now level ${next.level}`);
          setTimeout(() => setLevelUpNotif(null), 4000);
        }
        return next;
      });
    };

    window.addItem = (itemId, qty = 1) => {
      setUserData(prev => {
        const newInv = [...prev.inventory];
        const existing = newInv.find(i => i.id === itemId);
        if (existing) {
          existing.quantity += qty;
        } else {
          newInv.push({ id: itemId, quantity: qty });
        }

        const newDiscovered = prev.discovered.includes(itemId)
          ? prev.discovered
          : [...prev.discovered, itemId];

        return { ...prev, inventory: newInv, discovered: newDiscovered };
      });
    };

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

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameState !== 'GAME') return;
      if (window.inChat) return; // Don't trigger while typing in chat

      const key = e.key.toLowerCase();
      if (key === 'i') { setDashboardOpen(true); setActiveTab('backpack'); }
      if (key === 'q') { setDashboardOpen(true); setActiveTab('quests'); }
      if (key === 'c') { setDashboardOpen(true); setActiveTab('codex'); }
      if (key === 'escape') {
        setInventoryOpen(false); // Legacy if any
        setDashboardOpen(false);
        setIndexOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  // Persistent state saving (Local + Backend)
  useEffect(() => {
    saveGameState(userData);
    saveUserProfile(userData);
  }, [userData]);

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
            <p className="game-subtitle"></p>
          </div>

          <div className="start-prompt" onClick={enterGame}>
            CLICK TO START
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
            <div className="avatar" onClick={() => { setDashboardOpen(true); setActiveTab('backpack'); }} style={{ cursor: 'pointer' }}>🧙</div>
            <div className="bars">
              <div className="bar-bg">
                <div id="hpFill" className="hp-fill" style={{ width: `${(userData.hp / 300) * 100}%` }}></div>
              </div>
              <div className="bar-bg">
                <div id="mpFill" className="mp-fill" style={{ width: `${(userData.mp / 100) * 100}%` }}></div>
              </div>
            </div>
            <div className="level-badge">{userData.level}</div>
          </div>

          <div className="xp-bar-container">
            <div className="xp-fill" style={{ width: `${(userData.xp / userData.nextLevelXP) * 100}%` }}></div>
          </div>

          <div className="lab-btn" onClick={() => { setDashboardOpen(true); setActiveTab('codex'); }} title="สมุดภาพตารางธาตุ" style={{ bottom: '150px' }}>📖</div>
          <div className="lab-btn" onClick={() => setIndexOpen(true)} title="ห้องแล็บผสมธาตุ">🧪</div>
          <div className="lab-btn" onClick={() => { setDashboardOpen(true); setActiveTab('backpack'); }} title="กระเป๋าสัมภาระ" style={{ bottom: '220px' }}>🎒</div>

          <div className="minimap-container">MINIMAP</div>
          <div className="controls-hint">[WASD] เดิน | [F] โต้ตอบ | [I] กระเป๋า | [C] ตารางธาตุ | [Q] เควส</div>
        </div>
      )}

      {/* --- LEVEL UP NOTIF --- */}
      {levelUpNotif && (
        <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', background: 'rgba(212,175,55,0.9)', color: 'black', padding: '20px 50px', borderRadius: '50px', fontWeight: 'bold', fontSize: '2rem', zIndex: 1000, boxShadow: '0 0 50px var(--gold-primary)', animation: 'floating 1s infinite' }}>
          {levelUpNotif}
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
          <BattleScene
            userData={userData}
            setUserData={setUserData}
            onQuitBattle={() => {
              setGameState('GAME');
              if (window.pScene) window.pScene.scene.resume();
              document.getElementById('game-container').style.display = 'block';
            }}
          />
        </div>
      )}



      {/* --- Chemistry Index & Lab --- */}
      {indexOpen && (
        <div className="rpg-overlay">
          <div className="overlay-header">
            <div className="overlay-title">CHEMMA LAB & INDEX (ห้องแล็บ)</div>
            <button className="close-chat" onClick={() => setIndexOpen(false)}>×</button>
          </div>
          <div className="overlay-content" style={{ display: 'flex', gap: '30px' }}>
            <div style={{ flex: 1 }}>
              <h3 style={{ borderBottom: '1px solid #444', paddingBottom: '10px' }}>Elements Discovered</h3>
              <div className="grid-container">
                {ELEMENTS.map(el => {
                  const isDiscovered = userData.discovered.includes(el.symbol);
                  const hasQty = userData.inventory.find(i => i.id === el.symbol)?.quantity || 0;
                  return (
                    <div key={el.symbol} className="item-card"
                      style={{ filter: isDiscovered ? 'none' : 'grayscale(1) opacity(0.3)', cursor: isDiscovered && hasQty > 0 ? 'pointer' : 'default' }}
                      onClick={() => {
                        if (isDiscovered && hasQty > 0) {
                          setCrucible(prev => [...prev, el.symbol]);
                        }
                      }}
                    >
                      <div className="item-qty">x{hasQty}</div>
                      <div className="item-symbol" style={{ color: el.color }}>{isDiscovered ? el.symbol : '?'}</div>
                      <div className="item-name">{isDiscovered ? el.name : 'Unknown'}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ width: '300px', background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <h3 style={{ textAlign: 'center', color: 'var(--gold-primary)' }}>CRUCIBLE (หม้อผสม)</h3>
              <div style={{ minHeight: '150px', border: '2px dashed rgba(212,175,55,0.3)', borderRadius: '15px', display: 'flex', flexWrap: 'wrap', gap: '10px', padding: '10px' }}>
                {crucible.map((c, i) => (
                  <div key={i} style={{ padding: '5px 10px', background: 'rgba(212,175,55,0.2)', border: '1px solid var(--gold-primary)', borderRadius: '5px' }}>{c}</div>
                ))}
              </div>
              <button
                onClick={() => {
                  if (crucible.length > 0) {
                    const result = matchRecipe(crucible);
                    setUserData(prev => {
                      // Reduce inventory for each item in crucible
                      const newInv = [...prev.inventory];
                      crucible.forEach(ingId => {
                        const item = newInv.find(i => i.id === ingId);
                        if (item) item.quantity -= 1;
                      });

                      // Filter out empty items
                      const filteredInv = newInv.filter(i => i.quantity > 0);

                      const discovered = result && !prev.discovered.includes(result.id)
                        ? [...prev.discovered, result.id]
                        : prev.discovered;

                      return { ...prev, inventory: filteredInv, discovered };
                    });

                    if (result) {
                      window.gainXP(result.id === 'sludge' ? 5 : 50);
                      alert(`ผสมสารสำเร็จ: ${result.name}`);
                    } else {
                      alert("การทดลองล้มเหลว... (ต้องใช้ธาตุอย่างน้อย 2 ชนิด)");
                    }
                    setCrucible([]);
                  }
                }}
                className="start-prompt"
                style={{ position: 'static', width: '100%', marginTop: '20px', padding: '10px' }}
                disabled={crucible.length === 0}
              >
                MIX (ผสมธาตุ)
              </button>
              <button onClick={() => setCrucible([])} style={{ width: '100%', background: 'none', border: 'none', color: '#666', marginTop: '10px', cursor: 'pointer' }}>Clear</button>
            </div>
          </div>
        </div>
      )}

      {/* --- Unified Dashboard Overlay --- */}
      {dashboardOpen && (
        <InventoryUI
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          userData={userData}
          onClose={() => setDashboardOpen(false)}
        />
      )}


      <div id="flashScreen" className="white-flash"></div>
    </>
  );
}
