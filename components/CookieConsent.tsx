import React, { useState, useEffect } from 'react';

const CookieConsent: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('velacore_cookie_protocol');
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 2500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAction = (type: 'all' | 'essential') => {
    localStorage.setItem('velacore_cookie_protocol', type);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 left-6 md:left-auto z-[200] flex justify-end pointer-events-none">
      <div className="w-full md:w-[420px] bg-[#020617]/90 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-5 md:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.4)] flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-6 duration-700 pointer-events-auto">
        
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0 border border-accent/20">
            <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-accent">Protocol Authorization</h4>
              <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest italic">v2.5</span>
            </div>
            <p className="text-white/80 text-[12px] md:text-[13px] font-medium leading-relaxed">
              We use encrypted identifiers to verify architectural integrity and optimize your forensic audit experience.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => handleAction('essential')}
            className="flex-1 px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/5 transition-all border border-white/5"
          >
            Essential
          </button>
          <button 
            onClick={() => handleAction('all')}
            className="flex-[1.5] px-6 py-2.5 rounded-xl bg-accent text-primary text-[9px] font-black uppercase tracking-[0.2em] shadow-lg shadow-accent/10 hover:-translate-y-0.5 active:scale-95 transition-all"
          >
            Accept Protocol
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;