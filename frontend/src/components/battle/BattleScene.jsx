import React, { useState, useEffect, useCallback, useRef } from 'react';

// ==========================================
// 🧪 ALCHEMY DATABASE & LOGIC
// ==========================================
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
    dmg: 800, color: '#22d3ee', bgTheme: 'bg-cyan-950', fx: 'iceShatter', desc: 'Freeze the target to atomic standstill.' 
  },
  { 
    id: 'hellfire', name: 'HELLFIRE ANNIHILATION', req: ['Burned', 'Corroded'], 
    dmg: 1000, color: '#ef4444', bgTheme: 'bg-red-950', fx: 'fireRise', desc: 'Ignite a chain reaction of pure agony.' 
  },
  { 
    id: 'nuke', name: 'PHILOSOPHER\'S NUKE', req: ['Wet', 'Corroded', 'Crystalized'], 
    dmg: 9999, color: '#ffffff', bgTheme: 'bg-white', fx: 'whiteout', desc: 'Erase matter from existence.' 
  }
];

const MAX_TIME = 30;
const MAX_PLAYER_HP = 300;
const MAX_MONSTER_HP = 3000;

function matchRecipe(crucible) {
  if (crucible.length === 0) return null;
  const counts = crucible.reduce((acc, el) => { acc[el] = (acc[el] || 0) + 1; return acc; }, {});
  return RECIPES.find(recipe => {
    const formulaKeys = Object.keys(recipe.formula);
    const currentKeys = Object.keys(counts);
    if (formulaKeys.length !== currentKeys.length) return false;
    return formulaKeys.every(key => recipe.formula[key] === counts[key]);
  }) || null;
}

function calculateQTEResult(progress) {
  if (progress >= 45 && progress <= 55) return { result: 'PERFECT', mult: 1.5, color: '#10b981' };
  if (progress >= 30 && progress <= 70) return { result: 'GOOD', mult: 1.0, color: '#eab308' };
  return { result: 'MISS', mult: 0.5, color: '#ef4444' };
}

// ==========================================
// 🎬 MAIN BATTLE COMPONENT
// ==========================================
export default function BattleApp({ onQuitBattle }) {
  const [phase, setPhase] = useState(1);
  const [timeLeft, setTimeLeft] = useState(MAX_TIME);
  const [turn, setTurn] = useState(1);
  const [playerHP, setPlayerHP] = useState(MAX_PLAYER_HP);
  const [monsterHP, setMonsterHP] = useState(MAX_MONSTER_HP);
  const [monsterStatuses, setMonsterStatuses] = useState([]);
  
  const [crucible, setCrucible] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [logs, setLogs] = useState(['AN ANCIENT HOMUNCULUS BLOCKS YOUR PATH!']);

  // 🔒 Lock System
  const [hasCastUltimate, setHasCastUltimate] = useState(false);

  // QTE Engine
  const [qte, setQte] = useState({ active: false, progress: 0, direction: 1, item: null });
  const latestQte = useRef({ active: false, progress: 0, direction: 1, item: null });
  const [qteResult, setQteResult] = useState(null);

  const requestRef = useRef();
  const previousTimeRef = useRef();

  // 🎬 Cinematic Animation States
  const [screenShake, setScreenShake] = useState('');
  const [monsterHit, setMonsterHit] = useState(false);
  const [attackEffect, setAttackEffect] = useState(null); 
  const [throwingItem, setThrowingItem] = useState(null);
  const [cinematicText, setCinematicText] = useState(null); 

  const addLog = useCallback((msg) => setLogs(prev => [msg, ...prev].slice(0, 5)), []);

  const endGame = useCallback((isWin, reason) => {
    setPhase(5);
    addLog(reason);
  }, [addLog]);

  // --- Logic Flow ---
  const monsterTurn = useCallback(() => {
    if (monsterHP <= 0) return;
    setScreenShake('animate-[shake_0.2s_ease-in-out_infinite]');
    setTimeout(() => setScreenShake(''), 500);

    const dmg = Math.floor(Math.random() * 30) + 40;
    addLog(`HOMUNCULUS STRIKES! YOU TOOK ${dmg} DMG.`);

    setPlayerHP(prev => {
      const nextHp = Math.max(0, prev - dmg);
      if (nextHp <= 0) {
        endGame(false, 'YOU HAVE FALLEN...');
      } else {
        setTimeout(() => {
          setTurn(t => {
            const nextTurn = t + 1;
            addLog(`--- TURN ${nextTurn} BEGINS ---`);
            return nextTurn;
          });
          setPhase(1); 
          setTimeLeft(MAX_TIME);
          setHasCastUltimate(false); // 🔓 Unlock Ultimate for new turn
        }, 2000);
      }
      return nextHp;
    });
  }, [monsterHP, addLog, endGame]);

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
  }, [phase, addLog, monsterTurn]);

  // Timer
  useEffect(() => {
    if (phase >= 4 || phase === 0 || qte.active || cinematicText !== null) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { handleNextPhase(); return MAX_TIME; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [phase, qte.active, cinematicText, handleNextPhase]);

  // QTE Loop
  const animateQTE = useCallback((time) => {
    if (previousTimeRef.current != undefined) {
      const deltaTime = time - previousTimeRef.current;
      let prev = latestQte.current;
      if (!prev.active) return;

      let nextP = prev.progress + (prev.direction * 0.15 * deltaTime);
      let nextD = prev.direction;
      if (nextP >= 100) { nextP = 100; nextD = -1; }
      if (nextP <= 0) { nextP = 0; nextD = 1; }

      latestQte.current = { ...prev, progress: nextP, direction: nextD };
      setQte(latestQte.current);
    }
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animateQTE);
  }, []);

  useEffect(() => {
    if (qte.active) requestRef.current = requestAnimationFrame(animateQTE);
    else { cancelAnimationFrame(requestRef.current); previousTimeRef.current = undefined; }
    return () => cancelAnimationFrame(requestRef.current);
  }, [qte.active, animateQTE]);

  // Global Input
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.code === 'Space' || e.code === 'Enter') && latestQte.current.active) {
        e.preventDefault();
        resolveQTE();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const addElement = (el) => { if (crucible.length < 5) setCrucible([...crucible, el]); };

  const craftCompound = () => {
    const matchedRecipe = matchRecipe(crucible);
    if (matchedRecipe) {
      setInventory([...inventory, matchedRecipe]);
      addLog(`BREWED: ${matchedRecipe.name}`);
      setAttackEffect({ type: 'craft' });
      setTimeout(() => setAttackEffect(null), 500);
    } else {
      addLog('FAILED: THE MIXTURE EVAPORATED!');
    }
    setCrucible([]);
  };

  const initiateThrow = (index) => {
    const compound = inventory[index];
    const newInv = [...inventory];
    newInv.splice(index, 1);
    setInventory(newInv);

    latestQte.current = { active: true, progress: 0, direction: 1, item: compound };
    setQte(latestQte.current);
    setQteResult(null);
    previousTimeRef.current = undefined; 
  };

  const resolveQTE = useCallback(() => {
    const current = latestQte.current;
    if (!current.active) return;

    const { result, mult, color } = calculateQTEResult(current.progress);

    latestQte.current = { ...current, active: false };
    setQte(latestQte.current);
    setQteResult({ text: result, color: color });
    setThrowingItem(current.item);

    setTimeout(() => { executeThrow(current.item, mult, result); }, 600);
  }, []);

  const executeThrow = (compound, mult, result) => {
    setThrowingItem(null);
    setAttackEffect({ type: 'hit', color: compound.color });
    setMonsterHit(true);
    setScreenShake('animate-[shake_0.2s_ease-in-out_infinite]');

    setTimeout(() => {
      setMonsterHit(false); setScreenShake(''); setAttackEffect(null); setQteResult(null);

      const finalDmg = Math.floor(compound.damage * mult);
      setMonsterHP(prev => {
        const newHp = Math.max(0, prev - finalDmg);
        if (newHp <= 0) endGame(true, 'THE HOMUNCULUS IS DESTROYED!');
        return newHp;
      });

      if (result !== 'MISS' && compound.status && !monsterStatuses.includes(compound.status)) {
        setMonsterStatuses(prev => [...prev, compound.status]);
      }
      addLog(`[${result}] THREW ${compound.name}! DEALT ${finalDmg} DMG.`);
    }, 300);
  };

  // 🎬 EPIC DYNAMIC ULTIMATE ANIMATION
  const executeUltimate = (ult) => {
    if (hasCastUltimate) return;
    setHasCastUltimate(true); // 🔒 Lock Ultimate

    setCinematicText({ name: ult.name, color: ult.color });
    setAttackEffect({ type: 'charge' });
    
    setTimeout(() => {
      setCinematicText(null);
      setAttackEffect({ type: 'ult', ultData: ult });
      
      if(ult.id === 'nuke') setScreenShake('animate-[nukeShake_0.1s_ease-in-out_infinite]');
      else if(ult.id === 'zero') setScreenShake('animate-[shake_0.5s_ease-in-out_infinite]');
      else if(ult.id === 'hellfire') setScreenShake('animate-[shakeVertical_0.1s_ease-in-out_infinite]');

      addLog(`!!! UNLEASHING ${ult.name} !!!`);
      setMonsterHit(true);
      
      setTimeout(() => {
        setScreenShake('');
        setMonsterHP(prev => {
          const newHp = Math.max(0, prev - ult.dmg);
          if (newHp <= 0) {
            endGame(true, `TARGET DECIMATED BY ${ult.name}!`);
          } else {
            // ⏭️ กรณีบอสไม่ตาย ข้ามไปเทิร์นศัตรูทันที
            setTimeout(() => {
              setMonsterHit(false);
              setAttackEffect(null);
              setMonsterStatuses([]); 
              addLog('STATUS EFFECTS DISSIPATED...');
              handleNextPhase();
            }, 1500);
          }
          return newHp;
        });
      }, 2000);
    }, 1800); 
  };

  const restartGame = () => {
    setPhase(1); setTurn(1); setTimeLeft(MAX_TIME);
    setPlayerHP(MAX_PLAYER_HP); setMonsterHP(MAX_MONSTER_HP);
    setInventory([]); setCrucible([]); setMonsterStatuses([]);
    setLogs(['THE BATTLE BEGINS ANEW!']); 
    setQteResult(null); setAttackEffect(null); setCinematicText(null);
    setHasCastUltimate(false);
  };

  const getDynamicBg = () => {
    if (attackEffect?.type === 'ult') return attackEffect.ultData.bgTheme;
    if (attackEffect?.type === 'charge') return 'bg-slate-950 brightness-50 grayscale';
    return 'bg-slate-950';
  };

  const isAnyUltimateReady = ULTIMATES.some(ult => ult.req.every(r => monsterStatuses.includes(r)));

  return (
    <div className={`relative w-full h-[100dvh] max-w-full text-white font-hud overflow-hidden flex flex-col selection:bg-indigo-500/30 ${screenShake} ${getDynamicBg()} transition-all duration-1000`}>
      
      {/* 🎬 CINEMATIC TEXT OVERLAY */}
      {cinematicText && (
        <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md animate-[fadeIn_0.5s_ease-out]">
           <div className="text-5xl font-epic text-transparent bg-clip-text animate-[pulse_0.5s_infinite] drop-shadow-[0_0_30px_rgba(255,255,255,0.8)] tracking-widest text-center px-4"
                style={{ backgroundImage: `linear-gradient(to right, white, ${cinematicText.color}, white)` }}>
             {cinematicText.name}
           </div>
        </div>
      )}

      {/* =========================================
          TOP HALF: FIRST-PERSON BATTLEFIELD 
      ========================================= */}
      <div className="relative flex-[0.55] w-full flex flex-col items-center justify-center border-b-8 border-slate-900 overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.8)] min-h-0">
        
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `linear-gradient(335deg, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(155deg, rgba(255,255,255,0.1) 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />
        
        {!attackEffect?.type?.startsWith('ult') && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] blur-[120px] rounded-full mix-blend-screen animate-[pulse_4s_infinite] bg-purple-900/30"></div>
        )}

        {/* --- ENEMY HUD --- */}
        <div className="relative z-20 flex flex-col items-center mt-[-5%] w-full max-w-2xl">
          <div className="w-full px-8 mb-6">
            <div className="flex justify-between items-end mb-2 drop-shadow-[2px_2px_0_#000]">
              <span className="font-epic text-xl text-rose-500">HOMUNCULUS OMEGA</span>
              <span className="text-2xl font-bold tracking-widest">HP: {monsterHP}/{MAX_MONSTER_HP}</span>
            </div>
            <div className="w-full h-6 bg-slate-900 border-4 border-slate-600 p-1 flex shadow-[4px_4px_0_0_#000]">
              <div className="h-full bg-gradient-to-r from-red-600 to-rose-400 transition-all duration-500" style={{ width: `${(monsterHP / MAX_MONSTER_HP) * 100}%` }} />
            </div>
            <div className="flex gap-2 mt-3 justify-center h-8">
              {monsterStatuses.map((s, i) => (
                <div key={i} className="px-2 py-1 bg-black/80 border-2 border-white text-xs font-epic uppercase drop-shadow-[2px_2px_0_#000] text-yellow-300 animate-[pulse_1s_steps(2)_infinite]">
                  [{s}]
                </div>
              ))}
            </div>
          </div>

          {/* ENEMY SPRITE */}
          <div className={`relative w-80 h-80 flex items-center justify-center transform transition-all 
            ${monsterHit ? 'scale-90 brightness-200 invert blur-md' : 'animate-[bounce_3s_steps(5)_infinite]'}
          `}>
            <div className="absolute inset-0 bg-red-600/20 blur-3xl rounded-full animate-[breathe_4s_infinite]"></div>
            <svg viewBox="0 0 32 32" width="100%" height="100%" style={{shapeRendering: "crispEdges"}} className="drop-shadow-[0_0_40px_rgba(220,38,38,0.8)] z-10">
              <path d="M10,2 h12 v4 h4 v16 h-4 v4 h-12 v-4 h-4 v-16 h4 z" fill="#450a0a" />
              <path d="M12,6 h8 v2 h4 v12 h-4 v2 h-8 v-2 h-4 v-12 h4 z" fill="#991b1b" />
              <path d="M12,12 h8 v8 h-8 z" fill="#dc2626" className="animate-[pulse_1s_steps(2)_infinite]" />
              <rect x="14" y="14" width="4" height="4" fill="#fca5a5" />
              <rect x="15" y="15" width="2" height="2" fill="#fff" className="animate-ping" style={{animationDuration: '1s'}}/>
            </svg>
          </div>
        </div>

        {/* --- 💥 QTE OVERLAY 💥 --- */}
        {qte.active && (
          <div className="absolute top-[20%] z-50 flex flex-col items-center">
            <div className="font-epic text-yellow-300 text-lg mb-4 drop-shadow-[4px_4px_0_#000] animate-bounce">HIT SPACEBAR!</div>
            <div className="w-[400px] h-8 border-4 border-white bg-black relative flex" onClick={resolveQTE}>
              <div style={{flex: 30}} className="bg-red-600/80"></div>   
              <div style={{flex: 15}} className="bg-yellow-400/80"></div>
              <div style={{flex: 10}} className="bg-emerald-500 shadow-[0_0_20px_#10b981_inset] z-10 border-x-2 border-white"></div> 
              <div style={{flex: 15}} className="bg-yellow-400/80"></div>
              <div style={{flex: 30}} className="bg-red-600/80"></div>   
              <div className="absolute top-[-12px] bottom-[-12px] w-2 bg-white drop-shadow-[0_0_8px_#fff]" style={{ left: `${qte.progress}%`, transform: 'translateX(-50%)' }} />
            </div>
          </div>
        )}

        {qteResult && (
          <div className="absolute top-[30%] z-50 font-epic text-5xl drop-shadow-[6px_6px_0_#000] animate-[zoomFade_1s_ease-out_forwards]" style={{ color: qteResult.color }}>
            {qteResult.text}!
          </div>
        )}

        {/* --- 💥 NORMAL THROW IMPACT --- */}
        {attackEffect?.type === 'hit' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-40">
            <div className="w-80 h-80 rounded-full mix-blend-screen animate-[explosion_0.4s_ease-out_forwards]" style={{backgroundColor: attackEffect.color, filter: 'blur(30px)'}}></div>
          </div>
        )}

        {/* --- ☢️ DYNAMIC ULTIMATE VFX ☢️ --- */}
        {attackEffect?.type === 'ult' && (
          <div className={`absolute inset-0 pointer-events-none z-50 animate-[${attackEffect.ultData.fx}_1.5s_ease-out_forwards] mix-blend-screen`} 
               style={{ backgroundColor: attackEffect.ultData.color, boxShadow: `inset 0 0 150px ${attackEffect.ultData.color}` }}>
          </div>
        )}

        {/* --- ✋ PLAYER THROW ANIMATION --- */}
        {throwingItem && (
          <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
            <div className="absolute bottom-[-10%] right-[-5%] w-[450px] h-[450px] animate-[throwHand_0.6s_ease-out_forwards] origin-bottom-right">
              <svg viewBox="0 0 32 32" className="w-full h-full drop-shadow-[0_20px_20px_rgba(0,0,0,0.9)]" style={{shapeRendering: "crispEdges"}}>
                <rect x="16" y="20" width="16" height="16" fill="#0f172a" />
                <rect x="14" y="18" width="18" height="4" fill="#fbbf24" />
                <rect x="18" y="22" width="4" height="10" fill="#1e293b" />
                <rect x="10" y="8" width="12" height="10" fill="#451a03" />
                <rect x="8" y="12" width="4" height="4" fill="#290f02" />
                <rect x="6" y="6" width="4" height="8" fill="#290f02" />
                <rect x="10" y="6" width="2" height="4" fill="#290f02" />
              </svg>
            </div>
            <div className="absolute bottom-[20%] right-[15%] w-24 h-24 animate-[potionFly_0.6s_ease-in_forwards]">
              <svg viewBox="0 0 16 16" width="100%" height="100%" style={{shapeRendering: "crispEdges"}} className="drop-shadow-[0_0_20px_rgba(255,255,255,0.8)]">
                <rect x="6" y="0" width="4" height="2" fill="#d4d4d8" />
                <rect x="7" y="2" width="2" height="4" fill="#cbd5e1" />
                <path d="M4,6 h8 v8 h-8 z" fill={throwingItem.color} />
                <path d="M4,6 h8 v4 h-8 z" fill="#fff" fillOpacity="0.4" />
                <path d="M3,5 h10 v10 h-10 z" fill="transparent" stroke="#fff" strokeWidth="1" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* =========================================
          BOTTOM HALF: THE ALCHEMIST'S WORKBENCH 
      ========================================= */}
      <div className="relative flex-[0.45] w-full bg-[#1e293b] border-t-8 border-slate-600 shadow-[inset_0_30px_30px_rgba(0,0,0,0.6)] z-20 flex flex-col min-h-0">
        <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-multiply" style={{ backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, #000 2px, #000 4px)` }} />

        {/* --- WORKBENCH HUD --- */}
        <div className="flex justify-between items-center px-8 py-3 bg-slate-900 border-b-4 border-slate-700 shadow-lg z-10 shrink-0">
          <div className="flex gap-6 items-center">
             <div className="font-epic text-sm text-yellow-400 drop-shadow-[2px_2px_0_#000]">PHASE {phase}: {phase===1?'SYNTHESIS':phase===2?'ARSENAL':phase===3?'JUDGEMENT':phase===4?'DEFENSE':'END'}</div>
             <div className={`font-epic text-2xl ${timeLeft <= 5 ? 'text-red-500 animate-[pulse_0.2s_infinite]' : 'text-white'}`}>T-{timeLeft.toString().padStart(2, '0')}</div>
          </div>
          <div className="flex items-center gap-4">
            <div className="font-epic text-sm text-white">HP</div>
            <div className="w-72 h-8 bg-black border-4 border-slate-500 p-1 flex">
              <div className={`h-full transition-all duration-300 ${playerHP > 150 ? 'bg-emerald-500' : playerHP > 60 ? 'bg-yellow-500' : 'bg-red-600'}`} style={{ width: `${(playerHP / MAX_PLAYER_HP) * 100}%` }} />
            </div>
            <div className="font-hud text-2xl font-bold tracking-widest">{playerHP}/{MAX_PLAYER_HP}</div>
          </div>
        </div>

        {/* --- TABLETOP AREA --- */}
        <div className="flex-1 flex p-5 gap-6 relative z-10 min-h-0">
          
          {/* LEFT: The Cauldron */}
          <div className="w-1/4 flex flex-col items-center justify-center bg-black/60 border-4 border-slate-600 rounded-xl p-4 shadow-[inset_6px_6px_0_rgba(0,0,0,0.8)] min-h-0">
            <div className="font-epic text-[10px] text-indigo-400 mb-2 tracking-widest">ARCANE CAULDRON</div>
            <div className="relative w-28 h-28 mb-4 shrink-0">
               <svg viewBox="0 0 16 16" width="100%" height="100%" style={{shapeRendering: "crispEdges"}} className="drop-shadow-[0_15px_15px_rgba(0,0,0,0.9)]">
                  {crucible.length > 0 && <rect x="6" y="2" width="4" height="2" fill="#10b981" className="animate-[ping_1s_steps(2)_infinite]"/>}
                  <path d="M4,6 h8 v2 h2 v6 h-12 v-6 h2 z" fill="#0f172a" />
                  <path d="M2,8 h12 v2 h-12 z" fill="#1e293b" />
                  <path d="M4,14 h8 v2 h-8 z" fill="#020617" />
                  {crucible.length > 0 && <path d="M4,6 h8 v2 h-8 z" fill="#34d399" className="animate-[pulse_0.5s_steps(2)_infinite]" />}
               </svg>
               <div className="absolute -top-6 left-0 w-full flex justify-center gap-2">
                 {crucible.map((c, i) => {
                   const el = ELEMENTS.find(e => e.symbol === c);
                   return <span key={i} className="text-xl font-epic text-white drop-shadow-[2px_2px_0_#000] bg-black/80 px-2 py-1 border border-white/20 rounded animate-[bounce_1s_infinite]" style={{color: el ? el.color : '#fff'}}>{c}</span>
                 })}
               </div>
            </div>
            <div className="flex w-full gap-2 mt-2">
              <button onClick={() => setCrucible([])} className="flex-1 py-3 bg-red-950 border-b-4 border-red-900 font-epic text-[10px] text-white active:border-b-0 active:translate-y-1 hover:brightness-125">FLUSH</button>
              <button onClick={craftCompound} disabled={phase !== 1 || crucible.length === 0} className={`flex-[2] py-3 font-epic text-xs border-b-4 active:border-b-0 active:translate-y-1 transition-all ${phase === 1 && crucible.length > 0 ? 'bg-indigo-700 border-indigo-950 text-white shadow-[0_0_20px_rgba(67,56,202,0.6)]' : 'bg-slate-800 border-slate-900 text-slate-600'}`}>SYNTHESIZE</button>
            </div>
          </div>

          {/* MIDDLE: Action Area */}
          <div className="flex-[2] flex flex-col min-h-0">
            {phase === 1 && (
              <div className="h-full flex flex-col min-h-0">
                <div className="flex justify-between items-center mb-4 shrink-0">
                  <span className="font-epic text-sm text-yellow-300 drop-shadow-[2px_2px_0_#000]">SELECT RUNES</span>
                  <button onClick={handleNextPhase} className="px-5 py-3 bg-slate-800 border-2 border-slate-500 font-epic text-[10px] text-white hover:bg-white hover:text-black transition-colors shadow-[4px_4px_0_#000] active:translate-y-1 active:shadow-none">FINISH PREP {'>'}</button>
                </div>
                <div className="flex-1 grid grid-cols-5 gap-3 place-items-center overflow-y-auto min-h-0">
                  {ELEMENTS.map(el => (
                    <button 
                      key={el.symbol} onClick={() => addElement(el.symbol)}
                      className="relative group w-[72px] h-[90px] bg-slate-900 border-4 border-slate-700 flex flex-col items-center justify-center shadow-[4px_4px_0_#000] active:translate-y-1 active:shadow-[0_0_0_#000] hover:border-white transition-colors overflow-hidden shrink-0"
                      style={{ borderTopColor: el.color }}
                    >
                      <div className="absolute inset-0 opacity-10 group-hover:opacity-30" style={{backgroundColor: el.color}}></div>
                      <span className="text-3xl mb-1 grayscale group-hover:grayscale-0 transition-all z-10">{el.rune}</span>
                      <span className="font-epic text-[10px] text-white drop-shadow-[2px_2px_0_#000] z-10">{el.symbol}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {phase === 2 && (
              <div className="h-full flex flex-col min-h-0">
                <div className="flex justify-between items-center mb-4 shrink-0">
                  <span className="font-epic text-sm text-green-400 drop-shadow-[2px_2px_0_#000]">YOUR ARSENAL</span>
                  <button onClick={handleNextPhase} className="px-5 py-3 bg-red-900 border-2 border-red-500 font-epic text-[10px] text-white hover:bg-red-500 transition-colors shadow-[4px_4px_0_#000] active:translate-y-1 active:shadow-none">END COMBAT {'>'}</button>
                </div>
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar min-h-0">
                  {inventory.length === 0 ? (
                    <div className="h-full flex items-center justify-center font-epic text-slate-500">NO POTIONS BREWED</div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      {inventory.map((comp, i) => (
                        <button 
                          key={i} onClick={() => initiateThrow(i)} disabled={throwingItem !== null || qte.active}
                          className={`relative p-4 bg-slate-900 border-4 border-slate-600 text-left shadow-[6px_6px_0_#000] hover:bg-slate-800 group flex flex-col ${(throwingItem || qte.active) ? 'opacity-50 cursor-not-allowed' : 'active:translate-y-1 active:shadow-none'}`}
                        >
                          <div className="font-epic text-[10px] text-white mb-3 truncate group-hover:text-yellow-300 drop-shadow-[1px_1px_0_#000]">{comp.name}</div>
                          <div className="flex gap-3 items-center">
                             <div className="w-10 h-10 rounded-full border-2 border-white shadow-[0_0_10px_rgba(255,255,255,0.5)] shrink-0" style={{backgroundColor: comp.color}}></div>
                             <div className="flex flex-col gap-1 w-full">
                               <div className="flex justify-between bg-black/80 px-2 py-1 border border-slate-700">
                                 <span className="font-hud text-xs text-slate-400">DMG</span>
                                 <span className="font-hud text-sm font-bold text-white">{comp.damage}</span>
                               </div>
                               {comp.status && (
                                 <div className="text-center font-epic text-[8px] py-1 border border-white/20" style={{backgroundColor: comp.color, color: '#000'}}>
                                   {comp.status}
                                 </div>
                               )}
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
              <div className="h-full flex flex-col items-center bg-black/60 border-4 border-dashed border-purple-900/50 p-4 min-h-0">
                <span className="font-epic text-sm text-purple-400 mb-4 drop-shadow-[2px_2px_0_#000] w-full text-left border-b border-purple-900 pb-2 shrink-0">JUDGEMENT PROTOCOLS</span>
                <div className="w-full flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-3 pr-2 min-h-0">
                  {ULTIMATES.map(ult => {
                    const isReady = ult.req.every(r => monsterStatuses.includes(r));
                    return (
                      <button 
                        key={ult.id} onClick={() => isReady && executeUltimate(ult)} disabled={!isReady || hasCastUltimate}
                        className={`w-full p-4 border-4 flex justify-between items-center transition-all shrink-0 ${isReady && !hasCastUltimate ? `border-white shadow-[6px_6px_0_#000] active:translate-y-1 active:shadow-none hover:brightness-125 animate-[pulse_1.5s_infinite]` : 'bg-slate-900 border-slate-700 opacity-50 cursor-not-allowed'}`}
                        style={isReady && !hasCastUltimate ? { backgroundColor: ult.color, color: '#000' } : {}}
                      >
                        <div className="flex flex-col text-left w-2/3">
                           <span className={`font-epic text-xs ${isReady && !hasCastUltimate ? '' : 'text-slate-500'}`}>{ult.name}</span>
                           <span className={`font-hud text-sm mt-2 font-bold ${isReady && !hasCastUltimate ? 'text-black/70' : 'text-slate-600'}`}>{ult.desc}</span>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className={`font-hud text-lg font-black px-2 py-1 border-2 ${isReady && !hasCastUltimate ? 'bg-black text-white border-white' : 'bg-transparent text-slate-500 border-slate-600'}`}>DMG: {ult.dmg}</span>
                          <div className="flex gap-1 flex-wrap justify-end">
                            {ult.req.map(r => (
                              <span key={r} className={`text-[8px] font-epic uppercase px-1 py-0.5 border ${monsterStatuses.includes(r) ? 'bg-green-500 border-white text-black' : 'bg-slate-800 border-slate-600 text-slate-500'}`}>{r}</span>
                            ))}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
                
                {/* ⏭️ SMART SKIP BUTTON */}
                <button onClick={handleNextPhase} disabled={hasCastUltimate} className={`mt-4 w-full py-3 border-4 font-epic text-xs shrink-0 shadow-[4px_4px_0_#000] active:translate-y-1 active:shadow-none transition-colors ${hasCastUltimate ? 'bg-slate-800 border-slate-700 text-slate-500 opacity-50 cursor-not-allowed' : 'bg-slate-800 border-slate-600 text-white hover:bg-white hover:text-black'}`}>
                  {isAnyUltimateReady && !hasCastUltimate ? 'SKIP ULTIMATE & BRACE FOR IMPACT' : 'NO ULTIMATE READY - END TURN >'}
                </button>

              </div>
            )}

            {phase >= 4 && (
              <div className="h-full flex flex-col items-center justify-center min-h-0">
                {phase === 4 ? (
                  <div className="font-epic text-3xl text-rose-500 animate-[ping_0.5s_steps(2)_infinite] drop-shadow-[4px_4px_0_#000]">ENEMY TURN!</div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className={`font-epic text-5xl mb-8 drop-shadow-[6px_6px_0_#000] ${playerHP > 0 ? 'text-emerald-400' : 'text-red-600'}`}>
                      {playerHP > 0 ? 'VICTORY' : 'GAME OVER'}
                    </div>
                    {/* กลับหน้าฉากหลัก */}
                    {onQuitBattle ? (
                      <button onClick={onQuitBattle} className="px-8 py-4 bg-white text-black font-epic text-lg hover:bg-slate-300 border-4 border-slate-600 shadow-[6px_6px_0_#000] active:translate-y-1 active:shadow-none">RETURN TO ACADEMY</button>
                    ) : (
                      <button onClick={restartGame} className="px-8 py-4 bg-white text-black font-epic text-lg hover:bg-slate-300 border-4 border-slate-600 shadow-[6px_6px_0_#000] active:translate-y-1 active:shadow-none">PLAY AGAIN</button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT: Combat Log Terminal */}
          <div className="flex-[1.2] bg-[#020617] border-4 border-indigo-900 p-4 flex flex-col shadow-[inset_0_0_30px_rgba(49,46,129,0.8)] relative text-indigo-200 min-h-0">
            <div className="font-epic text-[10px] mb-3 border-b-2 border-indigo-800 pb-2 flex justify-between text-indigo-400 shrink-0">
              <span>ARCANE.LOG</span>
              <span>TURN {turn}</span>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-2 font-hud text-xl font-bold tracking-wide min-h-0">
              {logs.map((log, i) => (
                <div key={i} className={`shrink-0 ${i === 0 ? 'text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]' : 'opacity-50'}`}>
                  {i === 0 ? '>>' : '  '} {log}
                </div>
              ))}
            </div>
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] opacity-30"></div>
          </div>

        </div>
      </div>
      
      {/* 🔮 EPIC CSS KEYFRAMES 🔮 */}
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&display=swap');
        
        .font-epic { font-family: 'Press Start 2P', cursive; }
        .font-hud { font-family: 'VT323', monospace; }
        
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-15px) translateY(-5px); }
          50% { transform: translateX(15px) translateY(5px); }
          75% { transform: translateX(-15px) translateY(5px); }
        }
        @keyframes shakeHeavy {
          0%, 100% { transform: translateY(0); }
          25% { transform: translateY(-25px) scale(1.05); }
          50% { transform: translateY(25px) scale(0.95); }
          75% { transform: translateY(-25px) scale(1.05); }
        }
        @keyframes nukeShake {
          0%, 100% { transform: translate(0, 0) scale(1); filter: invert(0); }
          25% { transform: translate(-40px, -40px) scale(1.2); filter: invert(0.8); }
          50% { transform: translate(40px, 40px) scale(0.8); filter: invert(1); }
          75% { transform: translate(-40px, 40px) scale(1.2); filter: invert(0.8); }
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
          100% { transform: scale(5); opacity: 0; }
        }
        @keyframes zoomFade {
          0% { transform: scale(0.5); opacity: 0; }
          20% { transform: scale(1.5); opacity: 1; }
          100% { transform: scale(1); opacity: 0; }
        }
        @keyframes iceShatter {
          0% { opacity: 0; transform: scale(0.8); }
          30% { opacity: 1; transform: scale(1); }
          90% { opacity: 1; transform: scale(1.1); }
          100% { opacity: 0; transform: scale(3); filter: brightness(2); }
        }
        @keyframes fireRise {
          0% { opacity: 0; transform: translateY(100%); }
          10% { opacity: 1; transform: translateY(50%); }
          100% { opacity: 0; transform: translateY(-50%); }
        }
        @keyframes whiteout {
          0% { opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { opacity: 0; }
        }

        .custom-scrollbar::-webkit-scrollbar { width: 12px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #0f172a; border: 2px solid #1e293b; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #475569; border: 2px solid #0f172a; }
      `}} />
    </div>
  );
}