import React, { useState, useEffect, useRef } from 'react';
import { eventBus } from '../../core/EventBus';
import { EVENTS } from '../../core/constants';

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
    { name: 'Silicon',    symbol: 'Si', color: '#90a4ae' },
    { name: 'Sulfur',     symbol: 'S',  color: '#fff176' },
    { name: 'Chlorine',   symbol: 'Cl', color: '#aed581' },
    { name: 'Mercury',    symbol: 'Hg', color: '#b0bec5' },
];

function shuffle(arr) {
    return [...arr].sort(() => Math.random() - 0.5);
}

export default function ElementMemory({ onComplete }) {
    const [cards, setCards] = useState([]);
    const [flipped, setFlipped] = useState([]);
    const [matched, setMatched] = useState(new Set());
    const [score, setScore] = useState(0);
    const [timer, setTimer] = useState(60);
    const [moves, setMoves] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [win, setWin] = useState(false);
    const timerRef = useRef(null);

    // Initialize game
    useEffect(() => {
        const chosen = shuffle(ELEMENT_PAIRS).slice(0, 6); // 6 pairs = 12 cards
        let gameCards = [];
        chosen.forEach((item, index) => {
            gameCards.push({ id: `name-${index}`, content: item.name, symbol: item.symbol, type: 'name', color: item.color, matchId: index });
            gameCards.push({ id: `symbol-${index}`, content: item.symbol, type: 'symbol', color: item.color, matchId: index });
        });
        setCards(shuffle(gameCards));

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

    // Win condition check
    useEffect(() => {
        if (cards.length > 0 && matched.size === cards.length / 2) {
            clearInterval(timerRef.current);
            setWin(true);
            
            // Emit win event for rewards
            eventBus.emit(EVENTS.MINIGAME_WON, { 
                gameId: 'element_memory', 
                score: score, 
                difficulty: 'med' 
            });
        }
    }, [matched, cards]);

    const handleFlip = (card) => {
        if (flipped.length === 2 || matched.has(card.matchId) || flipped.some(f => f.id === card.id) || gameOver) return;

        const newFlipped = [...flipped, card];
        setFlipped(newFlipped);

        if (newFlipped.length === 2) {
            setMoves(m => m + 1);
            if (newFlipped[0].matchId === newFlipped[1].matchId) {
                const newMatched = new Set(matched);
                newMatched.add(newFlipped[0].matchId);
                setMatched(newMatched);
                setScore(s => s + 150 + Math.floor(timer * 2));
                setFlipped([]);
            } else {
                setScore(s => Math.max(0, s - 10));
                setTimeout(() => setFlipped([]), 800);
            }
        }
    };

    const timerColor = timer > 30 ? '#00f2ff' : timer > 10 ? '#ffd54f' : '#ef5350';

    if (win || gameOver) {
        return (
            <div className="mg-result-screen">
                <div className="mg-result-icon">{win ? '🧠' : '⏱️'}</div>
                <h2 className="mg-result-title">{win ? 'ความจำยอดเยี่ยม!' : 'เวลาหมดแล้ว!'}</h2>
                <p className="mg-result-sub">
                    {win 
                        ? `เอลิมาประทับใจในความจำของเจ้า... คะแนน: ${score} ∙ ใช้ไป ${moves} ครั้ง` 
                        : `จับคู่ได้ ${matched.size}/6 คู่ ∙ คะแนน: ${score}`}
                </p>
                <div className="mg-result-actions">
                    <button className="mg-btn primary" onClick={onComplete}>
                        {win ? '✓ รับพลังธาตุ' : '↺ ลองอีกครั้ง'}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="em-container">
            {/* Header */}
            <div className="em-header">
                <div className="sm-stat">
                    <span className="sm-stat-label">SCORE</span>
                    <span className="sm-stat-value">{score}</span>
                </div>
                <div className="sm-title-block">
                    <div className="sm-title">ELEMENT MEMORY</div>
                    <div className="sm-subtitle">เปิดป้ายจับคู่ธาตุ | ครั้งที่: {moves}</div>
                </div>
                <div className="sm-stat">
                    <span className="sm-stat-label">TIME</span>
                    <span className="sm-stat-value" style={{ color: timerColor }}>{timer}s</span>
                </div>
            </div>

            {/* Grid */}
            <div className="em-grid">
                {cards.map(card => {
                    const isFlipped = flipped.some(f => f.id === card.id);
                    const isMatched = matched.has(card.matchId);
                    return (
                        <div 
                            key={card.id} 
                            className={`em-card-wrap ${isFlipped || isMatched ? 'flipped' : ''} ${isMatched ? 'matched' : ''}`}
                            onClick={() => handleFlip(card)}
                        >
                            <div className="em-card-inner">
                                <div className="em-card-back">
                                    <div className="em-back-icon">⚛</div>
                                </div>
                                <div className="em-card-front" style={{ '--card-color': card.color }}>
                                    {isMatched && <div className="em-card-check">✓</div>}
                                    <div className="em-card-content">
                                        <div className="em-card-main">{card.content}</div>
                                        <div className="em-card-type">{card.type === 'name' ? 'NAME' : 'SYMBOL'}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <style>{`
                .em-container {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }
                .em-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .em-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 12px;
                    padding: 10px;
                }
                .em-card-wrap {
                    height: 100px;
                    perspective: 1000px;
                    cursor: pointer;
                }
                .em-card-inner {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    text-align: center;
                    transition: transform 0.6s;
                    transform-style: preserve-3d;
                    border-radius: 10px;
                }
                .em-card-wrap.flipped .em-card-inner {
                    transform: rotateY(180deg);
                }
                .em-card-back, .em-card-front {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    -webkit-backface-visibility: hidden;
                    backface-visibility: hidden;
                    border-radius: 10px;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    border: 2px solid rgba(0, 242, 255, 0.2);
                }
                .em-card-back {
                    background: #111122;
                    color: #00f2ff;
                    font-size: 2rem;
                    box-shadow: inset 0 0 15px rgba(0, 242, 255, 0.1);
                }
                .em-card-front {
                    background: #0d0d1a;
                    transform: rotateY(180deg);
                    border-color: var(--card-color);
                    box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.2);
                }
                .em-card-front::after {
                    content: '';
                    position: absolute;
                    top: 4px; left: 4px; right: 4px; bottom: 4px;
                    border: 1px solid rgba(255,255,255,0.05);
                    border-radius: 6px;
                }
                .em-card-content {
                    z-index: 2;
                }
                .em-card-main {
                    font-size: 0.9rem;
                    font-weight: bold;
                    color: var(--card-color);
                    text-transform: uppercase;
                }
                .em-card-type {
                    font-size: 0.6rem;
                    color: #555;
                    margin-top: 4px;
                    letter-spacing: 1px;
                }
                .em-card-check {
                    position: absolute;
                    top: 5px; right: 8px;
                    color: #4ade80;
                    font-size: 0.8rem;
                }
                .em-card-wrap.matched .em-card-front {
                    background: rgba(56, 142, 60, 0.1);
                    border-color: #388e3c;
                    opacity: 0.7;
                }
                .em-back-icon {
                    animation: rotate 4s infinite linear;
                    opacity: 0.5;
                }
                @keyframes rotate {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
