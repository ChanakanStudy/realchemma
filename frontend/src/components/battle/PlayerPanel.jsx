import React from 'react';

export default function PlayerPanel({ phase, timeLeft, playerHP }) {
  return (
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
  );
}
