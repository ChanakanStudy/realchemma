import React from 'react';
import { useGameContext } from '../../core/GameContext';
import { GAME_STATES } from '../../core/constants';

export default function MenuScreen() {
    const { setGameState } = useGameContext();

    const enterGame = () => {
        const flash = document.getElementById('flashScreen');
        if (flash) flash.style.opacity = '1';

        setTimeout(() => {
            setGameState(GAME_STATES.GAME);
            const container = document.getElementById('game-container');
            if (container) container.style.display = 'block';
            
            // Reliable resume: poll until pScene is ready
            const resumeCheck = setInterval(() => {
                if (window.pScene) {
                    window.pScene.scene.resume();
                    clearInterval(resumeCheck);
                }
            }, 200);

            if (flash) {
                flash.style.transition = 'opacity 2s ease-out';
                flash.style.opacity = '0';
            }
        }, 1000);
    };

    return (
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
    );
}
