import React from 'react';
import { ELEMENTS, ULTIMATES } from '../../systems/battle/battleLogic';

export default function ActionMenu({
  phase,
  crucible,
  inventory,
  monsterStatuses,
  throwingItem,
  qte,
  playerHP,
  handleNextPhase,
  addElement,
  setCrucible,
  craftCompound,
  initiateThrow,
  executeUltimate,
  restartGame,
}) {
  return (
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
              );
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
  );
}
