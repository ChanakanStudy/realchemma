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
            <div className="player-status">
                <div className="avatar">
                    {currentPlayer?.level >= 10 ? '🧙‍♂️' : '🧪'}
                    <div className="level-badge">{currentPlayer?.level || 1}</div>
                </div>
                <div className="bars">
                    <div className="bar-bg">
                        <div id="hpFill" className="hp-fill" style={{ width: `${hpPercent}%` }}>
                            <span className="bar-label">{playerHP} / {MAX_PLAYER_HP}</span>
                        </div>
                    </div>
                    <div className="bar-bg">
                        <div id="mpFill" className="mp-fill" style={{ width: `${mpPercent}%` }}>
                            <span className="bar-label">MP {mpPercent}%</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- Stylized Minimap Radar --- */}
            <div className="minimap-container">
                <div className="minimap-grid"></div>
                <div className="minimap-scan"></div>
                <div className="minimap-player-dot"></div>
                <div className="minimap-label">ACADEMY GROUNDS</div>
            </div>

            <div className="controls-hint">
                <div className="circle-btn" title="INTERACT">
                    ✋
                    <span className="key-badge">F</span>
                </div>
                <div className="circle-btn" title="INVENTORY">
                    🎒
                    <span className="key-badge">B</span>
                </div>
            </div>
        </div>
    );
}
