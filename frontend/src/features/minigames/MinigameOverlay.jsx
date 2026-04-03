import React, { useState, useEffect } from 'react';
import { useGameContext } from '../../core/GameContext';
import { eventBus } from '../../core/EventBus';
import { EVENTS } from '../../core/constants';
import SymbolMatcher from './SymbolMatcher';
import ElementMemory from './ElementMemory';
import AtomicSorter from './AtomicSorter';
import ElementCatcher from './ElementCatcher';
import LiquidMixer from './LiquidMixer';

export default function MinigameOverlay({ level = 1 }) {
    const { minigameActive, setMinigameActive } = useGameContext();
    const [loot, setLoot] = useState(null);
    const [isMenuFlow, setIsMenuFlow] = useState(false);

    useEffect(() => {
        if (minigameActive) {
            // If we are currently in menu, or we came from menu, keep flow active
            if (minigameActive.id === 'menu') {
                setIsMenuFlow(true);
            }
        } else {
            // Reset flow when entirely closed
            setIsMenuFlow(false);
        }
    }, [minigameActive]);

    useEffect(() => {
        const unsub = eventBus.on('minigame:show_rewards', (rewards) => {
            setLoot(rewards);
        });
        return () => unsub();
    }, []);

    if (!minigameActive) return null;

    const games = [
        { id: 'symbol_matcher', name: 'Symbol Matcher', difficulty: 'ง่าย', desc: 'จับคู่ชื่อธาตุกับสัญลักษณ์', minLevel: 1 },
        { id: 'liquid_mixer', name: 'Liquid Mixer', difficulty: 'ง่าย', desc: 'เทสารลงในกระบอกตวงให้ได้ระดับ', minLevel: 1 },
        { id: 'element_memory', name: 'Element Memory', difficulty: 'ปานกลาง', desc: 'เกมจับคู่แผ่นปยายเปิดไพ่ธาตุ', minLevel: 5 },
        { id: 'element_catcher', name: 'Element Catcher', difficulty: 'ปานกลาง', desc: 'เก็บธาตุที่ตกลงมาใส่ตะกร้า', minLevel: 5 },
        { id: 'atomic_sorter', name: 'Atomic Sorter', difficulty: 'ยาก', desc: 'เรียงลำดับธาตุตามเลขอะตอม', minLevel: 10 },
    ];

    const handleSelectGame = (gameId) => {
        const game = games.find(g => g.id === gameId);
        if (game && level < game.minLevel) return;
        setMinigameActive({ id: gameId });
    };

    const handleGameComplete = () => {
        if (isMenuFlow) {
            setMinigameActive({ id: 'menu' });
        } else {
            // Direct start logic: Close app completely
            setMinigameActive(null);
        }
    };

    const handleClose = () => {
        setMinigameActive(null);
    };

    return (
        <div className="minigame-overlay-container">
            <div className="minigame-window-frame">
                <div className="minigame-menu-card">
                    <div className="minigame-menu-header">
                        <h2>⚗️ {minigameActive.id === 'menu' ? 'บทพิสูจน์แห่งธาตุ — เอลิมา' : `ระบบวิจัย: ${minigameActive.id.replace('_', ' ').toUpperCase()}`}</h2>
                        <button className="close-btn" onClick={handleClose}>×</button>
                    </div>

                    <div className="minigame-content">
                        {minigameActive.id === 'menu' ? (
                            <div className="minigame-list">
                                {games.map(game => {
                                    const isLocked = level < game.minLevel;
                                    return (
                                        <div 
                                            key={game.id} 
                                            className={`minigame-item ${isLocked ? 'locked' : ''}`} 
                                            onClick={() => handleSelectGame(game.id)}
                                        >
                                            <div className="minigame-info">
                                                <div className="minigame-name">
                                                    {game.name} {isLocked && <span className="lock-icon">🔒</span>}
                                                </div>
                                                <div className="minigame-desc">{isLocked ? `ต้องการเลเวล ${game.minLevel} เพื่อเข้าเล่น` : game.desc}</div>
                                            </div>
                                            <div className={`minigame-difficulty ${game.difficulty === 'ง่าย' ? 'easy' : game.difficulty === 'ปานกลาง' ? 'med' : 'hard'}`}>
                                                {isLocked ? `LV. ${game.minLevel}` : game.difficulty}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            /* Render Games with Level Guard */
                            (() => {
                                const activeGame = games.find(g => g.id === minigameActive.id);
                                if (activeGame && level < activeGame.minLevel) {
                                    return (
                                        <div className="mg-lock-screen">
                                            <div className="lock-large-icon">🔒</div>
                                            <h3>การวิจัยถูกระงับ</h3>
                                            <p>เจ้าต้องมีระดับเลเวลอย่างน้อย <strong>{activeGame.minLevel}</strong> เพื่อเข้าถึงส่วนนี้</p>
                                            <div className="current-lv-tag">ระดับปัจจุบันของเจ้า: {level}</div>
                                            <button className="mg-btn primary" onClick={() => setMinigameActive({ id: 'menu' })}>กลับหน้าเมนู</button>
                                        </div>
                                    );
                                }

                                return minigameActive.id === 'symbol_matcher' ? (
                                    <SymbolMatcher onComplete={handleGameComplete} />
                                ) : minigameActive.id === 'element_memory' ? (
                                    <ElementMemory onComplete={handleGameComplete} />
                                ) : minigameActive.id === 'atomic_sorter' ? (
                                    <AtomicSorter onComplete={handleGameComplete} />
                                ) : minigameActive.id === 'element_catcher' ? (
                                    <ElementCatcher onComplete={handleGameComplete} />
                                ) : minigameActive.id === 'liquid_mixer' ? (
                                    <LiquidMixer onComplete={handleGameComplete} />
                                ) : (
                                    <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                                        การทดสอบนี้ยังไม่พร้อมใช้งาน...
                                        <br />
                                        <button className="mg-btn primary" style={{ marginTop: '20px' }} onClick={() => setMinigameActive({ id: 'menu' })}>กลับหน้าหลัก</button>
                                    </div>
                                );
                            })()
                        )}
                    </div>

                    <div className="minigame-footer">
                        ✦ "ผู้ที่พิสูจน์ตนได้เท่านั้น จึงคู่ควรแก่ความรู้แห่งธาตุ" — เอลิมา
                    </div>
                </div>

                {/* --- Loot / Reward Modal --- */}
                {loot && (
                    <div className="loot-modal-overlay">
                        <div className={`loot-card ${loot.isPerfect ? 'perfect' : ''}`}>
                            <div className="loot-sparkles"></div>
                            
                            {loot.leveledUp && (
                                <div className="level-up-banner">
                                    <div className="lvl-text">LEVEL UP!</div>
                                    <div className="lvl-subtext">เจ้าแข็งแกร่งขึ้นแล้ว</div>
                                </div>
                            )}

                            <div className="loot-header">
                                <div className="loot-icon">{loot.isPerfect ? '✨💎✨' : '🎁'}</div>
                                <h3>{loot.isPerfect ? 'งานวิจัยระดับสมบูรณ์!' : 'การวิจัยสำเร็จ!'}</h3>
                                <div className="loot-subtitle">
                                    {loot.isPerfect ? 'เจ้าเข้าถึงแก่นแท้แห่งธาตุได้อย่างไร้ที่ติ' : 'เจ้าได้รับความรู้และทรัพยากรใหม่'}
                                </div>
                            </div>
                            
                            <div className="loot-body">
                                <div className="reward-row">
                                    <div className="reward-item xp">
                                        <div className="reward-label">EXPERIENCE</div>
                                        <div className="reward-value">+{loot.xp} XP</div>
                                    </div>
                                    {loot.stardust > 0 && (
                                        <div className="reward-item stardust">
                                            <div className="reward-label">STARDUST</div>
                                            <div className="reward-value">+{loot.stardust} ✨</div>
                                        </div>
                                    )}
                                </div>

                                <div className="loot-grid-container">
                                    <div className="grid-label">ธาตุที่รวบรวมได้</div>
                                    <div className="loot-grid">
                                        {loot.items && loot.items.map(item => (
                                            <div key={item.id} className={`reward-element ${item.rarity || 'common'}`}>
                                                <div className="element-qty">x{item.qty}</div>
                                                <div className="element-symbol">{item.id}</div>
                                                <div className="rarity-dot"></div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <button className="loot-collect-btn" onClick={() => {
                                setLoot(null);
                                if (isMenuFlow) {
                                    setMinigameActive({ id: 'menu' });
                                } else {
                                    setMinigameActive(null);
                                }
                            }}>
                                สะสมของรางวัล
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                .minigame-overlay-container {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 100vh;
                    background: rgba(0, 5, 15, 0.7);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 2000;
                    animation: fadeIn 0.3s ease-out;
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                .minigame-window-frame {
                    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
                    border: 2px solid rgba(0, 242, 255, 0.5);
                    border-radius: 20px;
                    padding: 6px;
                    box-shadow: 
                        0 30px 60px rgba(0, 0, 0, 0.8),
                        0 0 40px rgba(0, 242, 255, 0.2);
                    position: relative;
                    animation: popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }

                @keyframes popIn {
                    from { transform: scale(0.8) translateY(20px); opacity: 0; }
                    to { transform: scale(1) translateY(0); opacity: 1; }
                }

                .minigame-menu-card {
                    background: #0a0a1a;
                    border-radius: 16px;
                    width: 580px;
                    max-width: 95vw;
                    min-height: 480px;
                    padding: 24px;
                    color: #fff;
                    font-family: 'Mitr', sans-serif;
                    display: flex;
                    flex-direction: column;
                }

                .minigame-menu-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                    border-bottom: 1px solid rgba(0, 242, 255, 0.15);
                    padding-bottom: 12px;
                }

                .minigame-menu-header h2 {
                    margin: 0;
                    font-size: 1rem;
                    color: #00f2ff;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    font-weight: 500;
                }

                .minigame-content {
                    flex: 1;
                    max-height: 60vh;
                    overflow-y: auto;
                    margin-bottom: 16px;
                    scrollbar-width: thin;
                    scrollbar-color: #00f2ff transparent;
                }

                /* Custom scrollbar for chrome/safari */
                .minigame-content::-webkit-scrollbar { width: 4px; }
                .minigame-content::-webkit-scrollbar-thumb { background: #00f2ff; border-radius: 10px; }

                .close-btn {
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    color: #fff;
                    font-size: 1.2rem;
                    width: 32px; height: 32px;
                    border-radius: 50%;
                    cursor: pointer;
                    display: flex; justify-content: center; align-items: center;
                    transition: all 0.3s;
                }

                .close-btn:hover {
                    background: #ef4444;
                    border-color: #ef4444;
                    transform: rotate(90deg);
                }

                .minigame-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .minigame-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: rgba(0, 242, 255, 0.03);
                    padding: 18px;
                    border-radius: 12px;
                    border: 1px solid rgba(0, 242, 255, 0.1);
                    transition: all 0.3s;
                    cursor: pointer;
                }

                .minigame-item:hover {
                    background: rgba(0, 242, 255, 0.08);
                    border-color: #00f2ff;
                    transform: translateX(5px);
                }

                .minigame-item.locked {
                    opacity: 0.6;
                    cursor: not-allowed;
                    filter: grayscale(100%);
                    border-color: rgba(255, 255, 255, 0.1);
                    background: rgba(255, 255, 255, 0.02);
                }

                .minigame-item.locked:hover {
                    transform: none;
                    background: rgba(255, 255, 255, 0.02);
                    border-color: rgba(255, 255, 255, 0.1);
                }

                .lock-icon {
                    font-size: 0.8rem;
                    margin-left: 8px;
                    opacity: 0.7;
                }

                .minigame-name {
                    font-weight: bold;
                    font-size: 1.1rem;
                    color: #e2e8f0;
                }

                .minigame-desc {
                    font-size: 0.85rem;
                    color: #94a3b8;
                    margin-top: 4px;
                }

                .minigame-difficulty {
                    font-size: 0.75rem;
                    padding: 4px 12px;
                    border-radius: 6px;
                    font-weight: bold;
                }

                .minigame-difficulty.easy {
                    background: rgba(34, 197, 94, 0.2);
                    color: #4ade80;
                }

                .minigame-difficulty.med {
                    background: rgba(245, 158, 11, 0.2);
                    color: #fbbf24;
                    border: 1px solid rgba(245, 158, 11, 0.3);
                }

                .minigame-difficulty.hard {
                    background: rgba(239, 68, 68, 0.2);
                    color: #f87171;
                    border: 1px solid rgba(239, 68, 68, 0.3);
                }

                .minigame-footer {
                    margin-top: auto;
                    text-align: center;
                    font-size: 0.7rem;
                    color: #475569;
                    padding-top: 16px;
                    border-top: 1px solid rgba(255, 255, 255, 0.05);
                }

                .mg-btn.primary {
                    background: #00f2ff;
                    color: #000;
                    border: none;
                    padding: 8px 20px;
                    border-radius: 6px;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .mg-btn.primary:hover {
                    background: #fff;
                    transform: translateY(-2px);
                }

                /* Lock Screen Style */
                .mg-lock-screen {
                    padding: 60px 40px;
                    text-align: center;
                    background: rgba(0, 0, 0, 0.3);
                    border-radius: 16px;
                    animation: lockPulse 2s infinite ease-in-out;
                }
                .lock-large-icon {
                    font-size: 4rem;
                    margin-bottom: 20px;
                    filter: drop-shadow(0 0 10px rgba(239, 68, 68, 0.5));
                }
                .mg-lock-screen h3 {
                    color: #f87171;
                    font-size: 1.5rem;
                    margin-bottom: 12px;
                }
                .mg-lock-screen p {
                    color: #94a3b8;
                    margin-bottom: 24px;
                }
                .current-lv-tag {
                    display: inline-block;
                    padding: 6px 16px;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 20px;
                    font-size: 0.8rem;
                    color: #00f2ff;
                    margin-bottom: 30px;
                }
                @keyframes lockPulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.8; }
                }

                /* Loot Modal Styling */
                .loot-modal-overlay {
                    position: absolute;
                    top: 0; left: 0; width: 100%; height: 100%;
                    background: rgba(0, 5, 15, 0.9);
                    display: flex; justify-content: center; align-items: center;
                    z-index: 3000;
                    border-radius: 20px;
                    animation: fadeIn 0.3s ease;
                }
                .loot-card {
                    background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
                    border: 1px solid rgba(0, 242, 255, 0.4);
                    border-radius: 24px;
                    padding: 32px;
                    width: 440px;
                    max-width: 90%;
                    text-align: center;
                    position: relative;
                    box-shadow: 0 0 50px rgba(0, 242, 255, 0.2);
                    animation: lootPop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    overflow: hidden;
                }
                .loot-card.perfect {
                    border-color: #fbbf24;
                    box-shadow: 0 0 60px rgba(251, 191, 36, 0.3);
                }
                @keyframes lootPop {
                    from { transform: scale(0.5) translateY(50px); opacity: 0; }
                    to { transform: scale(1) translateY(0); opacity: 1; }
                }

                .level-up-banner {
                    background: linear-gradient(90deg, transparent, #fbbf24, transparent);
                    padding: 6px 0; margin-bottom: 20px; position: relative;
                    animation: slideIn 0.6s ease-out;
                }
                .lvl-text { font-size: 1.4rem; font-weight: 900; color: #000; letter-spacing: 4px; }
                .lvl-subtext { font-size: 0.7rem; color: #000; font-weight: bold; }
                @keyframes slideIn { from { transform: translateX(-100%); } to { transform: translateX(0); } }

                .loot-header h3 { color: #00f2ff; margin: 12px 0 4px; font-size: 1.5rem; }
                .perfect .loot-header h3 { color: #fbbf24; }
                .loot-subtitle { font-size: 0.8rem; color: #94a3b8; margin-bottom: 24px; }
                .loot-icon { font-size: 3rem; animation: float 3s infinite ease-in-out; }
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }

                .reward-row { display: flex; gap: 12px; margin-bottom: 20px; }
                .reward-item {
                    flex: 1;
                    background: rgba(15, 23, 42, 0.6);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    padding: 12px; border-radius: 12px;
                }
                .reward-item.xp { border-color: rgba(251, 191, 36, 0.2); }
                .reward-item.stardust { border-color: rgba(0, 242, 255, 0.2); }
                
                .reward-label { font-size: 0.55rem; color: #64748b; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 4px; }
                .reward-item.xp .reward-value { color: #fbbf24; }
                .reward-item.stardust .reward-value { color: #00f2ff; }
                .reward-value { font-size: 1.3rem; font-weight: bold; font-family: monospace; }
                
                .loot-grid-container {
                    background: rgba(0, 0, 0, 0.2);
                    padding: 16px; border-radius: 16px; margin-bottom: 24px;
                }
                .grid-label { font-size: 0.7rem; color: #475569; margin-bottom: 12px; text-align: left; }
                .loot-grid {
                    display: flex; justify-content: center; gap: 12px; flex-wrap: wrap;
                }
                .reward-element {
                    width: 70px; height: 75px;
                    background: #111122; border: 2px solid #1e1e3a;
                    border-radius: 12px; display: flex; flex-direction: column;
                    justify-content: center; align-items: center; position: relative;
                    transition: all 0.3s;
                }
                .reward-element:hover { transform: translateY(-3px); }
                
                /* Rarity Colors */
                .reward-element.common { border-color: #64748b; }
                .reward-element.uncommon { border-color: #22c55e; box-shadow: 0 0 10px rgba(34, 197, 94, 0.2); }
                .reward-element.rare { border-color: #3b82f6; box-shadow: 0 0 15px rgba(59, 130, 246, 0.3); }
                .reward-element.epic { border-color: #a855f7; box-shadow: 0 0 20px rgba(168, 85, 247, 0.4); animation: epicPulse 2s infinite; }
                
                @keyframes epicPulse {
                    0%, 100% { box-shadow: 0 0 10px rgba(168, 85, 247, 0.4); }
                    50% { box-shadow: 0 0 25px rgba(168, 85, 247, 0.6); }
                }

                .element-qty {
                    position: absolute; top: -8px; right: -8px;
                    background: #ef4444; color: #fff; font-size: 0.7rem;
                    padding: 2px 6px; border-radius: 10px; font-weight: bold; z-index: 2;
                }
                .element-symbol { font-size: 1.5rem; font-weight: bold; color: #fff; z-index: 1; }
                .rarity-dot {
                    width: 6px; height: 6px; border-radius: 50%; margin-top: 5px;
                }
                .common .rarity-dot { background: #64748b; }
                .uncommon .rarity-dot { background: #22c55e; }
                .rare .rarity-dot { background: #3b82f6; }
                .epic .rarity-dot { background: #a855f7; }

                .loot-collect-btn {
                    width: 100%; padding: 16px;
                    background: linear-gradient(90deg, #00f2ff, #22d3ee);
                    color: #0f172a; border: none; border-radius: 14px;
                    font-size: 1.1rem; font-weight: bold; cursor: pointer; transition: all 0.2s;
                }
                .perfect .loot-collect-btn { background: linear-gradient(90deg, #fbbf24, #f59e0b); }
                .loot-collect-btn:hover {
                    box-shadow: 0 0 25px rgba(0, 242, 255, 0.4);
                    transform: translateY(-2px);
                }
            `}</style>
        </div>
    );
}
