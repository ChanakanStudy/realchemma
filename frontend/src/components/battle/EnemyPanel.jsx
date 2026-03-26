import React from 'react';

export default function EnemyPanel({
  monsterHP,
  monsterStatuses,
  monsterHit,
  attackEffect,
  qte,
  qteResult,
  throwingItem,
  resolveQTE,
}) {
  return (
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
            <div style={{flex: 30}} className="bg-red-600"></div>
            <div style={{flex: 15}} className="bg-yellow-400"></div>
            <div style={{flex: 10}} className="bg-green-500"></div>
            <div style={{flex: 15}} className="bg-yellow-400"></div>
            <div style={{flex: 30}} className="bg-red-600"></div>

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
  );
}
