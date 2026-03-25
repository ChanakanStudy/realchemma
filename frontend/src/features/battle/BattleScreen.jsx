import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  ELEMENTS,
  RECIPES,
  ULTIMATES,
  BOSS_DATABASE,
  MAX_TIME,
  MAX_PLAYER_HP,
  matchRecipe,
  calculateQTEResult
} from './battleLogic';

// ==========================================
// 🎬 MAIN BATTLE COMPONENT
// ==========================================
export default function BattleScene({ onQuitBattle }) {
  const [phase, setPhase] = useState(0); 
  const [activeBossId, setActiveBossId] = useState(null);
  
  const [timeLeft, setTimeLeft] = useState(MAX_TIME);
  const [turn, setTurn] = useState(1);
  const [playerHP, setPlayerHP] = useState(MAX_PLAYER_HP);
  const [monsterHP, setMonsterHP] = useState(100); 
  const [monsterStatuses, setMonsterStatuses] = useState([]);
  
  const [crucible, setCrucible] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [logs, setLogs] = useState(['AWAITING TARGET SELECTION...']);

  const [hasCastUltimate, setHasCastUltimate] = useState(false);
  const [ocEnergy, setOcEnergy] = useState(2); 
  
  const [bossState, setBossState] = useState({
    phase: 1, overloadResist: 0, reflecting: false, immunities: [] 
  });
  const bossRef = useRef(bossState);
  useEffect(() => { bossRef.current = bossState; }, [bossState]);

  const [qte, setQte] = useState({ active: false, progress: 0, direction: 1, item: null, overcharge: false });
  const latestQte = useRef({ active: false, progress: 0, direction: 1, item: null, overcharge: false });
  const [qteResult, setQteResult] = useState(null);

  const requestRef = useRef();
  const previousTimeRef = useRef();

  const [screenShake, setScreenShake] = useState('');
  const [monsterHit, setMonsterHit] = useState(false);
  const [attackEffect, setAttackEffect] = useState(null); 
  const [throwingItem, setThrowingItem] = useState(null);
  const [chargingItem, setChargingItem] = useState(null); 
  const [cinematicText, setCinematicText] = useState(null); 

  const activeBoss = activeBossId ? BOSS_DATABASE[activeBossId] : null;

  const addLog = useCallback((msg) => setLogs(prev => [msg, ...prev].slice(0, 5)), []);
  const endGame = useCallback((isWin, reason) => { setPhase(5); addLog(reason); }, [addLog]);

  const startQuest = (bossId) => {
    const target = BOSS_DATABASE[bossId];
    setActiveBossId(bossId);
    setMonsterHP(target.maxHp);
    setPlayerHP(MAX_PLAYER_HP);
    setPhase(1);
    setTurn(1);
    setTimeLeft(MAX_TIME);
    setOcEnergy(2);
    setBossState({ phase: 1, overloadResist: 0, reflecting: false, immunities: [] });
    setInventory([]);
    setCrucible([]);
    setMonsterStatuses([]);
    setLogs([`> BOUNTY ACCEPTED: ${target.name} DETECTED!`]);
  };

  const resolveEnemyTurn = useCallback(() => {
    if (monsterHP <= 0 || !activeBoss) return;
    
    let dotDmg = 0; let heal = 0; let skipTurn = false;
    let nextStatuses = []; let newlyExpiredImmunities = [];

    monsterStatuses.forEach(s => {
      if (s.name === 'Burn') dotDmg += (s.tier === 2 ? 100 : 50);
      if (s.name === 'Toxin') dotDmg += (s.tier === 2 ? 150 : 80);
      if (s.name === 'Bloom') heal += (s.tier === 2 ? 80 : 50);
      if (s.name === 'Freeze') skipTurn = true;

      if (s.duration > 1) nextStatuses.push({ ...s, duration: s.duration - 1 });
      else {
        if (!newlyExpiredImmunities.includes(s.name)) {
          newlyExpiredImmunities.push(s.name);
          addLog(`🧬 <span style="color:#fbbf24">BOSS ADAPTED! Immune to ${s.name.toUpperCase()} for 1 turn.</span>`);
        }
      }
    });

    if (dotDmg > 0) addLog(`> STATUS: Boss took ${dotDmg} DMG.`);
    if (heal > 0) addLog(`> BLOOM: Healed ${heal} HP.`);

    let currentBossHp = Math.max(0, monsterHP - dotDmg);
    let currentPhase = bossRef.current.phase;
    let currentReflect = false; 

    if (currentBossHp <= (activeBoss.maxHp * activeBoss.enrageThreshold) && currentPhase === 1) {
      currentPhase = 2;
      nextStatuses = []; 
      currentReflect = true;
      addLog(`⚠️ <span style="color:#ef4444; font-weight:bold;">${activeBoss.name} ENRAGED! Statuses cleansed!</span>`);
      setScreenShake('animate-[shakeHeavy_0.5s_ease-in-out]');
    } else if (currentPhase === 2 && Math.random() < 0.3) {
      currentReflect = true;
      addLog('🛡️ <span style="color:#60a5fa">BOSS STANCE: Reflection Field Active!</span>');
    }

    setMonsterHP(currentBossHp);
    setMonsterStatuses(nextStatuses);
    setBossState(b => ({ ...b, phase: currentPhase, immunities: newlyExpiredImmunities, reflecting: currentReflect }));
    
    const nextPlayerHpAfterHeal = Math.min(MAX_PLAYER_HP, playerHP + heal);
    setPlayerHP(nextPlayerHpAfterHeal);

    if (currentBossHp <= 0) { endGame(true, `TARGET ELIMINATED.`); return; }
    if (skipTurn) {
      addLog('❄️ ENEMY FROZEN! Turn Skipped.');
      setTimeout(() => { setTurn(t => t + 1); setPhase(1); setTimeLeft(MAX_TIME); setHasCastUltimate(false); }, 2000);
      return;
    }

    setTimeout(() => {
      setScreenShake('animate-[shake_0.2s_ease-in-out_infinite]');
      setTimeout(() => setScreenShake(''), 500);

      let [minAtk, maxAtk] = activeBoss.baseAtk;
      if (currentPhase === 2) { minAtk += 20; maxAtk += 20; }
      let atkRoll = Math.floor(Math.random() * (maxAtk - minAtk + 1)) + minAtk;
      
      if (monsterStatuses.some(s => s.name === 'Shock')) {
        atkRoll = Math.floor(atkRoll * 0.5);
        addLog('⚡ SHOCK: Enemy attack weakened!');
      }

      addLog(`> ENEMY STRIKES! Took ${atkRoll} DMG.`);
      
      const nextPlayerHp = Math.max(0, nextPlayerHpAfterHeal - atkRoll);
      setPlayerHP(nextPlayerHp);
      
      if (nextPlayerHp <= 0) {
        endGame(false, 'YOU HAVE FALLEN...');
      } else {
        setTimeout(() => { setTurn(t => t + 1); setPhase(1); setTimeLeft(MAX_TIME); setHasCastUltimate(false); }, 2000);
      }
    }, 1500);
  }, [monsterHP, monsterStatuses, playerHP, activeBoss, addLog, endGame]);

  const handleNextPhase = useCallback(() => {
    setCrucible([]);
    if (phase === 1) { setPhase(2); setTimeLeft(MAX_TIME); addLog('--- COMBAT PHASE ---'); }
    else if (phase === 2) { setPhase(3); setTimeLeft(MAX_TIME); addLog('--- JUDGEMENT PHASE ---'); }
    else if (phase === 3) { setPhase(4); addLog('THE BEAST PREPARES TO STRIKE!'); setTimeout(resolveEnemyTurn, 1000); }
  }, [phase, addLog, resolveEnemyTurn]);

  useEffect(() => {
    if (phase >= 4 || phase === 0 || qte.active || cinematicText !== null || chargingItem !== null) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { handleNextPhase(); return MAX_TIME; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [phase, qte.active, cinematicText, chargingItem, handleNextPhase]);

  const animateQTE = useCallback((time) => {
    if (previousTimeRef.current != undefined) {
      const deltaTime = time - previousTimeRef.current;
      let prev = latestQte.current;
      if (!prev.active) return;

      let speedMult = prev.overcharge ? 1.6 : 1.0;
      if (prev.overcharge && bossRef.current.phase === 2) speedMult = 2.2; 

      let nextP = prev.progress + (prev.direction * 0.15 * speedMult * deltaTime);
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

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.code === 'Space' || e.code === 'Enter') && latestQte.current.active) {
        e.preventDefault(); resolveQTE();
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
      setAttackEffect({ type: 'craft' }); setTimeout(() => setAttackEffect(null), 500);
    } else { addLog('FAILED: THE MIXTURE EVAPORATED!'); }
    setCrucible([]);
  };

  const initiateThrow = (index, isOvercharge = false) => {
    if (isOvercharge && ocEnergy <= 0) return;
    const compound = inventory[index];
    const newInv = [...inventory];
    newInv.splice(index, 1);
    setInventory(newInv);

    if (isOvercharge) {
      setOcEnergy(e => e - 1);
      addLog(`>> <span style="color:#f97316; font-weight:bold;">OVERCHARGE INITIATED...</span>`);
      setChargingItem(compound); 
      setTimeout(() => {
        setChargingItem(null);
        latestQte.current = { active: true, progress: 0, direction: 1, item: compound, overcharge: true };
        setQte(latestQte.current); setQteResult(null); previousTimeRef.current = undefined; 
      }, 500);
    } else {
      latestQte.current = { active: true, progress: 0, direction: 1, item: compound, overcharge: false };
      setQte(latestQte.current); setQteResult(null); previousTimeRef.current = undefined; 
    }
  };

  const resolveQTE = useCallback(() => {
    const current = latestQte.current;
    if (!current.active) return;

    const { result, mult, color } = calculateQTEResult(current.progress, current.overcharge);
    latestQte.current = { ...current, active: false };
    setQte(latestQte.current);
    setQteResult({ text: result, color: color });
    setThrowingItem({ ...current.item, isOvercharge: current.overcharge });

    setTimeout(() => { executeThrow(current.item, mult, result, current.overcharge); }, 600);
  }, []);

  const executeThrow = (compound, mult, result, isOvercharge) => {
    setThrowingItem(null);
    setAttackEffect({ type: 'hit', color: compound.color, isOvercharge });
    setMonsterHit(true);
    setScreenShake(isOvercharge ? 'animate-[shakeHeavy_0.3s_ease-in-out_infinite]' : 'animate-[shake_0.2s_ease-in-out_infinite]');

    setTimeout(() => {
      setMonsterHit(false); setScreenShake(''); setAttackEffect(null); setQteResult(null);

      let finalDmg = Math.floor(compound.damage * mult);
      let consumedStatuses = [];
      let currentPlayerHp = playerHP;

      setMonsterStatuses(prevStatuses => {
        let next = [...prevStatuses];
        const consume = (statusName) => {
           const idx = next.findIndex(s => s.name === statusName);
           if (idx !== -1) { consumedStatuses.push(statusName); next.splice(idx, 1); return true; }
           return false;
        };

        if (isOvercharge) {
          if (consume('Marked')) finalDmg += 400;
          if (consume('Corroded')) finalDmg = Math.floor(finalDmg * 1.5);
          if (consume('Burn')) finalDmg += 300;
          if (consume('Toxin')) finalDmg += 300;
        }

        if (isOvercharge) {
          finalDmg = Math.floor(finalDmg * (1 - bossRef.current.overloadResist));
          setBossState(b => ({ ...b, overloadResist: Math.min(0.5, b.overloadResist + 0.1) }));
          
          if (bossRef.current.reflecting) {
            const reflectDmg = Math.floor(finalDmg * 0.3);
            currentPlayerHp = Math.max(0, currentPlayerHp - reflectDmg);
            addLog(`🛡️ <span style="color:#60a5fa">BOSS REFLECTED ${reflectDmg} DMG!</span>`);
          }
          
          let bfChance = result === 'MISS' ? 0.50 : result === 'GOOD' ? 0.20 : 0;
          if (Math.random() < bfChance) {
            const bfDmg = Math.floor(Math.random() * 41) + 40; 
            currentPlayerHp = Math.max(0, currentPlayerHp - bfDmg);
            addLog(`<span style="color:#ef4444">> BACKFIRE! YOU TOOK ${bfDmg} DMG!</span>`);
          }
          if (result === 'PERFECT') {
            setOcEnergy(e => Math.min(2, e + 1));
            addLog('⚡ PERFECT OVERCHARGE! Energy Refunded.');
          }
        }

        if (result !== 'MISS' && compound.status) {
          if (bossRef.current.immunities.includes(compound.status)) {
            addLog(`❌ TARGET IMMUNE TO ${compound.status.toUpperCase()}!`);
          } else {
            const existingIdx = next.findIndex(s => s.name === compound.status);
            if (existingIdx === -1) next.push({ name: compound.status, tier: isOvercharge ? 2 : 1, duration: isOvercharge ? 2 : 3 });
            else {
              next[existingIdx].duration = isOvercharge ? 2 : 3;
              next[existingIdx].tier = isOvercharge ? 2 : Math.max(1, next[existingIdx].tier);
            }
          }
        }
        return next;
      });

      setPlayerHP(currentPlayerHp);
      const nextMonsterHp = Math.max(0, monsterHP - finalDmg);
      setMonsterHP(nextMonsterHp);
      
      if (nextMonsterHp <= 0 && currentPlayerHp > 0) {
        endGame(true, 'TARGET ELIMINATED!');
      } else if (currentPlayerHp <= 0) {
        endGame(false, 'KILLED BY YOUR OWN BACKFIRE...');
      }
      
      if (consumedStatuses.length > 0) addLog(`💥 <span style="color:#f97316">OVERCHARGE DETONATED: ${consumedStatuses.join(', ')}!</span>`);
      
      const logPrefix = isOvercharge ? `<span style="color:#facc15">[${result}] OVERCHARGED ${compound.name}!</span>` : `[${result}] THREW ${compound.name}!`;
      addLog(`${logPrefix} DEALT ${finalDmg} DMG.`);
    }, 300);
  };

  const executeUltimate = (ult) => {
    if (hasCastUltimate) return;
    setHasCastUltimate(true); 

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
        const nextMonsterHp = Math.max(0, monsterHP - ult.dmg);
        setMonsterHP(nextMonsterHp);

        if (nextMonsterHp <= 0) {
          endGame(true, `TARGET DECIMATED BY ${ult.name}!`);
        } else {
          setTimeout(() => {
            setMonsterHit(false); setAttackEffect(null); setMonsterStatuses([]); 
            addLog('STATUS EFFECTS DISSIPATED...'); handleNextPhase();
          }, 1500);
        }
      }, 2000);
    }, 1800); 
  };

  const restartToQuestMenu = () => {
    setPhase(0);
    setActiveBossId(null);
    setLogs(['AWAITING TARGET SELECTION...']);
  };

  const getDynamicBg = () => {
    if (attackEffect?.type === 'ult') return attackEffect.ultData.bgTheme;
    if (attackEffect?.type === 'charge' || chargingItem !== null) return 'bg-slate-950 brightness-50 grayscale';
    return 'bg-slate-950';
  };

  const hasStatus = (name) => monsterStatuses.some(s => s.name === name);
  const isAnyUltimateReady = ULTIMATES.some(ult => ult.req.every(hasStatus));

  // ==========================================
  // 🗺️ PHASE 0: QUEST BOARD MENU
  // ==========================================
  if (phase === 0) {
    return (
      <div className="relative w-full h-[100dvh] bg-[#020617] text-white font-hud flex flex-col items-center justify-center p-8 overflow-hidden select-none">
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: `radial-gradient(circle at center, #1e1b4b 0%, transparent 70%)` }}></div>
        
        <h1 className="font-epic text-4xl text-yellow-400 mb-2 drop-shadow-[4px_4px_0_#000] z-10">BOUNTY BOARD</h1>
        <p className="text-slate-400 mb-10 tracking-widest z-10">Select your target to initiate combat protocol</p>
        
        <div className="grid grid-cols-3 gap-6 w-full max-w-5xl z-10">
          {Object.values(BOSS_DATABASE).map(boss => (
            <div key={boss.id} className="bg-slate-900 border-4 border-slate-700 hover:border-white p-6 transition-all hover:-translate-y-2 shadow-[8px_8px_0_#000] flex flex-col group relative overflow-hidden cursor-default">
              <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl opacity-20 group-hover:opacity-40 transition-opacity ${boss.auraColor}`}></div>
              
              <h2 className={`font-epic text-lg mb-4 h-10 drop-shadow-[2px_2px_0_#000] ${boss.colorTheme}`}>{boss.name}</h2>
              
              <div className="flex flex-col gap-2 font-bold tracking-widest mb-6 bg-black/50 p-3 border border-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-400">MAX HP:</span>
                  <span className="text-emerald-400">{boss.maxHp}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">EST ATK:</span>
                  <span className="text-red-400">{boss.baseAtk[0]} - {boss.baseAtk[1]}</span>
                </div>
              </div>
              
              <p className="text-slate-400 text-xs mb-6 h-12 leading-relaxed">{boss.desc}</p>
              
              <button onClick={() => startQuest(boss.id)} className="mt-auto py-3 bg-indigo-900 border-2 border-indigo-500 font-epic text-xs hover:bg-indigo-600 hover:scale-105 active:scale-95 transition-all shadow-[4px_4px_0_#000]">
                ENGAGE
              </button>
            </div>
          ))}
        </div>

        <button onClick={onQuitBattle} className="mt-12 px-8 py-3 bg-slate-800 border-2 border-slate-500 font-epic text-xs hover:bg-white hover:text-black transition-colors shadow-[4px_4px_0_#000] z-10">
          RETURN TO ACADEMY
        </button>
      </div>
    );
  }

  // ==========================================
  // ⚔️ PHASE 1-4: COMBAT SYSTEM
  // ==========================================
  return (
    <div className={`relative w-full h-[100dvh] max-w-full text-white font-hud overflow-hidden flex flex-col selection:bg-indigo-500/30 ${screenShake} ${getDynamicBg()} transition-all duration-1000`}>
      
      {cinematicText && (
        <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md animate-[fadeIn_0.5s_ease-out]">
           <div className="text-5xl font-epic text-transparent bg-clip-text animate-[pulse_0.5s_infinite] drop-shadow-[0_0_30px_rgba(255,255,255,0.8)] tracking-widest text-center px-4"
                style={{ backgroundImage: `linear-gradient(to right, white, ${cinematicText.color}, white)` }}>
             {cinematicText.name}
           </div>
        </div>
      )}

      {/* --- TOP HALF: FIRST-PERSON BATTLEFIELD --- */}
      <div className="relative flex-[0.55] w-full flex flex-col items-center justify-center border-b-8 border-slate-900 overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.8)] min-h-0">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `linear-gradient(335deg, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(155deg, rgba(255,255,255,0.1) 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />
        
        {!attackEffect?.type?.startsWith('ult') && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] blur-[120px] rounded-full mix-blend-screen animate-[pulse_4s_infinite] bg-purple-900/30"></div>
        )}

        {/* 😈 DYNAMIC ENEMY HUD */}
        {activeBoss && (
          <div className="relative z-20 flex flex-col items-center mt-[-5%] w-full max-w-2xl">
            <div className="w-full px-8 mb-6">
              <div className="flex justify-between items-end mb-2 drop-shadow-[2px_2px_0_#000]">
                <span className={`font-epic text-xl ${bossState.phase === 2 ? 'text-red-500 animate-pulse' : activeBoss.colorTheme}`}>{activeBoss.name}</span>
                <span className="text-2xl font-bold tracking-widest">HP: {monsterHP}/{activeBoss.maxHp}</span>
              </div>
              <div className="w-full h-6 bg-slate-900 border-4 border-slate-600 p-1 flex shadow-[4px_4px_0_0_#000]">
                <div className={`h-full transition-all duration-500 ${bossState.phase === 2 ? 'bg-gradient-to-r from-red-700 to-red-500' : 'bg-gradient-to-r from-emerald-500 to-emerald-300'}`} style={{ width: `${(monsterHP / activeBoss.maxHp) * 100}%` }} />
              </div>
              
              <div className="flex flex-wrap gap-2 mt-3 justify-center h-8">
                {bossState.reflecting && <div className="px-2 py-1 bg-blue-900/80 border-2 border-blue-400 text-xs font-epic uppercase text-blue-200">🛡️ REFLECT</div>}
                {bossState.overloadResist > 0 && <div className="px-2 py-1 bg-orange-900/80 border-2 border-orange-400 text-xs font-epic uppercase text-orange-200">⚠️ RESIST: {Math.floor(bossState.overloadResist * 100)}%</div>}
                {bossState.phase === 2 && <div className="px-2 py-1 bg-red-900/80 border-2 border-red-500 text-xs font-epic uppercase text-red-200">🔥 ENRAGED</div>}
                {monsterStatuses.map((s, i) => (
                  <div key={i} className={`px-2 py-1 bg-black/80 border-2 border-white text-xs font-epic uppercase drop-shadow-[2px_2px_0_#000] ${s.tier === 2 ? 'text-orange-400' : 'text-yellow-300'}`}>
                    [{s.name}{s.tier === 2 ? '+' : ''} ({s.duration})]
                  </div>
                ))}
              </div>
            </div>

            {/* 👹 DYNAMIC ENEMY SPRITE */}
            <div className={`relative w-80 h-80 flex items-center justify-center transform transition-all 
              ${monsterHit ? 'scale-90 brightness-200 invert blur-md' : 'animate-[bounce_3s_steps(5)_infinite]'}
            `}>
              <div className={`absolute inset-0 blur-3xl rounded-full ${bossState.phase === 2 ? 'bg-red-600/40 animate-[ping_2s_infinite]' : `${activeBoss.auraColor}/20 animate-[breathe_4s_infinite]`}`}></div>
              <svg viewBox="0 0 32 32" width="100%" height="100%" style={{shapeRendering: "crispEdges"}} className={`drop-shadow-[0_0_40px_rgba(0,0,0,0.8)] z-10 ${bossState.phase === 2 ? 'sepia hue-rotate-[-30deg]' : ''}`}>
                {activeBoss.svgPaths.map((path, idx) => (
                  <path key={idx} d={path.d} fill={path.fill} className={path.className || ''} />
                ))}
                <rect x="14" y="14" width="4" height="4" fill={activeBoss.coreFill} className={bossState.phase === 2 ? "animate-[pulse_0.5s_steps(2)_infinite]" : "animate-[pulse_1.5s_steps(2)_infinite]"} />
                <rect x="15" y="15" width="2" height="2" fill="#fff" className="animate-ping" style={{animationDuration: '1s'}}/>
              </svg>
            </div>
          </div>
        )}

        {/* --- 💥 QTE OVERLAY 💥 --- */}
        {qte.active && (
          <div className="absolute top-[20%] z-50 flex flex-col items-center">
            <div className={`font-epic text-lg mb-4 drop-shadow-[4px_4px_0_#000] animate-bounce ${qte.overcharge ? 'text-red-500 font-black' : 'text-yellow-300'}`}>
              {qte.overcharge ? '⚠ OVERCHARGE RELEASE ⚠' : 'HIT SPACEBAR!'}
            </div>
            
            <div className={`w-[400px] h-8 border-4 bg-black relative flex ${qte.overcharge ? 'border-red-500 shadow-[0_0_20px_#ef4444] animate-[shake_0.5s_infinite]' : 'border-white'}`} onClick={resolveQTE}>
              {qte.overcharge ? (
                <>
                  <div style={{flex: 35}} className="bg-red-800/90"></div>   
                  <div style={{flex: 12}} className="bg-orange-500/90"></div>
                  <div style={{flex: 6}} className="bg-emerald-500 shadow-[0_0_20px_#10b981_inset] z-10 border-x-2 border-white"></div> 
                  <div style={{flex: 12}} className="bg-orange-500/90"></div>
                  <div style={{flex: 35}} className="bg-red-800/90"></div>   
                </>
              ) : (
                <>
                  <div style={{flex: 30}} className="bg-red-600/80"></div>   
                  <div style={{flex: 15}} className="bg-yellow-400/80"></div>
                  <div style={{flex: 10}} className="bg-emerald-500 shadow-[0_0_20px_#10b981_inset] z-10 border-x-2 border-white"></div> 
                  <div style={{flex: 15}} className="bg-yellow-400/80"></div>
                  <div style={{flex: 30}} className="bg-red-600/80"></div>   
                </>
              )}
              <div className="absolute top-[-12px] bottom-[-12px] w-2 bg-white drop-shadow-[0_0_8px_#fff]" style={{ left: `${qte.progress}%`, transform: 'translateX(-50%)' }} />
            </div>
          </div>
        )}

        {qteResult && (
          <div className="absolute top-[30%] z-50 font-epic text-5xl drop-shadow-[6px_6px_0_#000] animate-[zoomFade_1s_ease-out_forwards]" style={{ color: qteResult.color }}>
            {qteResult.text}!
          </div>
        )}

        {/* --- ⚡ ANTICIPATION CHARGE (OVERCHARGE PREP) --- */}
        {chargingItem && (
          <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden bg-red-900/20 mix-blend-overlay animate-[pulse_0.2s_infinite]">
            <div className="absolute bottom-[0%] right-[5%] w-[450px] h-[450px] origin-bottom-right animate-[shakeHeavy_0.1s_infinite]">
              <svg viewBox="0 0 32 32" className="w-full h-full drop-shadow-[0_20px_20px_rgba(220,38,38,0.5)]" style={{shapeRendering: "crispEdges"}}>
                <rect x="16" y="20" width="16" height="16" fill="#0f172a" />
                <rect x="14" y="18" width="18" height="4" fill="#fbbf24" />
                <rect x="18" y="22" width="4" height="10" fill="#1e293b" />
                <rect x="10" y="8" width="12" height="10" fill="#451a03" />
                <rect x="8" y="12" width="4" height="4" fill="#290f02" />
                <rect x="6" y="6" width="4" height="8" fill="#290f02" />
                <rect x="10" y="6" width="2" height="4" fill="#290f02" />
              </svg>
            </div>
            <div className="absolute bottom-[28%] right-[22%] w-24 h-24 animate-[shakeHeavy_0.1s_infinite]">
              <svg viewBox="0 0 16 16" width="100%" height="100%" style={{shapeRendering: "crispEdges"}} className="drop-shadow-[0_0_30px_rgba(239,68,68,1)]">
                <rect x="6" y="0" width="4" height="2" fill="#d4d4d8" />
                <rect x="7" y="2" width="2" height="4" fill="#cbd5e1" />
                <path d="M4,6 h8 v8 h-8 z" fill={chargingItem.color} />
                <path d="M4,6 h8 v4 h-8 z" fill="#fff" fillOpacity="0.4" />
                <path d="M3,5 h10 v10 h-10 z" fill="transparent" stroke="#fff" strokeWidth="1" />
              </svg>
            </div>
          </div>
        )}

        {/* --- 💥 NORMAL THROW IMPACT --- */}
        {attackEffect?.type === 'hit' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-40">
            <div className={`w-80 h-80 rounded-full mix-blend-screen animate-[explosion_0.4s_ease-out_forwards] ${attackEffect.isOvercharge ? 'scale-150 blur-xl' : 'blur-3xl'}`} style={{backgroundColor: attackEffect.color}}></div>
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
              <svg viewBox="0 0 16 16" width="100%" height="100%" style={{shapeRendering: "crispEdges"}} className={`drop-shadow-[0_0_20px_rgba(255,255,255,0.8)] ${throwingItem.isOvercharge ? 'animate-[pulse_0.2s_infinite]' : ''}`}>
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
            
            {/* ⚡ Energy System */}
            <div className="flex items-center gap-2 mr-6 border-r border-slate-600 pr-6">
              <span className="font-epic text-xs text-orange-400">ENERGY:</span>
              <div className="flex gap-1">
                {[1, 2].map(i => (
                  <div key={i} className={`w-4 h-4 rounded-full border-2 border-orange-500 ${ocEnergy >= i ? 'bg-orange-500 shadow-[0_0_10px_#f97316]' : 'bg-transparent'}`}></div>
                ))}
              </div>
            </div>

            <div className="font-epic text-sm text-white">HP</div>
            <div className="w-64 h-8 bg-black border-4 border-slate-500 p-1 flex">
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
                        <div 
                          key={i} 
                          className={`relative p-4 bg-slate-900 border-4 border-slate-600 text-left shadow-[6px_6px_0_#000] flex flex-col gap-2 ${(throwingItem || qte.active || chargingItem) ? 'opacity-50' : 'hover:bg-slate-800 transition-colors'}`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <div className="font-epic text-[10px] text-white truncate drop-shadow-[1px_1px_0_#000] leading-tight w-2/3">{comp.name}</div>
                            <div className="w-8 h-8 rounded-full border-2 border-white shadow-[0_0_10px_rgba(255,255,255,0.5)] shrink-0" style={{backgroundColor: comp.color}}></div>
                          </div>
                          
                          <div className="flex flex-col gap-1 w-full mb-2">
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
                          
                          {/* 💥 DUAL ACTION BUTTONS */}
                          <div className="flex gap-2 mt-auto">
                            <button 
                              onClick={() => initiateThrow(i, false)} 
                              disabled={throwingItem !== null || qte.active || chargingItem !== null}
                              className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 border-b-4 border-slate-900 font-epic text-[8px] text-white active:border-b-0 active:translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              THROW
                            </button>
                            <button 
                              onClick={() => initiateThrow(i, true)} 
                              disabled={throwingItem !== null || qte.active || chargingItem !== null || ocEnergy <= 0}
                              className={`flex-[1.5] py-2 border-b-4 font-epic text-[8px] active:border-b-0 active:translate-y-1 flex justify-center items-center gap-1 group relative overflow-hidden transition-all ${ocEnergy <= 0 ? 'bg-slate-800 border-slate-900 text-slate-600 opacity-50 cursor-not-allowed' : 'bg-red-950 border-red-900 text-red-200 hover:bg-red-900 hover:text-white'}`}
                              title="OVERCHARGE (Costs 1 Energy): +80% DMG, DETONATES COMBO, 25% BACKFIRE"
                            >
                              {ocEnergy > 0 && <div className="absolute inset-0 bg-red-500/20 animate-pulse group-hover:bg-red-500/40"></div>}
                              <span className="relative z-10 font-bold">OVERCHARGE ⚠</span>
                            </button>
                          </div>
                        </div>
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
                    const isReady = ult.req.every(r => hasStatus(r));
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
                              <span key={r} className={`text-[8px] font-epic uppercase px-1 py-0.5 border ${hasStatus(r) ? 'bg-green-500 border-white text-black' : 'bg-slate-800 border-slate-600 text-slate-500'}`}>{r}</span>
                            ))}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
                
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
                    <button onClick={restartToQuestMenu} className="px-8 py-4 bg-white text-black font-epic text-lg hover:bg-slate-300 border-4 border-slate-600 shadow-[6px_6px_0_#000] active:translate-y-1 active:shadow-none mb-4">BACK TO BOUNTIES</button>
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
            <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-2 font-hud text-lg font-bold tracking-wide min-h-0">
              {logs.map((log, i) => (
                <div key={i} className={`shrink-0 ${i === 0 ? 'text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]' : 'opacity-50'}`} dangerouslySetInnerHTML={{__html: log}} />
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
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-25px) translateX(-10px) scale(1.05); }
          50% { transform: translateY(25px) translateX(10px) scale(0.95); }
          75% { transform: translateY(-25px) translateX(-10px) scale(1.05); }
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