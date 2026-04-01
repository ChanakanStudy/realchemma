import React from 'react';
import { useGameContext } from '../../core/GameContext';
import SymbolMatcher from './SymbolMatcher';
import ElementMemory from './ElementMemory';
import AtomicSorter from './AtomicSorter';
import ElementCatcher from './ElementCatcher';
import LiquidMixer from './LiquidMixer';

export default function MinigameOverlay() {
    const { minigameActive, setMinigameActive } = useGameContext();

    if (!minigameActive) return null;

    const games = [
        { id: 'symbol_matcher', name: 'Symbol Matcher', difficulty: 'ง่าย', desc: 'จับคู่ชื่อธาตุกับสัญลักษณ์' },
        { id: 'atomic_sorter', name: 'Atomic Sorter', difficulty: 'ง่าย', desc: 'เรียงลำดับธาตุตามเลขอะตอม' },
        { id: 'element_memory', name: 'Element Memory', difficulty: 'ง่าย', desc: 'เกมจับคู่แผ่นป้ายเปิดไพ่ธาตุ' },
        { id: 'element_catcher', name: 'Element Catcher', difficulty: 'ปานกลาง', desc: 'เก็บธาตุที่ตกลงมาใส่ตะกร้า' },
        { id: 'liquid_mixer', name: 'Liquid Mixer', difficulty: 'ปานกลาง', desc: 'เทสารลงในกระบอกตวงให้ได้ระดับ' }
    ];

    const handleSelectGame = (gameId) => {
        setMinigameActive({ id: gameId });
    };

    const handleGameComplete = () => {
        setMinigameActive({ id: 'menu' });
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
                                {games.map(game => (
                                    <div key={game.id} className="minigame-item" onClick={() => handleSelectGame(game.id)}>
                                        <div className="minigame-info">
                                            <div className="minigame-name">{game.name}</div>
                                            <div className="minigame-desc">{game.desc}</div>
                                        </div>
                                        <div className={`minigame-difficulty ${game.difficulty === 'ง่าย' ? 'easy' : 'med'}`}>
                                            {game.difficulty}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            /* Render Games */
                            minigameActive.id === 'symbol_matcher' ? (
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
                                <div style={{padding: '40px', textAlign: 'center', color: '#666'}}>
                                    การทดสอบนี้ยังไม่พร้อมใช้งาน...
                                    <br />
                                    <button className="mg-btn primary" style={{marginTop: '20px'}} onClick={() => setMinigameActive({id: 'menu'})}>กลับหน้าหลัก</button>
                                </div>
                            )
                        )}
                    </div>

                    <div className="minigame-footer">
                        ✦ "ผู้ที่พิสูจน์ตนได้เท่านั้น จึงคู่ควรแก่ความรู้แห่งธาตุ" — เอลิมา
                    </div>
                </div>
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
                }
            `}</style>
        </div>
    );
}
