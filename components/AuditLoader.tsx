import React, { useState, useEffect } from 'react';
import Logo from './Logo';

const MESSAGES = [
  "INITIALIZING FORENSIC PROTOCOL...",
  "ESTABLISHING SECURE GATEWAY...",
  "SCANNING ARCHITECTURAL SURFACE...",
  "DEEP LOGIC VALIDATION IN PROGRESS...",
  "ANALYZING CONVERSION FRICTION...",
  "GENERATING AUTHENTICITY HASH...",
  "SEALING OFFICIAL CERTIFICATE..."
];

const AuditLoader: React.FC = () => {
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const messageTimer = setInterval(() => {
      setIndex((prev) => (prev < MESSAGES.length - 1 ? prev + 1 : prev));
    }, 2800);

    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        const increment = prev < 80 ? 0.8 : 0.2;
        return Math.min(prev + increment, 100);
      });
    }, 50);

    return () => {
      clearInterval(messageTimer);
      clearInterval(progressTimer);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-[#020617] flex flex-col items-center justify-center overflow-hidden p-4">
      {/* Cinematic Background Layer */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Animated Grid */}
        <div 
          className="absolute inset-0 opacity-[0.1]" 
          style={{ 
            backgroundImage: `linear-gradient(#D4AF37 1px, transparent 1px), linear-gradient(90deg, #D4AF37 1px, transparent 1px)`,
            backgroundSize: 'clamp(32px, 8vw, 64px) clamp(32px, 8vw, 64px)',
            maskImage: 'radial-gradient(circle at center, black 30%, transparent 80%)'
          }}
        />
        
        {/* Floating Light Orbs */}
        <div className="absolute top-1/4 left-1/4 w-[60vw] h-[60vw] md:w-[40vw] md:h-[40vw] bg-accent/5 blur-[100px] md:blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[50vw] h-[50vw] md:w-[35vw] md:h-[35vw] bg-blue-500/5 blur-[100px] md:blur-[150px] rounded-full animate-pulse [animation-delay:2s]" />

        {/* Vertical Data Stream Lines */}
        <div className="absolute inset-0 flex justify-around opacity-[0.03] md:opacity-[0.05]">
          {[...Array(6)].map((_, i) => (
            <div 
              key={i} 
              className="w-[1px] h-full bg-gradient-to-b from-transparent via-accent to-transparent animate-[scroll_4s_linear_infinite]"
              style={{ animationDelay: `${i * 0.6}s` }}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes scan {
          0% { transform: translateY(-100%); opacity: 0; }
          50% { opacity: 0.8; }
          100% { transform: translateY(100%); opacity: 0; }
        }
        @keyframes scroll {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        @keyframes orbit {
          from { transform: rotate(0deg) translateX(clamp(80px, 25vw, 120px)) rotate(0deg); }
          to { transform: rotate(360deg) translateX(clamp(80px, 25vw, 120px)) rotate(-360deg); }
        }
        .text-glow {
          text-shadow: 0 0 15px rgba(212, 175, 55, 0.4);
        }
      `}</style>

      {/* Central Core Element */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-lg mx-auto">
        {/* The "Scanner" Container */}
        <div className="relative w-56 h-56 sm:w-64 sm:h-64 md:w-80 md:h-80 flex items-center justify-center">
          
          {/* Rotating Outer Rings */}
          <div className="absolute inset-0 border border-accent/20 rounded-full animate-[spin_8s_linear_infinite]" />
          <div className="absolute inset-[10%] border border-accent/10 rounded-full animate-[spin_12s_linear_infinite_reverse]" />
          <div className="absolute inset-[20%] border-2 border-dashed border-accent/30 rounded-full animate-[spin_20s_linear_infinite]" />
          
          {/* Circular Progress Path */}
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="48"
              fill="none"
              stroke="rgba(212, 175, 55, 0.05)"
              strokeWidth="1"
            />
            <circle
              cx="50"
              cy="50"
              r="48"
              fill="none"
              stroke="#D4AF37"
              strokeWidth="2"
              strokeDasharray="301.59"
              strokeDashoffset={301.59 - (301.59 * progress) / 100}
              strokeLinecap="round"
              className="transition-all duration-300 ease-out"
              style={{ filter: 'drop-shadow(0 0 8px #D4AF37)' }}
            />
          </svg>

          {/* Orbiting Data Points */}
          <div className="absolute w-1.5 h-1.5 md:w-2 md:h-2 bg-accent rounded-full animate-[orbit_4s_linear_infinite] shadow-[0_0_10px_#D4AF37]" />
          <div className="absolute w-1 h-1 md:w-1.5 md:h-1.5 bg-blue-400 rounded-full animate-[orbit_6s_linear_infinite_reverse] shadow-[0_0_10px_#60A5FA] [animation-delay:1s]" />

          {/* Logo Housing - Scaled per screen size */}
          <div className="relative bg-[#020617] rounded-[1.5rem] sm:rounded-[2.5rem] p-6 sm:p-8 md:p-10 shadow-[0_0_60px_rgba(212,175,55,0.15)] border border-white/5 group overflow-hidden">
            <div className="relative overflow-hidden rounded-xl sm:rounded-2xl">
              <Logo 
                type="square" 
                inverse={true} 
                className="h-16 sm:h-24 md:h-32 transform transition-transform group-hover:scale-110 duration-700" 
              />
              {/* Laser Scan Line Overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/40 to-transparent h-8 sm:h-12 w-full animate-[scan_2s_ease-in-out_infinite] pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Progress & Message Housing */}
        <div className="mt-8 sm:mt-12 md:mt-16 space-y-4 sm:space-y-6 md:space-y-8 text-center px-4 w-full">
          <div className="space-y-2 sm:space-y-3">
            <h2 className="text-forensicWhite font-heading text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tighter text-glow">
              Execution <span className="text-accent italic">Unit</span>
            </h2>
            <div className="flex items-center justify-center gap-2 sm:gap-4">
               <div className="h-[1px] w-4 sm:w-8 bg-accent/30" />
               <p className="text-accent font-body font-black text-[9px] sm:text-[10px] md:text-sm tracking-[0.2em] sm:tracking-[0.4em] uppercase h-5 sm:h-6 overflow-hidden">
                 {MESSAGES[index]}
               </p>
               <div className="h-[1px] w-4 sm:w-8 bg-accent/30" />
            </div>
          </div>

          {/* Numeric Display */}
          <div className="flex flex-col items-center gap-1 sm:gap-2">
            <div className="text-forensicWhite/20 font-heading font-black text-5xl sm:text-6xl md:text-8xl tabular-nums leading-none">
              {Math.floor(progress)}<span className="text-xl sm:text-2xl md:text-3xl text-accent/40">%</span>
            </div>
            <div className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.4em] sm:tracking-[0.6em] text-slate-500">
              Computational Integrity Check
            </div>
          </div>

          {/* Decorative Security Bitstream */}
          <div className="flex justify-center gap-0.5 sm:gap-1 opacity-20">
            {[...Array(16)].map((_, i) => (
              <div 
                key={i} 
                className={`w-0.5 sm:w-1 h-2 sm:h-3 rounded-full ${i < (progress / 6.25) ? 'bg-accent' : 'bg-white/10'}`} 
              />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Technical Overlay - Repositioned for Mobile */}
      <div className="absolute bottom-6 sm:bottom-12 left-0 right-0 px-6 sm:px-12 flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-6 opacity-30">
        <div className="flex items-center gap-3 sm:gap-4 order-2 md:order-1">
           <div className="w-8 h-8 sm:w-10 sm:h-10 border border-white/20 flex items-center justify-center font-mono text-[6px] sm:text-[8px] text-white">X-RAY</div>
           <div className="text-left">
             <div className="text-[6px] sm:text-[8px] font-black uppercase tracking-widest text-white">System Protocol</div>
             <div className="text-[6px] sm:text-[8px] font-black uppercase tracking-widest text-accent">Forensic-Grade-2.5</div>
           </div>
        </div>
        
        <div className="text-[6px] sm:text-[8px] font-black uppercase tracking-[0.3em] sm:tracking-[0.5em] text-white text-center order-1 md:order-2 px-4">
          DO NOT REFRESH — SECURE ARCHITECTURE SNAPSHOT IN PROGRESS
        </div>

        <div className="flex items-center gap-3 sm:gap-4 order-3">
           <div className="text-right hidden sm:block">
             <div className="text-[8px] font-black uppercase tracking-widest text-white">Registry Auth</div>
             <div className="text-[8px] font-black uppercase tracking-widest text-accent">Verified_Active</div>
           </div>
           <div className="w-8 h-8 sm:w-10 sm:h-10 border border-white/20 flex items-center justify-center font-mono text-[6px] sm:text-[8px] text-white">AUTH</div>
        </div>
      </div>
    </div>
  );
};

export default AuditLoader;