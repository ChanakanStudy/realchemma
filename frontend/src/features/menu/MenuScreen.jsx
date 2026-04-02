import React, { useRef, useEffect } from 'react';
import { useGameContext } from '../../core/GameContext';
import { GAME_STATES } from '../../core/constants';

export default function MenuScreen() {
    const { setGameState } = useGameContext();
    const audioRef = useRef(null);

    // พยายามเล่นเพลงตอนหน้านี้โหลดขึ้นมาครั้งแรก (อาจโดน Browser Block ได้ถ้าผู้ใช้ยังไม่เคยคลิกจอ)
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = 0.3; // ตั้งระดับเสียง
            audioRef.current.play().catch(e => console.log("Browser blocked autoplay. Waiting for user interaction."));
        }
    }, []);

    // ถ้าผู้ใช้คลิกตรงไหนก็ตามบนหน้าจอ ให้บังคับเล่นเพลงเผื่อโดน Browser บล็อกไว้ตอนต้น
    const handleAnyClick = () => {
        if (audioRef.current && audioRef.current.paused) {
            audioRef.current.play().catch(e => console.log(e));
        }
    };

    const enterGame = () => {
        // ค่อยๆ ลดระดับเสียงลง (Fade out) ก่อนเข้าเกม
        if (audioRef.current) {
            const fadeTimer = setInterval(() => {
                if (audioRef.current.volume > 0.05) {
                    audioRef.current.volume -= 0.05;
                } else {
                    audioRef.current.pause();
                    clearInterval(fadeTimer);
                }
            }, 100);
        }

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
        <div id="menuUI" onClick={handleAnyClick}>
            {/* แท็กซ่อนเพลง */}
            <audio ref={audioRef} src="/assets/menu_bgm.mp3" loop />
            
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
