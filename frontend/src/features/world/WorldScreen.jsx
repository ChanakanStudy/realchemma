import React from 'react';
import { useGameContext } from '../../core/GameContext';
import { useAuth } from '../../core/AuthContext';
import { MAX_PLAYER_HP } from '../../core/constants';

export default function WorldScreen() {
    const { playerHP } = useGameContext();
    const { currentPlayer } = useAuth();

    // Calculate HP/MP percentage for the HUD bars
    const hpPercent = Math.max(0, Math.min(100, (playerHP / MAX_PLAYER_HP) * 100));
    
    // For now, MP is static at 100% until we have a mana system
    const mpPercent = 100;

    return (
        <div id="gameHUD" style={{ display: 'block' }}>
            {/* --- Player Persona Card --- */}
            <div className="hud-top-left">
                <div className="hud-avatar-wrapper">
                    <div className="hud-avatar">
                        <img 
                            src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${currentPlayer?.name || 'Player'}`} 
                            alt="avatar" 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                    </div>
                    <div className="hud-level-badge">LV.{currentPlayer?.level || 1}</div>
                </div>
                
                <div className="hud-stats-container">
                    <div className="hud-player-name">{currentPlayer?.name || 'ALCHEMIST'}</div>
                    
                    <div className="hud-bars">
                        <div className="hud-bar-wrapper">
                            <div className="hud-bar-bg">
                                <div className="hud-hp-fill" style={{ width: `${hpPercent}%` }}>
                                    <div className="hud-bar-glow"></div>
                                </div>
                            </div>
                            <span className="hud-bar-text">HP {playerHP}/{MAX_PLAYER_HP}</span>
                        </div>

                        <div className="hud-bar-wrapper">
                            <div className="hud-bar-bg mp-bg">
                                <div className="hud-mp-fill" style={{ width: `${mpPercent}%` }}>
                                    <div className="hud-bar-glow"></div>
                                </div>
                            </div>
                            <span className="hud-bar-text">MP {mpPercent}%</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- Stylized Minimap Radar --- */}
            <div className="minimap-container">
                <div className="minimap-inner-border"></div>
                <div className="minimap-label">ACADEMY</div>
            </div>

            <div className="controls-hint">
                <div 
                    className="circle-btn" 
                    title="INVENTORY"
                    onClick={() => {
                        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'b', code: 'KeyB' }));
                    }}
                >
                    🎒
                    <span className="key-badge">B</span>
                </div>
            </div>
        </div>
    );
}
