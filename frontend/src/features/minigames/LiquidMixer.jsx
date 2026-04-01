import React, { useState, useEffect, useRef } from 'react';

export default function LiquidMixer({ onComplete }) {
    const [volume, setVolume] = useState(0);
    const [target, setTarget] = useState(0);
    const [isPouring, setIsPouring] = useState(false);
    const [score, setScore] = useState(0);
    const [tries, setTries] = useState(3);
    const [win, setWin] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [showResult, setShowResult] = useState(false);
    const [accuracy, setAccuracy] = useState(0);

    const pourInterval = useRef(null);

    // Initialize random target
    useEffect(() => {
        setTarget(Math.floor(Math.random() * 60) + 20); // Target between 20-80
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
        <div className="lm-container">
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
                        style={{ height: `${volume}%`, background: win ? '#4ade80' : '#00f2ff' }}
                    >
                        <div className="lm-bubbles"></div>
                    </div>
                </div>

                {/* Beaker (Visual Only) */}
                <div className={`lm-beaker ${isPouring ? 'pouring' : ''}`}>
                    <div className="lm-beaker-liquid"></div>
                    {isPouring && <div className="lm-pour-stream"></div>}
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
                
                .lm-beaker {
                    width: 60px; height: 70px; border: 2px solid rgba(255,255,255,0.2);
                    border-radius: 0 0 10px 10px; position: relative;
                    transition: transform 0.3s; transform-origin: top right;
                }
                .lm-beaker.pouring { transform: rotate(-45deg) translate(-20px, 20px); }
                .lm-beaker-liquid {
                    position: absolute; bottom: 0; left: 0; width: 100%; height: 60%;
                    background: #00f2ff; opacity: 0.5; border-radius: 0 0 8px 8px;
                }
                .lm-pour-stream {
                    position: absolute; top: 0; right: 0; width: 4px; height: 200px;
                    background: linear-gradient(to bottom, #00f2ff, rgba(0,242,255,0.3));
                    box-shadow: 0 0 10px #00f2ff;
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
