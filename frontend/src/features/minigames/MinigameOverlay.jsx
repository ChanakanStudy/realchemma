import React from 'react';
import { useGameContext } from '../../core/GameContext';
import { EVENTS } from '../../core/constants';
import { eventBus } from '../../core/EventBus';
import SymbolMatcher from './SymbolMatcher';

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

    // Render active game
    if (minigameActive.id === 'symbol_matcher') {
        return (
            <div className="minigame-overlay-container">
                <div className="minigame-menu-card">
                    <div className="minigame-menu-header" style={{marginBottom: '12px'}}>
                        <span style={{color:'#888', fontSize:'0.8rem'}}>⚗️ บทพิสูจน์แห่งธาตุ — Symbol Matcher</span>
                        <button className="close-btn" onClick={handleClose}>×</button>
                    </div>
                    <SymbolMatcher onComplete={handleGameComplete} />
                </div>
            </div>
        );
    }

    return (
        <div className="minigame-overlay-container">
            <div className="minigame-menu-card">
                <div className="minigame-menu-header">
                    <h2>⚗️ บทพิสูจน์แห่งธาตุ — เอลิมา</h2>
                    <button className="close-btn" onClick={handleClose}>×</button>
                </div>

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

                <div className="minigame-footer">
                    ✦ "ผู้ที่พิสูจน์ตนได้เท่านั้น จึงคู่ควรแก่ความรู้แห่งธาตุ" — เอลิมา
                </div>
            </div>

            <style jsx>{`
                .minigame-overlay-container {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.85);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 2000;
                    backdrop-filter: blur(8px);
                }

                .minigame-menu-card {
                    background: #1a1a2e;
                    border: 2px solid #00f2ff;
                    border-radius: 12px;
                    width: 500px;
                    max-width: 90%;
                    padding: 24px;
                    box-shadow: 0 0 30px rgba(0, 242, 255, 0.3);
                    color: #fff;
                    font-family: 'Mitr', sans-serif;
                }

                .minigame-menu-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 24px;
                    border-bottom: 1px solid rgba(0, 242, 255, 0.2);
                    padding-bottom: 12px;
                }

                .minigame-menu-header h2 {
                    margin: 0;
                    font-size: 1.4rem;
                    color: #00f2ff;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }

                .close-btn {
                    background: none;
                    border: none;
                    color: #fff;
                    font-size: 2rem;
                    cursor: pointer;
                    line-height: 1;
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
                    background: rgba(255, 255, 255, 0.05);
                    padding: 16px;
                    border-radius: 8px;
                    border: 1px solid transparent;
                    transition: all 0.2s;
                    cursor: pointer;
                }

                .minigame-item:hover {
                    background: rgba(0, 242, 255, 0.1);
                    border-color: #00f2ff;
                    transform: translateX(5px);
                }

                .minigame-name {
                    font-weight: bold;
                    font-size: 1.1rem;
                    color: #fff;
                }

                .minigame-desc {
                    font-size: 0.9rem;
                    color: #aaa;
                    margin-top: 4px;
                }

                .minigame-difficulty {
                    font-size: 0.8rem;
                    padding: 4px 10px;
                    border-radius: 20px;
                    font-weight: bold;
                }

                .minigame-difficulty.easy {
                    background: #2e7d32;
                    color: #fff;
                }

                .minigame-difficulty.med {
                    background: #f57c00;
                    color: #fff;
                }

                .minigame-footer {
                    margin-top: 24px;
                    text-align: center;
                    font-size: 0.8rem;
                    color: #666;
                }
            `}</style>
        </div>
    );
}
