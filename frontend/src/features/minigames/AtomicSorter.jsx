import React, { useState, useEffect, useRef } from 'react';
import { eventBus } from '../../core/EventBus';
import { EVENTS } from '../../core/constants';

const ELEMENTS = [
    { name: 'Hydrogen', symbol: 'H', number: 1, color: '#4fc3f7' },
    { name: 'Helium', symbol: 'He', number: 2, color: '#ce93d8' },
    { name: 'Lithium', symbol: 'Li', number: 3, color: '#a5d6a7' },
    { name: 'Beryllium', symbol: 'Be', number: 4, color: '#ef9a9a' },
    { name: 'Boron', symbol: 'B', number: 5, color: '#ffe082' },
    { name: 'Carbon', symbol: 'C', number: 6, color: '#81c784' },
    { name: 'Nitrogen', symbol: 'N', number: 7, color: '#90caf9' },
    { name: 'Oxygen', symbol: 'O', number: 8, color: '#f48fb1' },
    { name: 'Sodium', symbol: 'Na', number: 11, color: '#80cbc4' },
    { name: 'Iron', symbol: 'Fe', number: 26, color: '#ffcc80' },
    { name: 'Gold', symbol: 'Au', number: 79, color: '#ffd54f' },
    { name: 'Clorine', symbol: 'Cl', number: 17, color: '#901dc6ff' },
];

function shuffle(arr) {
    return [...arr].sort(() => Math.random() - 0.5);
}

export default function AtomicSorter({ onComplete }) {
    const [items, setItems] = useState([]);
    const [score, setScore] = useState(0);
    const [timer, setTimer] = useState(60);
    const [gameOver, setGameOver] = useState(false);
    const [win, setWin] = useState(false);
    const [draggingIdx, setDraggingIdx] = useState(null);
    const timerRef = useRef(null);

    useEffect(() => {
        const chosen = shuffle(ELEMENTS).slice(0, 4);
        setItems(shuffle(chosen));

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

    const handleSwap = (idx1, idx2) => {
        const newItems = [...items];
        [newItems[idx1], newItems[idx2]] = [newItems[idx2], newItems[idx1]];
        setItems(newItems);
    };

    const checkOrder = () => {
        const isSorted = items.every((el, i) => i === 0 || el.number >= items[i - 1].number);
        if (isSorted) {
            clearInterval(timerRef.current);
            const finalScore = score + 500 + (timer * 10);
            setScore(finalScore);
            setWin(true);
            
            // Emit win event for rewards
            eventBus.emit(EVENTS.MINIGAME_WON, { 
                gameId: 'atomic_sorter', 
                score: finalScore, 
                difficulty: 'hard' 
            });
        } else {
            setScore(s => Math.max(0, s - 50));
            // Visual shake feedback (could be added)
            alert("ลำดับยังไม่ถูกต้อง! ลองสถาปนาธาตุใหม่ดู...");
        }
    };

    const timerColor = timer > 30 ? '#00f2ff' : timer > 10 ? '#ffd54f' : '#ef5350';

    if (win || gameOver) {
        return (
            <div className="mg-result-screen">
                <div className="mg-result-icon">{win ? '⚖️' : '⏱️'}</div>
                <h2 className="mg-result-title">{win ? 'เรียงลำดับสมบูรณ์!' : 'เวลาหมดแล้ว!'}</h2>
                <p className="mg-result-sub">
                    {win ? `เจ้าเข้าใจพื้นฐานแห่งเลขอะตอม... คะแนน: ${score}` : `คะแนน: ${score}`}
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
        <div className="as-container">
            <div className="as-header">
                <div className="sm-stat">
                    <span className="sm-stat-label">SCORE</span>
                    <span className="sm-stat-value">{score}</span>
                </div>
                <div className="sm-title-block">
                    <div className="sm-title">ATOMIC SORTER</div>
                    <div className="sm-subtitle">เรียงเลขอะตอมจาก "น้อย" ไป "มาก"</div>
                </div>
                <div className="sm-stat">
                    <span className="sm-stat-label">TIME</span>
                    <span className="sm-stat-value" style={{ color: timerColor }}>{timer}s</span>
                </div>
            </div>

            {/* Slots Area */}
            <div className="as-slots-area">
                {items.map((item, idx) => (
                    <div
                        key={`${item.number}-${idx}`}
                        className={`as-item-card ${draggingIdx === idx ? 'dragging' : ''}`}
                        draggable
                        onDragStart={() => setDraggingIdx(idx)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => {
                            handleSwap(draggingIdx, idx);
                            setDraggingIdx(null);
                        }}
                    >
                        <div className="as-card-number">#{item.number}</div>
                        <div className="as-card-symbol" style={{ color: item.color }}>{item.symbol}</div>
                        <div className="as-card-name">{item.name}</div>
                        <div className="as-drag-handle">⋮⋮</div>
                    </div>
                ))}
            </div>

            <div className="as-controls">
                <button className="mg-btn primary" onClick={checkOrder}>
                    ตรวจสอบความถูกต้อง
                </button>
            </div>

            <div className="as-hint">
                ✦ ลากและวาง (Drag & Drop) เพื่อสลับตำแหน่งธาตุ
            </div>

            <style>{`
                .as-container { display: flex; flex-direction: column; gap: 20px; padding: 10px; }
                .as-header { display: flex; justify-content: space-between; align-items: center; }
                .as-slots-area { 
                    display: flex; flex-direction: column; gap: 12px; 
                    background: rgba(255,255,255,0.02); padding: 16px; border-radius: 12px;
                    border: 1px dashed rgba(0,242,255,0.2);
                }
                .as-item-card {
                    display: flex; align-items: center; justify-content: space-between;
                    background: #111122; border: 1px solid #1e1e3a; border-radius: 10px;
                    padding: 12px 20px; cursor: grab; transition: all 0.2s;
                    position: relative;
                }
                .as-item-card:hover { border-color: #00f2ff; background: #1a1a35; }
                .as-item-card.dragging { opacity: 0.5; border: 2px dashed #00f2ff; }
                .as-card-number { font-family: monospace; color: #555; width: 40px; font-size: 0.8rem; }
                .as-card-symbol { font-size: 1.4rem; font-weight: bold; width: 60px; text-shadow: 0 0 10px currentColor; }
                .as-card-name { flex: 1; font-size: 1rem; color: #ccc; }
                .as-drag-handle { color: #333; font-size: 1.2rem; cursor: grab; }
                .as-controls { display: flex; justify-content: center; margin-top: 10px; }
                .as-hint { text-align: center; color: #555; font-size: 0.8rem; }
            `}</style>
        </div>
    );
}
