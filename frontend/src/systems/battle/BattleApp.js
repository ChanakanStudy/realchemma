import htm from 'https://unpkg.com/htm?module';
const html = htm.bind(React.createElement);

const { useState, useEffect, useCallback } = React;

const ELEMENTS = [
    { symbol: 'H', name: 'Hydrogen', color: 'bg-blue-600', border: 'border-blue-400' },
    { symbol: 'O', name: 'Oxygen', color: 'bg-emerald-600', border: 'border-emerald-400' },
    { symbol: 'Na', name: 'Sodium', color: 'bg-yellow-600', border: 'border-yellow-400' },
    { symbol: 'Cl', name: 'Chlorine', color: 'bg-green-600', border: 'border-green-400' },
    { symbol: 'C', name: 'Carbon', color: 'bg-slate-700', border: 'border-slate-500' }
];

const RECIPES = [
    { id: 'H2O', name: 'Water (H2O)', formula: { H: 2, O: 1 }, damage: 30, status: 'Wet', color: 'bg-blue-600 border-blue-300' },
    { id: 'HCl', name: 'Acid (HCl)', formula: { H: 1, Cl: 1 }, damage: 80, status: 'Corroded', color: 'bg-green-600 border-green-300' },
    { id: 'NaCl', name: 'Salt (NaCl)', formula: { Na: 1, Cl: 1 }, damage: 50, status: 'Crystalized', color: 'bg-yellow-100 border-white text-black' },
    { id: 'NaOH', name: 'Base (NaOH)', formula: { Na: 1, O: 1, H: 1 }, damage: 100, status: 'Burned', color: 'bg-purple-600 border-purple-300' },
    { id: 'CO2', name: 'Smog (CO2)', formula: { C: 1, O: 2 }, damage: 20, status: 'Suffocated', color: 'bg-slate-600 border-slate-400' }
];

const MAX_TIME = 30;

export default function BattleApp() {
    const [phase, setPhase] = useState(1); 
    const [timeLeft, setTimeLeft] = useState(MAX_TIME);
    const [turn, setTurn] = useState(1);
    const [playerHP, setPlayerHP] = useState(300);
    const [monsterHP, setMonsterHP] = useState(1500);
    const [monsterStatuses, setMonsterStatuses] = useState([]);
    const [crucible, setCrucible] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [logs, setLogs] = useState(['WILD HOMUNCULUS APPEARED!']);
    const [isUltimateReady, setIsUltimateReady] = useState(false);
    
    const [monsterHit, setMonsterHit] = useState(false);
    const [playerHit, setPlayerHit] = useState(false);
    const [attackEffect, setAttackEffect] = useState(null);

    const addLog = (msg) => setLogs(prev => [msg, ...prev].slice(0, 4));

    useEffect(() => {
        if (phase >= 4 || phase === 0) return;
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    handleNextPhase();
                    return MAX_TIME;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [phase]);

    const handleNextPhase = useCallback(() => {
        setCrucible([]);
        if (phase === 1) {
            setPhase(2); setTimeLeft(MAX_TIME); addLog('>> ENTER COMBAT PHASE <<');
        } else if (phase === 2) {
            setPhase(3); setTimeLeft(MAX_TIME); checkUltimateCondition(); addLog('>> ENTER JUDGEMENT PHASE <<');
        } else if (phase === 3) {
            setPhase(4); addLog('ENEMY IS CASTING MAGIC!');
            setTimeout(monsterTurn, 1500);
        }
    }, [phase, monsterStatuses]);

    const addElement = (el) => {
        if (crucible.length < 5) setCrucible([...crucible, el]);
    };

    const craftCompound = () => {
        if (crucible.length === 0) return;
        const counts = crucible.reduce((acc, el) => {
            acc[el] = (acc[el] || 0) + 1;
            return acc;
        }, {});

        const matchedRecipe = RECIPES.find(recipe => {
            const formulaKeys = Object.keys(recipe.formula);
            if (formulaKeys.length !== Object.keys(counts).length) return false;
            return formulaKeys.every(key => recipe.formula[key] === counts[key]);
        });

        if (matchedRecipe) {
            setInventory([...inventory, matchedRecipe]);
            addLog(`CRAFTED: ${matchedRecipe.name}`);
            setAttackEffect('craft');
            setTimeout(() => setAttackEffect(null), 500);
        } else {
            addLog('FAILED: INVALID RECIPE!');
        }
        setCrucible([]);
    };

    const useCompound = (index) => {
        const compound = inventory[index];
        const newInv = [...inventory];
        newInv.splice(index, 1);
        setInventory(newInv);

        setAttackEffect('hit');
        setTimeout(() => {
            setMonsterHit(true);
            setTimeout(() => setMonsterHit(false), 200);
            setAttackEffect(null);
        }, 200);

        setMonsterHP(prev => Math.max(0, prev - compound.damage));
        if (compound.status && !monsterStatuses.includes(compound.status)) {
            setMonsterStatuses(prev => [...prev, compound.status]);
        }
        addLog(`THREW ${compound.name}! DMG: ${compound.damage}`);

        if (monsterHP - compound.damage <= 0) endGame(true, 'HOMUNCULUS DEFEATED!');
    };

    const checkUltimateCondition = () => {
        const req = ['Wet', 'Corroded', 'Crystalized'];
        const hasAll = req.every(s => monsterStatuses.includes(s));
        setIsUltimateReady(hasAll);
        if(hasAll) addLog('WARNING: ULTIMATE CHAIN REACTION READY!');
    };

    const executeUltimate = () => {
        setAttackEffect('ultimate');
        setTimeout(() => {
            setMonsterHit(true);
            setMonsterHP(0);
            addLog('GRAND CHEMICAL ANNIHILATION!!!');
            setTimeout(() => endGame(true, 'TARGET COMPLETELY VAPORIZED!'), 1500);
        }, 1000);
    };

    const monsterTurn = () => {
        if (monsterHP <= 0) return;
        setPlayerHit(true);
        setTimeout(() => setPlayerHit(false), 300);
        
        const dmg = Math.floor(Math.random() * 30) + 40;
        setPlayerHP(prev => Math.max(0, prev - dmg));
        addLog(`HOMUNCULUS ATTACKS! DMG: ${dmg}`);

        if (playerHP - dmg <= 0) {
            endGame(false, 'YOU DIED...');
            return;
        }
        setTimeout(() => {
            setTurn(prev => prev + 1);
            setPhase(1); setTimeLeft(MAX_TIME);
            addLog(`--- TURN ${turn + 1} | SETUP PHASE ---`);
        }, 2000);
    };

    const endGame = (isWin, reason) => { setPhase(5); addLog(reason); };

    const restartGame = () => {
        setPhase(1); setTurn(1); setTimeLeft(MAX_TIME);
        setPlayerHP(300); setMonsterHP(1500);
        setInventory([]); setCrucible([]); setMonsterStatuses([]);
        setLogs(['BATTLE RESTARTED!']); setIsUltimateReady(false);
    };

    const quitBattleApp = () => {
        window.quitBattle();
    };

    const HPBar = ({ hp, maxHp }) => {
        const totalBlocks = 20;
        const filledBlocks = Math.ceil((hp / maxHp) * totalBlocks);
        return html`
            <div className="flex gap-[2px] mt-2 bg-black p-1 border-2 border-slate-600">
                ${Array.from({length: totalBlocks}).map((_, i) => html`
                    <div key=${i} className=${`flex-1 h-3 ${i < filledBlocks ? (hp/maxHp > 0.5 ? 'bg-green-500' : hp/maxHp > 0.2 ? 'bg-yellow-400' : 'bg-red-500') : 'bg-slate-800'}`} />
                `)}
            </div>
        `;
    };

    const StatusPlate = ({ isPlayer, name, hp, maxHp, statuses, level }) => html`
        <div className="relative w-80 bg-slate-900 border-4 border-slate-300 p-3 shadow-[8px_8px_0_0_#000] font-hud">
            <div className="flex justify-between items-end border-b-2 border-slate-600 pb-1 mb-1">
                <span className="font-epic text-xs text-white uppercase">${name}</span>
                <span className="text-sm text-yellow-400">Lv${level}</span>
            </div>
            <div className="text-right text-lg text-white font-bold tracking-widest mt-1">
                HP: ${hp}/${maxHp}
            </div>
            <${HPBar} hp=${hp} maxHp=${maxHp} />
            ${!isPlayer && html`
                <div className="flex gap-2 mt-2 h-6">
                    ${statuses.map((s, i) => html`
                        <div key=${i} className="px-1 py-0.5 bg-slate-800 border-2 border-slate-500 text-xs text-white font-bold uppercase animate-[pulse_1s_steps(2)_infinite]">
                            ${s}
                        </div>
                    `)}
                </div>
            `}
        </div>
    `;

    return html`
        <div className="relative w-full h-screen bg-slate-950 text-white font-hud overflow-hidden flex flex-col selection:bg-indigo-500/30">
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0" style=${{ backgroundColor: '#1e1b4b', backgroundImage: `repeating-linear-gradient(45deg, #2e1065 25%, transparent 25%, transparent 75%, #2e1065 75%, #2e1065), repeating-linear-gradient(45deg, #2e1065 25%, #1e1b4b 25%, #1e1b4b 75%, #2e1065 75%, #2e1065)`, backgroundPosition: `0 0, 32px 32px`, backgroundSize: `64px 64px`, opacity: 0.6 }} />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(167,139,250,0.1)_2px,transparent_2px),linear-gradient(90deg,rgba(167,139,250,0.1)_2px,transparent_2px)] bg-[size:64px_64px]" />
            </div>
            
            <div className="flex-1 relative w-full max-w-5xl mx-auto p-8 flex flex-col justify-between z-10">
                <div className="flex justify-between items-start w-full">
                    <div className="transform translate-y-4">
                        <${StatusPlate} name="Homunculus Omega" hp=${monsterHP} maxHp=${1500} statuses=${monsterStatuses} level="99" />
                    </div>
                    <div className=${`relative w-64 h-64 flex items-center justify-center transform transition-all ${monsterHit ? 'translate-x-4 brightness-200 invert' : 'animate-[bounce_2s_steps(4)_infinite]'}`}>
                        <svg viewBox="0 0 16 16" width="100%" height="100%" style=${{shapeRendering: "crispEdges"}} className="drop-shadow-[0_0_20px_rgba(220,38,38,0.8)]">
                            <path d="M6,1 h4 v2 h2 v2 h2 v6 h-2 v2 h-2 v2 h-4 v-2 h-2 v-2 h-2 v-6 h2 v-2 h2 z" fill="#7f1d1d" />
                            <path d="M7,3 h2 v2 h2 v4 h-2 v2 h-2 v-2 h-2 v-4 h2 z" fill="#dc2626" />
                            <path d="M7,5 h2 v4 h-2 z" fill="#f87171" className="animate-[pulse_1s_steps(2)_infinite]" />
                            <rect x="7" y="6" width="2" height="2" fill="#fef08a" />
                            <rect x="8" y="7" width="1" height="1" fill="#000" />
                            <rect x="2" y="4" width="2" height="2" fill="#fca5a5" className="animate-[ping_1.5s_steps(2)_infinite]"/>
                            <rect x="12" y="10" width="2" height="2" fill="#fca5a5" className="animate-[ping_2s_steps(2)_infinite]"/>
                        </svg>
                    </div>
                </div>

                ${attackEffect && attackEffect !== 'craft' && html`
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
                        ${attackEffect === 'ultimate' ? html`
                            <div className="w-full h-full bg-white animate-[ping_0.5s_steps(2)_infinite] mix-blend-overlay" />
                        ` : html`
                            <div className="w-32 h-32 bg-white animate-[ping_0.2s_steps(2)_forwards]" style=${{shapeRendering: "crispEdges"}} />
                        `}
                    </div>
                `}

                <div className="flex justify-between items-end w-full mb-2">
                    <div className=${`relative w-48 h-48 flex items-end justify-start transform transition-all ${playerHit ? '-translate-y-4 brightness-50' : 'animate-[bounce_3s_steps(4)_infinite]'}`}>
                        <svg viewBox="0 0 16 16" width="100%" height="100%" style=${{shapeRendering: "crispEdges"}} className="drop-shadow-[0_0_15px_rgba(59,130,246,0.6)]">
                            <rect x="5" y="2" width="6" height="2" fill="#1e3a8a" />
                            <rect x="4" y="4" width="8" height="2" fill="#2563eb" />
                            <rect x="2" y="6" width="12" height="2" fill="#1d4ed8" />
                            <rect x="6" y="8" width="4" height="2" fill="#fcd34d" />
                            <rect x="6" y="8" width="1" height="1" fill="#000" />
                            <rect x="9" y="8" width="1" height="1" fill="#000" />
                            <rect x="4" y="10" width="8" height="6" fill="#1e40af" />
                            <rect x="13" y="4" width="2" height="2" fill="#fbbf24" className="animate-[pulse_1s_steps(2)_infinite]" />
                            <rect x="13" y="6" width="2" height="10" fill="#78350f" />
                        </svg>
                    </div>
                    <div className="transform -translate-y-4">
                        <${StatusPlate} isPlayer name="Alchemist" hp=${playerHP} maxHp=${300} level="42" />
                    </div>
                </div>
                
                <button onClick=${quitBattleApp} className="absolute top-4 right-4 bg-red-600 text-white px-4 py-2 font-epic text-[10px] border-2 border-white shadow-[4px_4px_0_0_#000] hover:bg-red-500 z-50">
                    RUN AWAY
                </button>
            </div>

            <div className="h-[40%] w-full bg-black border-t-4 border-slate-400 flex flex-col relative z-20 shadow-[0_-10px_20px_rgba(0,0,0,0.8)]">
                <div className="absolute -top-10 left-0 right-0 flex justify-center items-end">
                    <div className="bg-slate-900 border-4 border-b-0 border-slate-400 px-6 py-2 flex items-center gap-6 shadow-[8px_0_0_0_#000]">
                        <div className="flex gap-2">
                            ${[1,2,3].map(p => html`
                                <div key=${p} className=${`px-2 py-1 border-2 text-xs font-epic ${phase === p ? 'bg-indigo-600 border-white text-white' : 'bg-slate-800 border-slate-600 text-slate-500'}`}>
                                    P${p}
                                </div>
                            `)}
                        </div>
                        <div className=${`font-epic text-lg flex items-center gap-2 ${timeLeft <= 10 ? 'text-red-500 animate-[pulse_0.5s_steps(2)_infinite]' : 'text-white'}`}>
                            TIME:${timeLeft.toString().padStart(2, '0')}
                        </div>
                    </div>
                </div>

                <div className="flex-1 flex w-full max-w-6xl mx-auto p-4 gap-4">
                    <div className="flex-[2] bg-slate-900 border-4 border-slate-300 p-4 shadow-[inset_4px_4px_0_0_rgba(0,0,0,0.5)] flex flex-col relative">
                        ${phase === 1 && html`
                            <div className="flex flex-col h-full">
                                <div className="flex justify-between items-center border-b-2 border-slate-600 pb-2 mb-4">
                                    <span className="font-epic text-xs text-yellow-400">PHASE 1: SYNTHESIS</span>
                                    <button onClick=${handleNextPhase} className="px-3 py-1 bg-slate-800 border-2 border-white text-white text-xs font-epic hover:bg-white hover:text-black transition-colors">SKIP ${'>'}</button>
                                </div>
                                <div className="flex gap-4 flex-1">
                                    <div className="flex-1 grid grid-cols-5 gap-3">
                                        ${ELEMENTS.map(el => html`
                                            <button key=${el.symbol} onClick=${() => addElement(el.symbol)} className=${`relative flex flex-col items-center justify-center border-4 ${el.border} ${el.color} active:translate-y-1 active:shadow-none shadow-[4px_4px_0_0_#000] hover:brightness-110`} >
                                                <span className="font-epic text-xl text-white drop-shadow-[2px_2px_0_#000]">${el.symbol}</span>
                                            </button>
                                        `)}
                                    </div>
                                    <div className="w-64 bg-black border-4 border-indigo-500 p-3 flex flex-col">
                                        <span className="text-xs text-indigo-400 font-epic mb-2 text-center">CRUCIBLE</span>
                                        <div className="flex-1 flex flex-wrap gap-2 content-start bg-slate-900 border-2 border-slate-700 p-2">
                                            ${crucible.map((c, i) => {
                                                const elData = ELEMENTS.find(e => e.symbol === c);
                                                return html`
                                                    <div key=${i} className=${`w-8 h-8 flex items-center justify-center font-bold text-lg text-white border-2 border-white ${elData?.color} shadow-[2px_2px_0_0_#000]`}>
                                                        ${c}
                                                    </div>
                                                `;
                                            })}
                                        </div>
                                        <div className="flex gap-2 mt-3">
                                            <button onClick=${() => setCrucible([])} className="px-2 py-2 bg-red-900 border-2 border-red-500 hover:bg-red-700 text-white text-xs font-epic">CLR</button>
                                            <button onClick=${craftCompound} className=${`flex-1 py-2 border-2 text-xs font-epic ${crucible.length > 0 ? 'bg-indigo-600 border-white text-white hover:bg-indigo-500' : 'bg-slate-800 border-slate-600 text-slate-500 cursor-not-allowed'}`}>
                                                CRAFT
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `}

                        ${phase === 2 && html`
                            <div className="flex flex-col h-full">
                                <div className="flex justify-between items-center border-b-2 border-slate-600 pb-2 mb-4">
                                    <span className="font-epic text-xs text-red-400">PHASE 2: COMBAT INVENTORY</span>
                                    <button onClick=${handleNextPhase} className="px-3 py-1 bg-red-800 border-2 border-white text-white text-xs font-epic hover:bg-white hover:text-black transition-colors">END TURN ${'>'}</button>
                                </div>
                                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                                    ${inventory.length === 0 ? html`
                                        <div className="h-full flex items-center justify-center text-slate-500 font-epic text-sm">NO ITEMS IN BAG</div>
                                    ` : html`
                                        <div className="grid grid-cols-3 gap-4">
                                            ${inventory.map((comp, i) => html`
                                                <button key=${i} onClick=${() => useCompound(i)} className=${`relative p-3 text-left border-4 shadow-[4px_4px_0_0_#000] active:translate-y-1 active:shadow-none hover:brightness-125 ${comp.color}`} >
                                                    <div className=${`font-epic text-[10px] truncate mb-2 drop-shadow-[1px_1px_0_rgba(0,0,0,0.8)] ${comp.id === 'NaCl' ? 'text-black drop-shadow-none' : 'text-white'}`}>${comp.name}</div>
                                                    <div className=${`text-sm font-bold flex flex-col gap-1 ${comp.id === 'NaCl' ? 'text-black' : 'text-white'}`}>
                                                        <span className="bg-black/30 px-1 w-fit">DMG: ${comp.damage}</span>
                                                        <span className="bg-white/30 px-1 w-fit text-xs uppercase">${comp.status}</span>
                                                    </div>
                                                </button>
                                            `)}
                                        </div>
                                    `}
                                </div>
                            </div>
                        `}

                        ${phase === 3 && html`
                            <div className="flex flex-col h-full items-center justify-center">
                                <div className="text-sm font-epic text-purple-400 mb-6 drop-shadow-[2px_2px_0_#000]">JUDGEMENT PHASE</div>
                                ${isUltimateReady ? html`
                                    <button onClick=${executeUltimate} className="px-8 py-4 bg-red-600 border-4 border-white font-epic text-xl text-white shadow-[8px_8px_0_0_#000] active:translate-y-2 active:translate-x-2 active:shadow-none hover:bg-red-500 animate-[pulse_0.5s_steps(2)_infinite]">
                                        EXECUTE ULTIMATE!
                                    </button>
                                ` : html`
                                    <div className="flex flex-col items-center">
                                        <div className="text-slate-400 font-epic text-[10px] mb-6 border-2 border-red-900 bg-black p-4 leading-relaxed">
                                            LOCKED: REQUIRE [WET] + [CORRODED] + [CRYSTALIZED]
                                        </div>
                                        <button onClick=${handleNextPhase} className="px-6 py-3 bg-slate-800 border-4 border-slate-500 font-epic text-xs text-white hover:bg-white hover:text-black transition-colors shadow-[4px_4px_0_0_#000] active:translate-y-1 active:shadow-none">
                                            END PLAYER TURN
                                        </button>
                                    </div>
                                `}
                            </div>
                        `}

                        ${phase === 4 && html`
                            <div className="flex flex-col h-full items-center justify-center text-red-500 animate-[pulse_0.5s_steps(2)_infinite]">
                                <div className="font-epic text-2xl drop-shadow-[4px_4px_0_#000]">ENEMY TURN!</div>
                            </div>
                        `}

                        ${phase === 5 && html`
                            <div className="flex flex-col h-full items-center justify-center">
                                <div className=${`text-4xl font-epic mb-8 drop-shadow-[4px_4px_0_#000] ${playerHP > 0 ? 'text-green-400' : 'text-red-500'}`}>
                                    ${playerHP > 0 ? 'VICTORY' : 'GAME OVER'}
                                </div>
                                <div className="flex gap-4">
                                    <button onClick=${restartGame} className="px-6 py-3 bg-white border-4 border-slate-500 text-black font-epic text-sm hover:bg-slate-300 shadow-[4px_4px_0_0_#000] active:translate-y-1 active:shadow-none">
                                        PLAY AGAIN
                                    </button>
                                    <button onClick=${quitBattleApp} className="px-6 py-3 bg-slate-800 border-4 border-slate-500 text-white font-epic text-sm hover:bg-slate-700 shadow-[4px_4px_0_0_#000] active:translate-y-1 active:shadow-none">
                                        EXIT
                                    </button>
                                </div>
                            </div>
                        `}
                    </div>

                    <div className="flex-1 bg-blue-950 border-4 border-slate-300 p-4 flex flex-col shadow-[inset_4px_4px_0_0_rgba(0,0,0,0.5)]">
                        <div className="text-yellow-400 border-b-2 border-slate-600 pb-2 mb-2 font-epic text-[10px] flex justify-between">
                            <span>BATTLE LOG</span>
                            <span>TURN ${turn}</span>
                        </div>
                        <div className="flex-1 flex flex-col justify-end gap-2 text-xl font-bold">
                            ${logs.map((log, i) => html`
                                <div key=${i} className=${`${i === 0 ? 'text-white' : 'text-slate-500'}`}>
                                    ${i === 0 ? '*' : '-'} ${log}
                                </div>
                            `)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}
