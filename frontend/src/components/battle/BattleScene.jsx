import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ELEMENTS, RECIPES, ULTIMATES, MAX_TIME, matchRecipe, calculateQTEResult } from '../../systems/battle/battleLogic';
import EnemyPanel from './EnemyPanel';
import PlayerPanel from './PlayerPanel';
import ActionMenu from './ActionMenu';
import BattleLog from './BattleLog';

export default function BattleScene({ onQuitBattle }) {
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

      latestQte.current = { ...prev, progress: nextP, direction: nextD };
      setQte(latestQte.current);
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

  // Global Keydown for QTE
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
    const matchedRecipe = matchRecipe(crucible);

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
    previousTimeRef.current = undefined;
  };

  const resolveQTE = useCallback(() => {
    const current = latestQte.current;
    if (!current.active) return;

    const { result, mult } = calculateQTEResult(current.progress);

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
      <EnemyPanel
        monsterHP={monsterHP}
        monsterStatuses={monsterStatuses}
        monsterHit={monsterHit}
        attackEffect={attackEffect}
        qte={qte}
        qteResult={qteResult}
        throwingItem={throwingItem}
        resolveQTE={resolveQTE}
      />

      {/* =========================================
          BOTTOM HALF: THE ALCHEMIST'S WORKBENCH
      ========================================= */}
      <div className="relative h-[45%] w-full bg-slate-800 border-t-8 border-slate-600 shadow-[inset_0_20px_20px_rgba(0,0,0,0.5)] z-20 flex flex-col">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, #000 2px, #000 4px)` }} />

        {/* --- WORKBENCH HUD --- */}
        <PlayerPanel phase={phase} timeLeft={timeLeft} playerHP={playerHP} />

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
          <ActionMenu
            phase={phase}
            crucible={crucible}
            inventory={inventory}
            monsterStatuses={monsterStatuses}
            throwingItem={throwingItem}
            qte={qte}
            playerHP={playerHP}
            handleNextPhase={handleNextPhase}
            addElement={addElement}
            setCrucible={setCrucible}
            craftCompound={craftCompound}
            initiateThrow={initiateThrow}
            executeUltimate={executeUltimate}
            restartGame={restartGame}
          />

          {/* RIGHT: Combat Log Scroll */}
          <BattleLog logs={logs} turn={turn} />

        </div>
      </div>
    </div>
  );
}
