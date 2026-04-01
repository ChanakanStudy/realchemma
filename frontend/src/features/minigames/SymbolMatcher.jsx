import React, { useState, useEffect, useRef } from 'react';

const ELEMENT_PAIRS = [
    { name: 'Hydrogen',   symbol: 'H',  color: '#4fc3f7' },
    { name: 'Helium',     symbol: 'He', color: '#ce93d8' },
    { name: 'Carbon',     symbol: 'C',  color: '#a5d6a7' },
    { name: 'Oxygen',     symbol: 'O',  color: '#ef9a9a' },
    { name: 'Nitrogen',   symbol: 'N',  color: '#ffe082' },
    { name: 'Sodium',     symbol: 'Na', color: '#80cbc4' },
    { name: 'Iron',       symbol: 'Fe', color: '#ffcc80' },
    { name: 'Gold',       symbol: 'Au', color: '#ffd54f' },
    { name: 'Silver',     symbol: 'Ag', color: '#e0e0e0' },
    { name: 'Copper',     symbol: 'Cu', color: '#ff8a65' },
];

function shuffle(arr) {
    return [...arr].sort(() => Math.random() - 0.5);
}

export default function SymbolMatcher({ onComplete }) {
    const [pairs, setPairs] = useState([]);
    const [symbols, setSymbols] = useState([]);
    const [selectedName, setSelectedName] = useState(null);
    const [matched, setMatched] = useState(new Set());
    const [wrongPair, setWrongPair] = useState(null);
    const [score, setScore] = useState(0);
    const [timer, setTimer] = useState(60);
    const [gameOver, setGameOver] = useState(false);
    const [win, setWin] = useState(false);
    const timerRef = useRef(null);

    useEffect(() => {
        const chosen = shuffle(ELEMENT_PAIRS).slice(0, 6);
        setPairs(chosen);
        setSymbols(shuffle(chosen));
        timerRef.current = setInterval(() => {
            setTimer(t => {
                if (t <= 1) {
                    clearInterval(timerRef.current);
                    setGameOver(true);
                    return 0;
                }
                return t - 1;
            });
        }, 1000);
        return () => clearInterval(timerRef.current);
    }, []);

    useEffect(() => {
        if (pairs.length > 0 && matched.size === pairs.length) {
            clearInterval(timerRef.current);
            setWin(true);
        }
    }, [matched, pairs]);

    const handleSelectName = (name) => {
        if (matched.has(name) || gameOver) return;
        setSelectedName(name);
    };

    const handleSelectSymbol = (pair) => {
        if (!selectedName || matched.has(pair.name) || gameOver) return;
        if (pair.name === selectedName) {
            const newMatched = new Set(matched);
            newMatched.add(pair.name);
            setMatched(newMatched);
            setScore(s => s + 100 + Math.floor(timer * 1.5));
            setSelectedName(null);
        } else {
            setWrongPair(pair.name);
            setScore(s => Math.max(0, s - 20));
            setTimeout(() => {
                setWrongPair(null);
                setSelectedName(null);
            }, 600);
        }
    };

    const timerColor = timer > 30 ? '#00f2ff' : timer > 10 ? '#ffd54f' : '#ef5350';

    if (win || gameOver) {
        return (
            <div className="mg-result-screen">
                <div className="mg-result-icon">{win ? '🏆' : '⏱️'}</div>
                <h2 className="mg-result-title">{win ? 'ผ่านการทดสอบ!' : 'หมดเวลาแล้ว!'}</h2>
                <p className="mg-result-sub">
                    {win
                        ? `เจ้าพิสูจน์ตนแล้ว... คะแนน: ${score}`
                        : `จับคู่ได้ ${matched.size}/${pairs.length} คู่ ∙ คะแนน: ${score}`}
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
        <div className="sm-container">
            {/* Header */}
            <div className="sm-header">
                <div className="sm-stat">
                    <span className="sm-stat-label">SCORE</span>
                    <span className="sm-stat-value">{score}</span>
                </div>
                <div className="sm-title-block">
                    <div className="sm-title">SYMBOL MATCHER</div>
                    <div className="sm-subtitle">จับคู่ชื่อธาตุกับสัญลักษณ์</div>
                </div>
                <div className="sm-stat">
                    <span className="sm-stat-label">TIME</span>
                    <span className="sm-stat-value" style={{ color: timerColor }}>{timer}s</span>
                </div>
            </div>

            {/* Progress bar */}
            <div className="sm-progress-wrap">
                <div className="sm-progress-bar" style={{ width: `${(timer / 60) * 100}%`, background: timerColor }} />
            </div>

            {/* Game area */}
            <div className="sm-game-area">
                {/* Name column */}
                <div className="sm-column">
                    <div className="sm-col-label">ชื่อธาตุ</div>
                    {pairs.map(p => {
                        const isMatched = matched.has(p.name);
                        const isSelected = selectedName === p.name;
                        return (
                            <button
                                key={p.name}
                                className={`sm-card name-card ${isSelected ? 'selected' : ''} ${isMatched ? 'matched' : ''}`}
                                style={{ '--card-color': p.color }}
                                onClick={() => handleSelectName(p.name)}
                                disabled={isMatched}
                            >
                                {isMatched ? <span className="sm-check">✓</span> : null}
                                {p.name}
                            </button>
                        );
                    })}
                </div>

                {/* Connector line */}
                <div className="sm-connector">
                    {pairs.map((_, i) => (
                        <div key={i} className="sm-dot" />
                    ))}
                </div>

                {/* Symbol column */}
                <div className="sm-column">
                    <div className="sm-col-label">สัญลักษณ์</div>
                    {symbols.map(p => {
                        const isMatched = matched.has(p.name);
                        const isWrong = wrongPair === p.name;
                        return (
                            <button
                                key={p.symbol}
                                className={`sm-card symbol-card ${isWrong ? 'wrong' : ''} ${isMatched ? 'matched' : ''} ${selectedName ? 'pulse' : ''}`}
                                style={{ '--card-color': p.color }}
                                onClick={() => handleSelectSymbol(p)}
                                disabled={isMatched}
                            >
                                {isMatched ? <span className="sm-check">✓</span> : null}
                                <span className="sm-symbol-text">{p.symbol}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Hint */}
            <div className="sm-hint">
                {selectedName
                    ? `✦ เลือก "${selectedName}" แล้ว — กดสัญลักษณ์ที่ตรงกัน`
                    : '✦ กดชื่อธาตุทางซ้าย แล้วเลือกสัญลักษณ์ทางขวา'}
            </div>

            <style>{`
                .sm-container {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    padding: 4px;
                }
                .sm-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .sm-stat { text-align: center; }
                .sm-stat-label { display: block; font-size: 0.65rem; color: #666; letter-spacing: 2px; }
                .sm-stat-value { font-size: 1.4rem; font-weight: bold; color: #00f2ff; font-family: monospace; }
                .sm-title-block { text-align: center; }
                .sm-title { font-size: 1.1rem; font-weight: bold; color: #fff; letter-spacing: 2px; }
                .sm-subtitle { font-size: 0.75rem; color: #888; margin-top: 2px; }
                .sm-progress-wrap {
                    height: 4px; background: #1e1e3a; border-radius: 2px; overflow: hidden;
                }
                .sm-progress-bar {
                    height: 100%; border-radius: 2px;
                    transition: width 1s linear, background 0.5s;
                    box-shadow: 0 0 6px currentColor;
                }
                .sm-game-area {
                    display: flex;
                    gap: 12px;
                    align-items: flex-start;
                }
                .sm-column {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                .sm-col-label {
                    text-align: center;
                    font-size: 0.7rem;
                    color: #555;
                    letter-spacing: 2px;
                    margin-bottom: 4px;
                    text-transform: uppercase;
                }
                .sm-connector {
                    display: flex;
                    flex-direction: column;
                    justify-content: space-around;
                    align-items: center;
                    gap: 8px;
                    padding-top: 28px;
                    width: 20px;
                }
                .sm-dot {
                    width: 6px; height: 6px; border-radius: 50%;
                    background: #333; border: 1px solid #444;
                }
                .sm-card {
                    padding: 10px 14px;
                    border-radius: 8px;
                    border: 1px solid #2a2a4a;
                    background: #12122a;
                    color: #ccc;
                    font-family: 'Mitr', sans-serif;
                    font-size: 0.9rem;
                    cursor: pointer;
                    text-align: center;
                    transition: all 0.2s;
                    position: relative;
                    overflow: hidden;
                }
                .sm-card:hover:not(:disabled) {
                    border-color: var(--card-color);
                    color: #fff;
                    background: #1a1a35;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.4);
                }
                .sm-card.selected {
                    border-color: var(--card-color);
                    background: rgba(0, 242, 255, 0.1);
                    color: #fff;
                    box-shadow: 0 0 12px rgba(0, 242, 255, 0.3);
                }
                .sm-card.matched {
                    border-color: #388e3c;
                    background: rgba(56, 142, 60, 0.15);
                    color: #66bb6a;
                    cursor: default;
                }
                .sm-card.wrong {
                    border-color: #ef5350;
                    background: rgba(239, 83, 80, 0.15);
                    animation: shake 0.3s ease;
                }
                .sm-card.pulse:not(.matched):not(:disabled) {
                    animation: glow 1s infinite alternate;
                }
                .sm-symbol-text {
                    font-size: 1.3rem;
                    font-weight: bold;
                    color: var(--card-color);
                }
                .sm-check {
                    position: absolute; left: 8px; top: 50%;
                    transform: translateY(-50%);
                    color: #66bb6a; font-size: 0.8rem;
                }
                .sm-hint {
                    text-align: center;
                    font-size: 0.8rem;
                    color: #555;
                    padding: 8px;
                    border-top: 1px solid #1e1e3a;
                }
                .mg-result-screen {
                    display: flex; flex-direction: column;
                    align-items: center; justify-content: center;
                    gap: 16px; padding: 24px; text-align: center; min-height: 300px;
                }
                .mg-result-icon { font-size: 4rem; }
                .mg-result-title { font-size: 1.8rem; color: #fff; margin: 0; }
                .mg-result-sub { color: #aaa; margin: 0; }
                .mg-result-actions { margin-top: 16px; }
                .mg-btn {
                    padding: 12px 32px; border-radius: 8px; border: none;
                    font-family: 'Mitr', sans-serif; font-size: 1rem; cursor: pointer;
                    transition: all 0.2s;
                }
                .mg-btn.primary {
                    background: #00f2ff; color: #0a0a1a; font-weight: bold;
                }
                .mg-btn.primary:hover { box-shadow: 0 0 20px rgba(0,242,255,0.5); transform: scale(1.05); }
                @keyframes shake {
                    0%,100% { transform: translateX(0); }
                    25% { transform: translateX(-6px); }
                    75% { transform: translateX(6px); }
                }
                @keyframes glow {
                    from { box-shadow: 0 0 4px rgba(0,242,255,0.1); }
                    to   { box-shadow: 0 0 12px rgba(0,242,255,0.3); }
                }
            `}</style>
        </div>
    );
}
