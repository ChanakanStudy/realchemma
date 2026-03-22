import React from 'react';

export default function BattleLog({ logs, turn }) {
  return (
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
  );
}
