
import React from 'react';

const ForensicStamp: React.FC<{ date: string }> = ({ date }) => {
  return (
    <div className="relative w-48 h-48 flex items-center justify-center opacity-90 select-none">
      <svg viewBox="0 0 200 200" className="w-full h-full animate-spin-[20s] linear infinite">
        <path
          id="circlePath"
          d="M 100, 100 m -75, 0 a 75,75 0 1,1 150,0 a 75,75 0 1,1 -150,0"
          fill="none"
        />
        <text className="font-heading font-black text-[14px] uppercase fill-accent tracking-[0.2em]">
          <textPath xlinkHref="#circlePath">
            VELACORE ANALYTICS • FORENSIC VERIFICATION • VELACORE ANALYTICS • 
          </textPath>
        </text>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center border-4 border-double border-accent rounded-full m-4">
        <div className="text-primary font-heading font-black text-xl leading-none">VERIFIED</div>
        <div className="text-accent font-body font-bold text-[10px] mt-1 tracking-widest">{date}</div>
        <div className="text-primary/50 font-body font-black text-[8px] mt-1 uppercase">Protocol v2.5</div>
      </div>
    </div>
  );
};

export default ForensicStamp;
