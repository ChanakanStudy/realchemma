import React, { useState, useEffect, useRef } from 'react';
import { eventBus } from '../../core/EventBus';
import { EVENTS } from '../../core/constants';

const COLORS = [
    '#00f2ff', // Cyan
    '#00e676', // Green
    '#6c0080ff', // Purple
    '#ff9100', // Orange
    '#f89ceeff', // Pink
    '#ffea00', // Yellow
    '#ff1744'  // Red
];

export default function LiquidMixer({ onComplete }) {
    const [volume, setVolume] = useState(0);
    const [target, setTarget] = useState(0);
    const [currentColor, setCurrentColor] = useState(COLORS[0]);
    const [isPouring, setIsPouring] = useState(false);
    const [score, setScore] = useState(0);
    const [tries, setTries] = useState(3);
    const [win, setWin] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [showResult, setShowResult] = useState(false);
    const [accuracy, setAccuracy] = useState(0);

    const pourInterval = useRef(null);

    // Initialize random factors
    useEffect(() => {
        setTarget(Math.floor(Math.random() * 60) + 20);
        setCurrentColor(COLORS[Math.floor(Math.random() * COLORS.length)]);
    }, []);

    const startPouring = () => {
        if (gameOver || win || showResult) return;
        setIsPouring(true);
        pourInterval.current = setInterval(() => {
            setVolume(v => {
                const next = v + 0.8;
                if (next >= 100) {
                    stopPouring();
                    return 100;
                }
                return next;
            });
        }, 30);
    };

    const stopPouring = () => {
        if (!isPouring) return;
        setIsPouring(false);
        clearInterval(pourInterval.current);
        checkResult();
    };

    const checkResult = () => {
        const diff = Math.abs(volume - target);
        const acc = Math.max(0, 100 - diff * 2);
        setAccuracy(acc);
        setShowResult(true);

        if (acc >= 90) {
            setScore(s => s + Math.floor(acc * 10));
            setWin(true);
            
            // Emit win event for rewards
            eventBus.emit(EVENTS.MINIGAME_WON, { 
                gameId: 'liquid_mixer', 
                score: acc, 
                difficulty: 'easy' 
            });
        } else {
            setTries(t => {
                if (t <= 1) {
                    setGameOver(true);
                    return 0;
                }
                return t - 1;
            });
        }
    };

    const resetTry = () => {
        if (gameOver || win) return;
        setVolume(0);
        setTarget(Math.floor(Math.random() * 60) + 20);
        setCurrentColor(COLORS[Math.floor(Math.random() * COLORS.length)]);
        setShowResult(false);
    };

    if (win || gameOver) {
        return (
            <div className="mg-result-screen">
                <div className="mg-result-icon">{win ? '🧪' : '💥'}</div>
                <h2 className="mg-result-title">{win ? 'ผสมสารสำเร็จ!' : 'สารสกัดระเบิด!'}</h2>
                <p className="mg-result-sub">
                    {win ? `ความแม่นยำสูงมาก: ${accuracy.toFixed(1)}% ∙ คะแนน: ${score}` : `เหลือโอกาส 0 ครั้ง`}
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
        <div className={`lm-container ${isPouring ? 'is-pouring' : ''}`}>
            <div className="lm-header">
                <div className="sm-stat">
                    <span className="sm-stat-label">TRIES</span>
                    <span className="sm-stat-value" style={{ color: tries === 1 ? '#ff1744' : '#00f2ff' }}>{tries}</span>
                </div>
                <div className="sm-title-block">
                    <div className="sm-title">LIQUID MIXER</div>
                    <div className="sm-subtitle">เทสารให้ตรงขีดสีทอง (ความแม่นยำ 90% ขึ้นไป)</div>
                </div>
                <div className="sm-stat">
                    <span className="sm-stat-label">TARGET</span>
                    <span className="sm-stat-value" style={{ color: '#ffd54f' }}>{target.toFixed(0)}ml</span>
                </div>
            </div>

            <div className="lm-lab-bench">
                {/* Cylinder */}
                <div className="lm-cylinder">
                    <div className="lm-measuring-lines">
                        {[...Array(10)].map((_, i) => (
                            <div key={i} className="lm-line" style={{ bottom: `${i * 10}%` }}>
                                <span className="lm-line-label">{100 - i * 10}</span>
                            </div>
                        ))}
                    </div>

                    {/* Target Marker */}
                    <div className="lm-target-line" style={{ bottom: `${target}%` }}>
                        <div className="lm-target-label">TARGET</div>
                    </div>

                    {/* Liquid */}
                    <div
                        className="lm-liquid"
                        style={{
                            height: `${volume}%`,
                            background: win ? '#4ade80' : currentColor,
                            boxShadow: `inset 0 0 20px rgba(255,255,255,0.3), 0 0 15px ${currentColor}`
                        }}
                    >
                        {/* Ripple Effect (Always at the surface) */}
                        <div className="lm-bubbles" style={{ background: currentColor }}></div>
                    </div>

                    {/* Independent Pour Stream (Precision Alignment - "ติดผิวน้ำ") */}
                    <div 
                        className={`lm-pour-stream ${isPouring ? 'is-pouring' : ''}`}
                        style={{ 
                            background: `linear-gradient(to bottom, ${currentColor}, rgba(255,255,255,0.4))`, 
                            boxShadow: `0 0 15px ${currentColor}`,
                            /* Removed the -5px to ensure no gap exists between the stream and the rising surface */
                            height: isPouring ? `calc(${100 - volume}%)` : '0px',
                            top: '5px',
                            opacity: isPouring ? 1 : 0
                        }}
                    ></div>
                </div>

                {/* High-Tech Nano Dispenser */}
                <div className="lm-dispenser-unit">
                    <div className="lm-dispenser-body">
                        {/* Glowing Crystal Tank */}
                        <div
                            className="lm-dispenser-tank"
                            style={{
                                background: currentColor,
                                boxShadow: `0 0 20px ${currentColor}`
                            }}
                        >
                            <div className="lm-tank-liquid-level" style={{ height: `${100 - volume / 2}%` }}></div>
                        </div>
                        <div className="lm-dispenser-nozzle"></div>
                    </div>
                </div>
            </div>

            <div className="lm-controls" onMouseDown={startPouring} onMouseUp={stopPouring} onMouseLeave={stopPouring}>
                {!showResult ? (
                    <button className={`lm-pour-btn ${isPouring ? 'active' : ''}`}>
                        {isPouring ? 'กำลังเท...' : 'กดค้างเพื่อเทสาร'}
                    </button>
                ) : (
                    <div className="lm-result-overlay">
                        <div className="lm-acc-text">ความแม่นยำ: {accuracy.toFixed(1)}%</div>
                        <button className="mg-btn primary" onClick={resetTry}>ลองด่านใหม่</button>
                    </div>
                )}
            </div>

            <style>{`
                .lm-container { display: flex; flex-direction: column; gap: 20px; }
                .lm-header { display: flex; justify-content: space-between; align-items: center; }
                .lm-lab-bench {
                    height: 320px; display: flex; align-items: flex-end; justify-content: center;
                    gap: 60px; padding-bottom: 20px; position: relative;
                }
                .lm-cylinder {
                    width: 70px; height: 250px; background: rgba(255, 255, 255, 0.05);
                    border: 2px solid rgba(255, 255, 255, 0.2); border-top: none;
                    border-radius: 0 0 10px 10px; position: relative;
                }
                .lm-liquid {
                    position: absolute; bottom: 0; left: 0; width: 100%;
                    transition: height 0.1s linear, background 0.5s;
                    box-shadow: inset 0 0 20px rgba(255,255,255,0.3), 0 0 15px currentColor;
                }
                .lm-target-line {
                    position: absolute; left: -10px; width: 90px; height: 3px;
                    background: #ffd54f; z-index: 10; box-shadow: 0 0 10px #ffd54f;
                }
                .lm-target-label {
                    position: absolute; right: -55px; top: -8px; font-size: 0.6rem; color: #ffd54f; font-weight: bold;
                }
                .lm-measuring-lines { position: absolute; left: 0; top: 0; width: 100%; height: 100%; }
                .lm-line { position: absolute; left: 0; width: 15px; height: 1px; background: rgba(255,255,255,0.2); }
                .lm-line-label { position: absolute; left: 20px; top: -6px; font-size: 0.5rem; color: #444; }
                
                /* --- High-Tech Nano Injector (Extreme Redesign) --- */
                .lm-dispenser-unit {
                    position: absolute;
                    top: -10px; left: 50%;
                    transform: translateX(-50%) translateY(0);
                    width: 140px; height: 120px;
                    display: flex; flex-direction: column; align-items: center;
                    transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
                    z-index: 20;
                }
                .is-pouring .lm-dispenser-unit {
                    transform: translateX(-50%) translateY(0); /* Stay fixed */
                }

                .lm-dispenser-body {
                    width: 100px; height: 50px;
                    background: #1e293b;
                    border: 2px solid #64748b;
                    border-radius: 4px;
                    position: relative;
                    display: flex; justify-content: center; align-items: center;
                    box-shadow: 0 0 20px rgba(0,0,0,0.8), inset 0 0 10px rgba(255,255,255,0.1);
                    clip-path: polygon(0% 0%, 100% 0%, 90% 100%, 10% 100%);
                }

                .lm-dispenser-tank {
                    width: 50px; height: 25px;
                    background: #000;
                    border: 1px solid rgba(255,255,255,0.3);
                    position: relative; overflow: hidden;
                }
                .lm-tank-liquid-level {
                    position: absolute; bottom: 0; left: 0; width: 100%;
                    background: currentColor; opacity: 0.8;
                    transition: height 0.1s linear;
                }

                /* Energy Rings */
                .lm-dispenser-nozzle {
                    position: absolute; bottom: -15px; left: 50%;
                    transform: translateX(-50%);
                    width: 20px; height: 15px;
                    background: #475569;
                    clip-path: polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%);
                }
                .is-pouring .lm-dispenser-nozzle::before {
                    content: ''; position: absolute; top: 100%; left: -10px; width: 40px; height: 2px;
                    background: currentColor; box-shadow: 0 0 10px currentColor;
                    animation: pulse 0.3s infinite alternate;
                }

                @keyframes pulse { from { opacity: 0.5; transform: scaleX(0.8); } to { opacity: 1; transform: scaleX(1.2); } }

                .lm-pour-stream {
                    position: absolute; 
                    left: 50%; 
                    transform: translateX(-50%);
                    width: 5px; height: 0;
                    pointer-events: none;
                    z-index: 15;
                    border-radius: 3px;
                    transition: none; /* Instant appearance */
                }
                .is-pouring .lm-pour-stream {
                    opacity: 1;
                    animation: stream-flow 0.5s infinite linear;
                }

                @keyframes stream-flow {
                    0% { background-position: 0 0; }
                    100% { background-position: 0 100%; }
                }

                .lm-bubbles {
                    position: absolute; top: -5px; width: 100%; height: 5px;
                    background: rgba(255,255,255,0.6); filter: blur(2px);
                    display: none; border-radius: 50%;
                }
                .is-pouring .lm-bubbles { 
                    display: block; 
                    animation: liquid-ripple 0.2s infinite; 
                }

                @keyframes liquid-ripple {
                    0%, 100% { transform: scaleY(1) scaleX(1); opacity: 0.5; }
                    50% { transform: scaleY(2) scaleX(1.1); opacity: 0.8; }
                }

                .lm-controls { height: 60px; display: flex; justify-content: center; align-items: center; }
                .lm-pour-btn {
                    padding: 15px 40px; background: #1e293b; border: 2px solid #00f2ff;
                    border-radius: 12px; color: #00f2ff; font-weight: bold; font-family: 'Mitr', sans-serif;
                    cursor: pointer; transition: all 0.2s;
                }
                .lm-pour-btn.active { background: #00f2ff; color: #0f172a; transform: scale(0.95); box-shadow: 0 0 20px #00f2ff; }
                .lm-result-overlay { text-align: center; }
                .lm-acc-text { font-size: 1.1rem; color: #fff; margin-bottom: 8px; font-weight: bold; }
            `}</style>
        </div>
    );
}
