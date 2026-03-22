import React, { useState, useEffect, useCallback, useRef } from 'react';

// --- ข้อมูลเกมเบื้องต้น ---
const ELEMENTS = [
  { symbol: 'H', name: 'Hydrogen', color: '#3b82f6', rune: '💧' },
  { symbol: 'O', name: 'Oxygen', color: '#10b981', rune: '🌪️' },
  { symbol: 'Na', name: 'Sodium', color: '#eab308', rune: '⚡' },
  { symbol: 'Cl', name: 'Chlorine', color: '#84cc16', rune: '☣️' },
  { symbol: 'C', name: 'Carbon', color: '#64748b', rune: '🌑' }
];

const RECIPES = [
  { id: 'H2O', name: 'Aqua Vitae (H2O)', formula: { H: 2, O: 1 }, damage: 30, status: 'Wet', color: '#60a5fa' },
  { id: 'HCl', name: 'Acid Flask (HCl)', formula: { H: 1, Cl: 1 }, damage: 80, status: 'Corroded', color: '#4ade80' },
  { id: 'NaCl', name: 'Crystal Salt (NaCl)', formula: { Na: 1, Cl: 1 }, damage: 50, status: 'Crystalized', color: '#fef08a' },
  { id: 'NaOH', name: 'Caustic Brew (NaOH)', formula: { Na: 1, O: 1, H: 1 }, damage: 100, status: 'Burned', color: '#c084fc' },
  { id: 'CO2', name: 'Choking Smog (CO2)', formula: { C: 1, O: 2 }, damage: 20, status: 'Suffocated', color: '#94a3b8' }
];

const ULTIMATES = [
  { 
    id: 'zero', name: 'ABSOLUTE ZERO', req: ['Wet', 'Suffocated'], 
    dmg: 800, color: 'bg-cyan-500 text-black border-white', desc: 'Freeze the target to atomic standstill.' 
  },
  { 
    id: 'hellfire', name: 'HELLFIRE ANNIHILATION', req: ['Burned', 'Corroded'], 
    dmg: 1000, color: 'bg-red-600 text-white border-yellow-400', desc: 'Ignite a chain reaction of pure agony.' 
  },
  { 
    id: 'nuke', name: 'PHILOSOPHER\'S NUKE', req: ['Wet', 'Corroded', 'Crystalized'], 
    dmg: 9999, color: 'bg-white text-black border-black', desc: 'Erase matter from existence.' 
  }
];

const MAX_TIME = 30;

export default function App() {
  const [phase, setPhase] = useState(1); 
  const [timeLeft, setTimeLeft] = useState(MAX_TIME);
  const [turn, setTurn] = useState(1);
  const [playerHP, setPlayerHP] = useState(300);
  const [monsterHP, setMonsterHP] = useState(1500);
  const [monsterStatuses, setMonsterStatuses] = useState([]);
  const [crucible, setCrucible] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [logs, setLogs] = useState(['AN ANCIENT HOMUNCULUS BLOCKS YOUR PATH!']);
  
  // QTE States (Using Ref for Real-time accuracy)
  const [qte, setQte] = useState({ active: false, progress: 0, direction: 1, item: null });
  const latestQte = useRef({ active: false, progress: 0, direction: 1, item: null });
  const [qteResult, setQteResult] = useState(null);
  
  const requestRef = useRef();
  const previousTimeRef = useRef();

  // Animation States
  const [screenShake, setScreenShake] = useState('');
  const [monsterHit, setMonsterHit] = useState(false);
  const [attackEffect, setAttackEffect] = useState(null);
  const [throwingItem, setThrowingItem] = useState(null);

  const addLog = useCallback((msg) => setLogs(prev => [msg, ...prev].slice(0, 5)), []);

  const endGame = useCallback((isWin, reason) => { 
    setPhase(5); 
    addLog(reason); 
  }, [addLog]);

  // Timer Phase
  useEffect(() => {
    if (phase >= 4 || phase === 0 || qte.active) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { handleNextPhase(); return MAX_TIME; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [phase, qte.active]);

  // QTE Engine (Real-time Frame loop)
  const animateQTE = useCallback((time) => {
    if (previousTimeRef.current != undefined) {
      const deltaTime = time - previousTimeRef.current;
      
      let prev = latestQte.current;
      if (!prev.active) return;

      let nextP = prev.progress + (prev.direction * 0.15 * deltaTime);
      let nextD = prev.direction;
      if (nextP >= 100) { nextP = 100; nextD = -1; }
      if (nextP <= 0) { nextP = 0; nextD = 1; }
      
      // อัปเดตข้อมูลแบบ Real-time ลง Ref ทันที ป้องกันปัญหาความหน่วงเวลาผู้เล่นกด
      latestQte.current = { ...prev, progress: nextP, direction: nextD };
      setQte(latestQte.current); // วาด UI
    }
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animateQTE);
  }, []);

  useEffect(() => {
    if (qte.active) {
      requestRef.current = requestAnimationFrame(animateQTE);
    } else {
      cancelAnimationFrame(requestRef.current);
      previousTimeRef.current = undefined;
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [qte.active, animateQTE]);

  // Global Keydown for QTE (อ่านค่าจาก Ref โดยตรงเพื่อความแม่นยำ 100%)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' && latestQte.current.active) {
        e.preventDefault();
        resolveQTE();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNextPhase = useCallback(() => {
    setCrucible([]);
    if (phase === 1) {
      setPhase(2); setTimeLeft(MAX_TIME); addLog('--- COMBAT PHASE ---');
    } else if (phase === 2) {
      setPhase(3); setTimeLeft(MAX_TIME); addLog('--- JUDGEMENT PHASE ---');
    } else if (phase === 3) {
      setPhase(4); addLog('THE BEAST PREPARES TO STRIKE!');
      setTimeout(monsterTurn, 1500);
    }
  }, [phase, addLog]);

  const addElement = (el) => { if (crucible.length < 5) setCrucible([...crucible, el]); };

  const craftCompound = () => {
    if (crucible.length === 0) return;
    const counts = crucible.reduce((acc, el) => { acc[el] = (acc[el] || 0) + 1; return acc; }, {});
    const matchedRecipe = RECIPES.find(recipe => {
      const formulaKeys = Object.keys(recipe.formula);
      const currentKeys = Object.keys(counts);
      if (formulaKeys.length !== currentKeys.length) return false;
      return formulaKeys.every(key => recipe.formula[key] === counts[key]);
    });

    if (matchedRecipe) {
      setInventory([...inventory, matchedRecipe]);
      addLog(`BREWED: ${matchedRecipe.name}`);
      setAttackEffect('craft');
      setTimeout(() => setAttackEffect(null), 500);
    } else {
      addLog('FAILED: THE MIXTURE EVAPORATED!');
    }
    setCrucible([]);
  };

  const executeThrow = useCallback((compound, mult, result) => {
    setThrowingItem(null);
    setAttackEffect(compound.color);
    setMonsterHit(true);
    setScreenShake('animate-[shake_0.2s_ease-in-out_infinite]');

    setTimeout(() => {
      setMonsterHit(false);
      setScreenShake('');
      setAttackEffect(null);
      setQteResult(null);

      const finalDmg = Math.floor(compound.damage * mult);
      setMonsterHP(prev => {
        const newHp = Math.max(0, prev - finalDmg);
        if (newHp <= 0) endGame(true, 'THE HOMUNCULUS IS DESTROYED!');
        return newHp;
      });
      
      if (result !== 'MISS' && compound.status) {
        setMonsterStatuses(prev => {
          if (!prev.includes(compound.status)) return [...prev, compound.status];
          return prev;
        });
      }
      addLog(`[${result}] THREW ${compound.name}! DEALT ${finalDmg} DMG.`);
    }, 300);
  }, [addLog, endGame]);

  const initiateThrow = (index) => {
    const compound = inventory[index];
    const newInv = [...inventory];
    newInv.splice(index, 1);
    setInventory(newInv);
    
    const newQte = { active: true, progress: 0, direction: 1, item: compound };
    latestQte.current = newQte;
    setQte(newQte);
    setQteResult(null);
    previousTimeRef.current = undefined; // reset timer
  };

  const resolveQTE = useCallback(() => {
    const current = latestQte.current;
    if (!current.active) return;
    
    const p = current.progress;
    let result = 'MISS';
    let mult = 0.5;
    
    // คำนวณตาม Hitbox โซนสีแบบเป๊ะๆ 100%
    if (p >= 45 && p <= 55) { result = 'PERFECT'; mult = 1.5; } // Green Zone (10%)
    else if (p >= 30 && p <= 70) { result = 'GOOD'; mult = 1.0; } // Yellow Zone (30-45, 55-70)

    latestQte.current = { ...current, active: false };
    setQte(latestQte.current);
    setQteResult(result);
    setThrowingItem(current.item);

    setTimeout(() => { executeThrow(current.item, mult, result); }, 600);
  }, [executeThrow]);

  const executeUltimate = (ult) => {
    setAttackEffect(`ult-${ult.id}`);
    
    if(ult.id === 'nuke') setScreenShake('animate-[nukeShake_0.1s_ease-in-out_infinite]');
    if(ult.id === 'zero') setScreenShake('animate-[shake_0.5s_ease-in-out_infinite]');
    if(ult.id === 'hellfire') setScreenShake('animate-[shakeVertical_0.1s_ease-in-out_infinite]');

    addLog(`!!! UNLEASHING ${ult.name} !!!`);
    
    setTimeout(() => {
      setMonsterHit(true);
      setMonsterHP(0);
      setTimeout(() => {
        setScreenShake('');
        endGame(true, `TARGET DECIMATED BY ${ult.name}!`);
      }, 2000);
    }, 1500);
  };

  const monsterTurn = () => {
    if (monsterHP <= 0) return;
    setScreenShake('animate-[shake_0.2s_ease-in-out_infinite]');
    setTimeout(() => setScreenShake(''), 500);
    
    const dmg = Math.floor(Math.random() * 30) + 40;
    setPlayerHP(prev => Math.max(0, prev - dmg));
    addLog(`HOMUNCULUS STRIKES! YOU TOOK ${dmg} DMG.`);

    if (playerHP - dmg <= 0) {
      endGame(false, 'YOU HAVE FALLEN...');
      return;
    }
    setTimeout(() => {
      setTurn(prev => prev + 1);
      setPhase(1); setTimeLeft(MAX_TIME);
      addLog(`--- TURN ${turn + 1} BEGINS ---`);
    }, 2000);
  };

  const restartGame = () => {
    setPhase(1); setTurn(1); setTimeLeft(MAX_TIME);
    setPlayerHP(300); setMonsterHP(1500);
    setInventory([]); setCrucible([]); setMonsterStatuses([]);
    setLogs(['THE BATTLE BEGINS ANEW!']); 
    setQteResult(null);
    setAttackEffect(null);
  };

  return (
    <div className={`relative w-full h-screen bg-black text-white font-hud overflow-hidden flex flex-col selection:bg-indigo-500/30 ${screenShake}`}>
      
      {/* =========================================
          TOP HALF: FIRST-PERSON BATTLEFIELD 
      ========================================= */}
      <div className="relative flex-1 flex flex-col items-center justify-center border-b-8 border-slate-900 overflow-hidden">
        
        {/* Dynamic Backgrounds based on Ultimate */}
        <div className={`absolute inset-0 transition-colors duration-1000 ${attackEffect === 'ult-zero' ? 'bg-cyan-950' : attackEffect === 'ult-hellfire' ? 'bg-red-950' : attackEffect === 'ult-nuke' ? 'bg-white' : 'bg-slate-950'}`}>
          <div className="absolute inset-0 opacity-20"
               style={{ backgroundImage: `linear-gradient(335deg, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(155deg, rgba(255,255,255,0.1) 1px, transparent 1px)`, backgroundSize: '40px 40px', backgroundPosition: '0 0, 20px 20px' }} />
          <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] blur-[100px] rounded-full mix-blend-screen animate-[pulse_4s_infinite] ${attackEffect === 'ult-zero' ? 'bg-cyan-400/50' : attackEffect === 'ult-hellfire' ? 'bg-orange-500/50' : 'bg-purple-900/30'}`}></div>
        </div>

        {/* --- ENEMY DISPLAY --- */}
        <div className="relative z-10 flex flex-col items-center mt-[-10%] w-full max-w-2xl">
          <div className="w-full px-8 mb-8">
            <div className="flex justify-between items-end mb-2 drop-shadow-[2px_2px_0_#000]">
              <span className="font-epic text-xl text-red-400">HOMUNCULUS OMEGA</span>
              <span className="text-xl">HP: {monsterHP}/1500</span>
            </div>
            <div className="w-full h-6 bg-slate-900 border-4 border-slate-500 p-1 flex shadow-[4px_4px_0_0_#000]">
              <div className="h-full bg-red-600 transition-all duration-300" style={{ width: `${(monsterHP / 1500) * 100}%` }} />
            </div>
            <div className="flex gap-2 mt-3 justify-center h-8">
              {monsterStatuses.map((s, i) => (
                <div key={i} className="px-2 py-1 bg-black border-2 border-white text-xs font-epic uppercase drop-shadow-[2px_2px_0_#000]">[{s}]</div>
              ))}
            </div>
          </div>

          {/* MONSTER SPRITE */}
          <div className={`relative w-80 h-80 flex items-center justify-center transform transition-all 
            ${monsterHit ? 'scale-90 brightness-200 invert blur-sm' : 'animate-[bounce_3s_steps(5)_infinite]'}
            ${attackEffect === 'ult-zero' ? 'hue-rotate-180 brightness-150 grayscale' : ''}
            ${attackEffect === 'ult-hellfire' ? 'sepia hue-rotate-[-50deg] brightness-150' : ''}
          `}>
            <svg viewBox="0 0 32 32" width="100%" height="100%" style={{shapeRendering: "crispEdges"}} className="drop-shadow-[0_0_30px_rgba(220,38,38,0.6)]">
              <path d="M12,2 h8 v2 h4 v4 h4 v16 h-4 v4 h-4 v2 h-8 v-2 h-4 v-4 h-4 v-16 h4 v-4 h4 z" fill="#450a0a" />
              <path d="M14,6 h4 v2 h4 v16 h-4 v2 h-4 v-2 h-4 v-16 h4 z" fill="#991b1b" />
              <path d="M10,12 h12 v8 h-12 z" fill="#dc2626" className="animate-[pulse_1.5s_steps(2)_infinite]" />
              <rect x="14" y="14" width="4" height="4" fill="#fca5a5" />
              <rect x="15" y="15" width="2" height="2" fill="#fff" className="animate-ping" style={{animationDuration: '2s'}}/>
              <rect x="6" y="8" width="2" height="2" fill="#f87171" className="animate-[bounce_1s_steps(2)_infinite]" />
              <rect x="24" y="22" width="2" height="2" fill="#f87171" className="animate-[bounce_2s_steps(2)_infinite]" />
            </svg>
          </div>
        </div>

        {/* --- 💥 QTE OVERLAY 💥 --- */}
        {qte.active && (
          <div className="absolute top-[20%] z-50 flex flex-col items-center">
            <div className="font-epic text-yellow-300 text-lg mb-2 drop-shadow-[2px_2px_0_#000] animate-bounce">CLICK OR PRESS SPACE!</div>
            <div className="w-96 h-8 border-4 border-white bg-black relative flex" onClick={resolveQTE}>
              <div style={{flex: 30}} className="bg-red-600"></div>   {/* 0-30% */}
              <div style={{flex: 15}} className="bg-yellow-400"></div>{/* 30-45% */}
              <div style={{flex: 10}} className="bg-green-500"></div> {/* 45-55% (Perfect) */}
              <div style={{flex: 15}} className="bg-yellow-400"></div>{/* 55-70% */}
              <div style={{flex: 30}} className="bg-red-600"></div>   {/* 70-100% */}
              
              {/* QTE Cursor */}
              <div 
                className="absolute top-[-8px] bottom-[-8px] w-2 bg-white drop-shadow-[0_0_5px_#fff]"
                style={{ left: `${qte.progress}%`, transform: 'translateX(-50%)' }}
              />
            </div>
          </div>
        )}

        {/* QTE Result Text */}
        {qteResult && (
          <div className={`absolute top-[30%] z-50 font-epic text-4xl drop-shadow-[4px_4px_0_#000] animate-[zoomFade_1s_ease-out_forwards]
            ${qteResult === 'PERFECT' ? 'text-green-400' : qteResult === 'GOOD' ? 'text-yellow-400' : 'text-red-600'}`}>
            {qteResult}!
          </div>
        )}

        {/* --- 💥 NORMAL ATTACK EFFECTS 💥 --- */}
        {attackEffect && !attackEffect.startsWith('ult') && attackEffect !== 'craft' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-40">
            <div className="w-64 h-64 rounded-full mix-blend-screen animate-[explosion_0.3s_ease-out_forwards]" style={{backgroundColor: attackEffect, filter: 'blur(20px)'}}></div>
          </div>
        )}

        {/* --- ☢️ ULTIMATE EFFECTS ☢️ --- */}
        {attackEffect === 'ult-zero' && (
          <div className="absolute inset-0 pointer-events-none z-50 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxwb2x5Z29uIHBvaW50cz0iMCwwIDUwLDEwMCAxMDAsMCIgZmlsbD0icmdiYSgyNTUsIDI1NSwgMjU1LCAwLjEpIi8+PC9zdmc+')] bg-cover animate-[iceShatter_1.5s_ease-out_forwards] mix-blend-overlay"></div>
        )}
        {attackEffect === 'ult-hellfire' && (
          <div className="absolute inset-0 pointer-events-none z-50 mix-blend-color-dodge animate-[fireRise_2s_ease-in_forwards]" style={{ background: 'linear-gradient(0deg, #ef4444 0%, transparent 100%)' }}></div>
        )}
        {attackEffect === 'ult-nuke' && (
          <div className="absolute inset-0 bg-white mix-blend-overlay z-50 animate-[ping_0.5s_steps(2)_forwards]" />
        )}

        {/* --- ✋ PLAYER HAND & THROW ANIMATION ✋ --- */}
        {throwingItem && (
          <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
            <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] animate-[throwHand_0.6s_ease-out_forwards] origin-bottom-right">
              <svg viewBox="0 0 32 32" className="w-full h-full drop-shadow-[0_15px_15px_rgba(0,0,0,0.8)]" style={{shapeRendering: "crispEdges"}}>
                <rect x="16" y="20" width="16" height="16" fill="#1e3a8a" />
                <rect x="14" y="18" width="18" height="4" fill="#fbbf24" />
                <rect x="18" y="22" width="4" height="10" fill="#1e40af" />
                <rect x="10" y="8" width="12" height="10" fill="#78350f" />
                <rect x="8" y="12" width="4" height="4" fill="#451a03" />
                <rect x="6" y="6" width="4" height="8" fill="#451a03" />
                <rect x="10" y="6" width="2" height="4" fill="#451a03" />
              </svg>
            </div>
            <div className="absolute bottom-[20%] right-[15%] w-20 h-20 animate-[potionFly_0.6s_ease-in_forwards]">
              <svg viewBox="0 0 16 16" width="100%" height="100%" style={{shapeRendering: "crispEdges"}} className="drop-shadow-[0_0_15px_rgba(255,255,255,0.6)]">
                <rect x="6" y="0" width="4" height="2" fill="#d4d4d8" />
                <rect x="7" y="2" width="2" height="4" fill="#cbd5e1" />
                <path d="M4,6 h8 v8 h-8 z" fill={throwingItem.color} />
                <path d="M4,6 h8 v4 h-8 z" fill="#fff" fillOpacity="0.3" />
                <path d="M3,5 h10 v10 h-10 z" fill="transparent" stroke="#fff" strokeWidth="1" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* =========================================
          BOTTOM HALF: THE ALCHEMIST'S WORKBENCH 
      ========================================= */}
      <div className="relative h-[45%] w-full bg-slate-800 border-t-8 border-slate-600 shadow-[inset_0_20px_20px_rgba(0,0,0,0.5)] z-20 flex flex-col">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, #000 2px, #000 4px)` }} />

        {/* --- WORKBENCH HUD --- */}
        <div className="flex justify-between items-center px-6 py-2 bg-slate-900 border-b-4 border-slate-700 shadow-md z-10">
          <div className="flex gap-4 items-center">
             <div className="font-epic text-sm text-yellow-400 drop-shadow-[2px_2px_0_#000]">PHASE {phase}: {phase===1?'SETUP':phase===2?'COMBAT':phase===3?'JUDGEMENT':phase===4?'ENEMY':'END'}</div>
             <div className={`font-epic text-xl ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-white'}`}>T-{timeLeft.toString().padStart(2, '0')}</div>
          </div>
          <div className="flex items-center gap-4">
            <div className="font-epic text-sm text-white">HP</div>
            <div className="w-64 h-6 bg-black border-4 border-slate-500 p-1 flex">
              <div className={`h-full transition-all ${playerHP > 150 ? 'bg-green-500' : playerHP > 60 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${(playerHP / 300) * 100}%` }} />
            </div>
            <div className="font-hud text-xl">{playerHP}/300</div>
          </div>
        </div>

        {/* --- TABLETOP AREA --- */}
        <div className="flex-1 flex p-4 gap-6 relative z-10">
          
          {/* LEFT: The Cauldron */}
          <div className="w-1/4 flex flex-col items-center justify-center bg-black/40 border-4 border-slate-700 rounded-xl p-4 shadow-[inset_4px_4px_0_rgba(0,0,0,0.6)]">
            <div className="font-epic text-[10px] text-slate-400 mb-2">CAULDRON</div>
            <div className="relative w-24 h-24 mb-4">
               <svg viewBox="0 0 16 16" width="100%" height="100%" style={{shapeRendering: "crispEdges"}} className="drop-shadow-[0_10px_10px_rgba(0,0,0,0.8)]">
                  {crucible.length > 0 && <rect x="6" y="2" width="4" height="2" fill="#10b981" className="animate-[ping_1s_steps(2)_infinite]"/>}
                  <path d="M4,6 h8 v2 h2 v6 h-12 v-6 h2 z" fill="#1e293b" />
                  <path d="M2,8 h12 v2 h-12 z" fill="#334155" />
                  <path d="M4,14 h8 v2 h-8 z" fill="#0f172a" />
                  {crucible.length > 0 && <path d="M4,6 h8 v2 h-8 z" fill="#34d399" className="animate-[pulse_0.5s_steps(2)_infinite]" />}
               </svg>
               <div className="absolute -top-4 left-0 w-full flex justify-center gap-1">
                 {crucible.map((c, i) => (
                   <span key={i} className="text-xs font-epic font-bold text-white drop-shadow-[1px_1px_0_#000] bg-black/50 px-1 rounded animate-[bounce_1s_infinite]">{c}</span>
                 ))}
               </div>
            </div>
            <div className="flex w-full gap-2">
              <button onClick={() => setCrucible([])} className="flex-1 py-2 bg-red-900 border-b-4 border-red-950 font-epic text-[10px] text-white active:border-b-0 active:translate-y-1">DUMP</button>
              <button onClick={craftCompound} disabled={phase !== 1 || crucible.length === 0} className={`flex-[2] py-2 font-epic text-[10px] border-b-4 active:border-b-0 active:translate-y-1 ${phase === 1 && crucible.length > 0 ? 'bg-indigo-600 border-indigo-900 text-white hover:bg-indigo-500' : 'bg-slate-700 border-slate-900 text-slate-500'}`}>BREW</button>
            </div>
          </div>

          {/* MIDDLE: Action Area */}
          <div className="flex-[2] flex flex-col">
            {phase === 1 && (
              <div className="h-full flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-epic text-sm text-yellow-300 drop-shadow-[2px_2px_0_#000]">SELECT RUNES</span>
                  <button onClick={handleNextPhase} className="px-4 py-2 bg-slate-700 border-2 border-slate-400 font-epic text-[10px] hover:bg-white hover:text-black">FINISH PREP {'>'}</button>
                </div>
                <div className="flex-1 grid grid-cols-5 gap-4 place-items-center">
                  {ELEMENTS.map(el => (
                    <button 
                      key={el.symbol} onClick={() => addElement(el.symbol)}
                      className="relative group w-20 h-24 bg-slate-800 border-4 border-slate-600 flex flex-col items-center justify-center shadow-[4px_4px_0_#000] active:translate-y-1 active:shadow-[0_0_0_#000] hover:border-white transition-colors"
                      style={{ borderTopColor: el.color }}
                    >
                      <span className="text-3xl mb-2 grayscale group-hover:grayscale-0 transition-all">{el.rune}</span>
                      <span className="font-epic text-xl text-white drop-shadow-[2px_2px_0_#000]">{el.symbol}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {phase === 2 && (
              <div className="h-full flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-epic text-sm text-green-400 drop-shadow-[2px_2px_0_#000]">YOUR ARSENAL</span>
                  <button onClick={handleNextPhase} className="px-4 py-2 bg-red-900 border-2 border-red-500 font-epic text-[10px] hover:bg-red-500 text-white">END TURN {'>'}</button>
                </div>
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                  {inventory.length === 0 ? (
                    <div className="h-full flex items-center justify-center font-epic text-slate-500">NO POTIONS BREWED</div>
                  ) : (
                    <div className="grid grid-cols-3 gap-4">
                      {inventory.map((comp, i) => (
                        <button 
                          key={i} onClick={() => initiateThrow(i)} disabled={throwingItem !== null || qte.active}
                          className={`relative p-3 bg-slate-900 border-2 border-slate-500 text-left shadow-[4px_4px_0_#000] hover:bg-slate-700 group flex flex-col ${(throwingItem || qte.active) ? 'opacity-50 cursor-not-allowed' : 'active:translate-y-1 active:shadow-none'}`}
                        >
                          <div className="font-epic text-[10px] text-white mb-2 truncate group-hover:text-yellow-300">{comp.name}</div>
                          <div className="flex gap-2">
                             <div className="w-8 h-8 rounded border-2 border-white" style={{backgroundColor: comp.color}}></div>
                             <div className="flex flex-col gap-1 justify-center">
                               <span className="bg-black text-white text-[10px] px-1 font-hud w-fit">DMG: {comp.damage}</span>
                               <span className="bg-white text-black text-[10px] px-1 font-hud w-fit uppercase">{comp.status}</span>
                             </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {phase === 3 && (
              <div className="h-full flex flex-col items-center bg-black/40 border-4 border-dashed border-slate-700 p-4">
                <span className="font-epic text-sm text-purple-400 mb-2 drop-shadow-[2px_2px_0_#000] w-full text-left">JUDGEMENT PROTOCOLS</span>
                <div className="w-full flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-3">
                  {ULTIMATES.map(ult => {
                    const isReady = ult.req.every(r => monsterStatuses.includes(r));
                    return (
                      <button 
                        key={ult.id} onClick={() => isReady && executeUltimate(ult)}
                        className={`w-full p-3 border-4 flex justify-between items-center transition-all ${isReady ? `${ult.color} shadow-[4px_4px_0_#000] active:translate-y-1 active:shadow-none hover:brightness-125 animate-[pulse_1s_infinite]` : 'bg-slate-900 border-slate-700 opacity-50 cursor-not-allowed'}`}
                      >
                        <div className="flex flex-col text-left">
                           <span className={`font-epic text-sm drop-shadow-[1px_1px_0_#000] ${isReady ? '' : 'text-slate-500'}`}>{ult.name}</span>
                           <span className={`font-hud text-xs mt-1 ${isReady ? '' : 'text-slate-600'}`}>{ult.desc}</span>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="font-hud text-xs bg-black/50 px-1 text-white">DMG: {ult.dmg}</span>
                          <div className="flex gap-1">
                            {ult.req.map(r => (
                              <span key={r} className={`text-[8px] font-epic uppercase px-1 border ${monsterStatuses.includes(r) ? 'bg-green-600 border-white text-white' : 'bg-slate-800 border-slate-600 text-slate-500'}`}>{r}</span>
                            ))}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
                <button onClick={handleNextPhase} className="mt-3 px-6 py-2 bg-slate-800 border-2 border-slate-500 font-epic text-[10px] text-white hover:bg-white hover:text-black">
                  BRACE FOR IMPACT
                </button>
              </div>
            )}

            {phase >= 4 && (
              <div className="h-full flex flex-col items-center justify-center">
                {phase === 4 ? (
                  <div className="font-epic text-2xl text-red-500 animate-[ping_0.5s_steps(2)_infinite]">ENEMY TURN!</div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className={`font-epic text-4xl mb-6 ${playerHP > 0 ? 'text-green-500' : 'text-red-600'}`}>
                      {playerHP > 0 ? 'VICTORY' : 'GAME OVER'}
                    </div>
                    <button onClick={restartGame} className="px-6 py-3 bg-white text-black font-epic text-sm hover:bg-slate-300 border-4 border-slate-600 shadow-[4px_4px_0_#000]">PLAY AGAIN</button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT: Combat Log Scroll */}
          <div className="flex-[1.5] bg-[#fef3c7] border-4 border-[#b45309] p-3 flex flex-col shadow-[inset_0_0_20px_rgba(180,83,9,0.3)] relative text-[#78350f]">
            <div className="absolute top-[-10px] left-[-10px] right-[-10px] h-4 bg-[#b45309] rounded-full"></div>
            <div className="absolute bottom-[-10px] left-[-10px] right-[-10px] h-4 bg-[#b45309] rounded-full"></div>
            
            <div className="font-epic text-[10px] mb-2 border-b-2 border-[#d97706] pb-2 flex justify-between">
              <span>BATTLE LOG</span>
              <span>TURN {turn}</span>
            </div>
            <div className="flex-1 flex flex-col justify-end gap-2 font-hud text-lg font-bold">
              {logs.map((log, i) => (
                <div key={i} className={`${i === 0 ? 'text-[#991b1b] font-black' : 'opacity-70'}`}>
                  {i === 0 ? '>' : '-'} {log}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
      
      {/* Global Styles & Animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&display=swap');
        
        .font-epic { font-family: 'Press Start 2P', cursive; }
        .font-hud { font-family: 'VT323', monospace; }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px) translateY(-5px); }
          50% { transform: translateX(10px) translateY(5px); }
          75% { transform: translateX(-10px) translateY(5px); }
        }
        @keyframes shakeVertical {
          0%, 100% { transform: translateY(0); }
          25% { transform: translateY(-15px); }
          50% { transform: translateY(15px); }
          75% { transform: translateY(-15px); }
        }
        @keyframes nukeShake {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(-20px, -20px) scale(1.05); }
          50% { transform: translate(20px, 20px) scale(0.95); }
          75% { transform: translate(-20px, 20px) scale(1.05); }
        }

        @keyframes throwHand {
          0% { transform: translate(30%, 30%) rotate(20deg); opacity: 0; }
          20% { transform: translate(0, 0) rotate(0deg); opacity: 1; }
          50% { transform: translate(-10%, -10%) rotate(-10deg); opacity: 1; }
          100% { transform: translate(30%, 30%) rotate(20deg); opacity: 0; }
        }
        @keyframes potionFly {
          0% { transform: translate(0, 0) scale(1) rotate(0deg); opacity: 1; }
          40% { transform: translate(-15vw, -15vh) scale(1.2) rotate(180deg); }
          80% { transform: translate(-30vw, -25vh) scale(0.6) rotate(360deg); opacity: 1; }
          100% { transform: translate(-30vw, -25vh) scale(2); opacity: 0; }
        }
        @keyframes explosion {
          0% { transform: scale(0.5); opacity: 1; }
          100% { transform: scale(3); opacity: 0; }
        }
        @keyframes zoomFade {
          0% { transform: scale(0.5); opacity: 0; }
          20% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1); opacity: 0; }
        }
        @keyframes iceShatter {
          0% { opacity: 0; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.1); }
          100% { opacity: 0; transform: scale(1.5); }
        }
        @keyframes fireRise {
          0% { opacity: 0; transform: translateY(100%); }
          20% { opacity: 1; }
          100% { opacity: 0; transform: translateY(-50%); }
        }

        .custom-scrollbar::-webkit-scrollbar { width: 12px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #1e293b; border: 2px solid #0f172a; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #64748b; border: 2px solid #0f172a; }
      `}} />
    </div>
  );
}