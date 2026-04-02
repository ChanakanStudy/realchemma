import React, { useState, useEffect, useRef } from 'react';
import { eventBus } from '../../core/EventBus';
import { EVENTS } from '../../core/constants';

const ELEMENTS = [
    { symbol: 'H', color: '#4fc3f7', score: 10 },
    { symbol: 'He', color: '#ce93d8', score: 20 },
    { symbol: 'O', color: '#ef9a9a', score: 15 },
    { symbol: 'C', color: '#a5d6a7', score: 12 },
    { symbol: 'Au', color: '#ffd54f', score: 50 },
    { symbol: 'Fe', color: '#ffa726', score: 25 },
    { symbol: 'Ag', color: '#e0e0e0', score: 40 },
    { symbol: 'Cu', color: '#ff7043', score: 30 },
    { symbol: 'N', color: '#64b5f6', score: 12 },
    { symbol: 'S', color: '#fff176', score: 18 },
    { symbol: 'Ca', color: '#81c784', score: 22 },
    { symbol: 'Na', color: '#4db6ac', score: 22 },
    { symbol: 'Ne', color: '#ff8a65', score: 35 },
    { symbol: 'Mg', color: '#b0bec5', score: 28 },
    { symbol: 'Al', color: '#90a4ae', score: 15 },
];

const FAKE_ELEMENTS = [
    { symbol: 'Vibranium', color: '#ff1744', score: -40, toxic: true },
    { symbol: 'Kryptonite', color: '#00e676', score: -30, toxic: true },
    { symbol: 'Unobtanium', color: '#d500f9', score: -50, toxic: true },
    { symbol: 'Mithril', color: '#2979ff', score: -35, toxic: true },
];

export default function ElementCatcher({ onComplete }) {
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(45);
    const [basketPos, setBasketPos] = useState(50); // percentage 0-100
    const [items, setItems] = useState([]);
    const [gameOver, setGameOver] = useState(false);
    const [win, setWin] = useState(false);
    
    const gameAreaRef = useRef(null);
    const requestRef = useRef();
    const lastSpawnRef = useRef(0);

    // Initial setup
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowLeft' || e.key === 'a') {
                setBasketPos(p => Math.max(0, p - 8));
            } else if (e.key === 'ArrowRight' || e.key === 'd') {
                setBasketPos(p => Math.min(90, p + 8));
            }
        };
        window.addEventListener('keydown', handleKeyDown);

        const timer = setInterval(() => {
            setTimeLeft(t => {
                if (t <= 1) {
                    clearInterval(timer);
                    setGameOver(true);
                    return 0;
                }
                return t - 1;
            });
        }, 1000);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            clearInterval(timer);
            cancelAnimationFrame(requestRef.current);
        };
    }, []);

    // Game Loop
    const update = (time) => {
        // Spawn items
        if (time - lastSpawnRef.current > 700) {
            const isToxic = Math.random() < 0.25;
            const prefab = isToxic 
                ? FAKE_ELEMENTS[Math.floor(Math.random() * FAKE_ELEMENTS.length)]
                : ELEMENTS[Math.floor(Math.random() * ELEMENTS.length)];
            
            const newItem = {
                id: Date.now(),
                x: Math.random() * 85,
                y: -10,
                ...prefab
            };
            setItems(prev => [...prev, newItem]);
            lastSpawnRef.current = time;
        }

        // Move items down
        setItems(prev => {
            const next = prev.map(item => ({ ...item, y: item.y + 1.2 }));
            
            // Collision detection
            const caught = next.filter(item => 
                item.y > 85 && item.y < 92 && 
                item.x > basketPos - 5 && item.x < basketPos + 10
            );

            if (caught.length > 0) {
                const totalCatchScore = caught.reduce((acc, curr) => acc + curr.score, 0);
                setScore(s => Math.max(0, s + totalCatchScore));
            }

            // Remove off-screen or caught items
            return next.filter(item => item.y < 100 && !caught.includes(item));
        });

        requestRef.current = requestAnimationFrame(update);
    };

    useEffect(() => {
        requestRef.current = requestAnimationFrame(update);
        return () => cancelAnimationFrame(requestRef.current);
    }, [basketPos]);

    useEffect(() => {
        if (score >= 300) {
            setWin(true);
            
            // Emit win event for rewards
            eventBus.emit(EVENTS.MINIGAME_WON, { 
                gameId: 'element_catcher', 
                score: score, 
                difficulty: 'med' 
            });
        }
    }, [score]);

    const handleMouseMove = (e) => {
        if (!gameAreaRef.current) return;
        const rect = gameAreaRef.current.getBoundingClientRect();
        // Center the basket (width is approx 10%) on the mouse
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        setBasketPos(Math.min(92, Math.max(0, x - 5))); 
    };

    if (win || gameOver) {
        return (
            <div className="mg-result-screen">
                <div className="mg-result-icon">{win ? '🏺' : '⏱️'}</div>
                <h2 className="mg-result-title">{win ? 'รวบรวมธาตุสำเร็จ!' : 'จบการรวบรวม!'}</h2>
                <p className="mg-result-sub">
                    คะแนนที่ทำได้: {score} / 300
                </p>
                <div className="mg-result-actions">
                    <button className="mg-btn primary" onClick={onComplete}>
                        {win ? '✓ รับรางวัล' : '↺ ลองอีกครั้ง'}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="ec-container">
            <div className="ec-header">
                <div className="sm-stat">
                    <span className="sm-stat-label">SCORE</span>
                    <span className="sm-stat-value">{score}</span>
                </div>
                <div className="sm-title-block">
                    <div className="sm-title">ELEMENT CATCHER</div>
                    <div className="sm-subtitle">ใช้เมาส์หรือปุ่ม A/D ในการเคลื่อนที่</div>
                </div>
                <div className="sm-stat">
                    <span className="sm-stat-label">TIME</span>
                    <span className="sm-stat-value" style={{ color: timeLeft > 10 ? '#00f2ff' : '#ff1744' }}>{timeLeft}s</span>
                </div>
            </div>

            <div 
                className="ec-game-area" 
                ref={gameAreaRef}
                onMouseMove={handleMouseMove}
            >
                {/* Falling items */}
                {items.map(item => (
                    <div 
                        key={item.id} 
                        className={`ec-item ${item.toxic ? 'toxic' : ''}`}
                        style={{ 
                            left: `${item.x}%`, 
                            top: `${item.y}%`, 
                            color: item.color,
                            fontSize: item.toxic ? '0.75rem' : '1.4rem'
                        }}
                    >
                        {item.symbol}
                    </div>
                ))}

                {/* Basket / Jar */}
                <div 
                    className="ec-basket"
                    style={{ left: `${basketPos}%` }}
                >
                    <div className="ec-basket-glow"></div>
                    <div className="ec-basket-rim"></div>
                    <div className="ec-basket-body"></div>
                </div>
            </div>

            <style>{`
                .ec-container { display: flex; flex-direction: column; gap: 16px; }
                .ec-header { display: flex; justify-content: space-between; align-items: center; }
                .ec-game-area {
                    height: 350px;
                    background: rgba(0, 5, 15, 0.4);
                    border: 2px solid rgba(0, 242, 255, 0.1);
                    border-radius: 12px;
                    position: relative;
                    overflow: hidden;
                    cursor: crosshair;
                }
                .ec-item {
                    position: absolute;
                    font-size: 1.4rem;
                    font-weight: bold;
                    text-shadow: 0 0 10px currentColor;
                    pointer-events: none;
                }
                .ec-item.toxic {
                    animation: shake 0.2s infinite;
                    filter: drop-shadow(0 0 12px #ff1744);
                }
                .ec-basket {
                    position: absolute;
                    bottom: 10px;
                    width: 70px;
                    height: 50px;
                    transition: left 0.08s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                    pointer-events: none;
                }
                .ec-basket-body {
                    width: 100%; height: 100%;
                    background: rgba(0, 242, 255, 0.1);
                    border: 2px solid #00f2ff;
                    border-top: none;
                    border-radius: 0 0 12px 12px;
                    position: relative;
                    backdrop-filter: blur(4px);
                }
                .ec-basket-rim {
                    width: 110%; height: 6px;
                    background: #00f2ff;
                    margin-left: -5%;
                    border-radius: 3px;
                    box-shadow: 0 0 15px #00f2ff;
                }
                .ec-basket-glow {
                    position: absolute;
                    top: -20px; left: 0; right: 0; height: 30px;
                    background: linear-gradient(to top, rgba(0, 242, 255, 0.2), transparent);
                }
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-2px); }
                    75% { transform: translateX(2px); }
                }
            `}</style>
        </div>
    );
}
