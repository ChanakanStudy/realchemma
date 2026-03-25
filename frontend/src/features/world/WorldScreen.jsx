import React from 'react';
import { useGameContext } from '../../core/GameContext';
import { MAX_PLAYER_HP } from '../../core/constants';

export default function WorldScreen() {
    const { playerHP } = useGameContext();

    // Calculate HP percentage for the HUD bar
    const hpPercent = Math.max(0, Math.min(100, (playerHP / MAX_PLAYER_HP) * 100));

    return (
        <div id="gameHUD" style={{ display: 'block' }}>
            <div className="player-status">
                <div className="avatar">🧙</div>
                <div className="bars">
                    <div className="bar-bg">
                        <div id="hpFill" className="hp-fill" style={{ width: `${hpPercent}%` }}></div>
                    </div>
                    <div className="bar-bg">
                        <div id="mpFill" className="mp-fill" style={{ width: '100%' }}></div>
                    </div>
                </div>
                <div className="level-badge">1</div>
            </div>
            <div className="minimap-container">MINIMAP</div>
            <div className="controls-hint">[WASD] เดิน | [F] โต้ตอบ</div>
        </div>
    );
}
