
import React from 'react';
import Logo from '../components/Logo';

interface Props {
  onBack: () => void;
}

const Standards: React.FC<Props> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-forensicWhite py-24 px-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="max-w-5xl mx-auto">
        <button 
          onClick={onBack} 
          className="text-xs font-black uppercase tracking-metadata text-slate-400 hover:text-primary mb-12 block transition-all"
        >
          ← Return to Console
        </button>

        <header className="mb-20">
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-slate-900 text-white rounded-full text-[9px] font-black uppercase tracking-[0.4em] mb-8">
            VelaCore Protocol v2.5
          </div>
          <h1 className="text-4xl md:text-7xl font-black text-slate-900 tracking-tighter leading-none mb-6 uppercase">
            Professional <br /><span className="text-accent italic">Forensic Standards.</span>
          </h1>
          <p className="text-xl text-slate-500 font-medium leading-relaxed italic max-w-3xl">
            Defining the global benchmarks for digital asset integrity. Our standards ensure that every audit is conducted with absolute logic, transparency, and authority.
          </p>
        </header>

        <div className="space-y-16">
          {/* Methodology Section */}
          <section className="p-12 md:p-16 bg-white border border-slate-100 rounded-[3rem] shadow-sm">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.5em] mb-10">01. Computational Methodology</h2>
            <div className="grid md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Forensic Logic Layer</h3>
                <p className="text-slate-500 text-sm leading-relaxed font-medium">
                  The VelaCore engine doesn't just scan; it interprets. Using a proprietary weighting system, we evaluate conversion architecture against industry-specific "Survival Thresholds."
                </p>
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                  <div className="w-10 h-10 bg-primary text-accent rounded-xl flex items-center justify-center font-black">AI</div>
                  <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Neural Logic Pattern Recognition</span>
                </div>
              </div>
              <div className="space-y-4">
                {[
                  "Architectural Redundancy Check",
                  "Trust Signal Saturation Analysis",
                  "Conversion Friction Identification",
                  "Visual Hierarchy Integrity"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-5 border border-slate-50 rounded-2xl hover:bg-slate-50 transition-all">
                    <span className="text-accent font-black">0{i+1}</span>
                    <span className="text-sm font-bold text-slate-800 tracking-tight">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Compliance Tiers */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-10 bg-slate-900 text-white rounded-[3rem] space-y-6">
              <h2 className="text-[10px] font-black text-accent uppercase tracking-[0.4em]">Official Registry</h2>
              <h3 className="text-3xl font-black tracking-tight uppercase leading-none">The Golden Threshold (90%+)</h3>
              <p className="text-slate-400 text-sm leading-relaxed font-medium">
                Websites achieving this tier are considered "Forensic Grade." They represent the pinnacle of digital trust, speed, and conversion readiness.
              </p>
              <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-accent w-[92%]"></div>
              </div>
            </div>
            <div className="p-10 bg-white border border-slate-100 rounded-[3rem] space-y-6">
              <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Commercial Grade</h2>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight uppercase leading-none">Verified (75% - 89%)</h3>
              <p className="text-slate-500 text-sm leading-relaxed font-medium">
                The standard for established brands. High reliability with minor structural gaps that do not compromise core business objectives.
              </p>
              <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-slate-900 w-[78%]"></div>
              </div>
            </div>
          </section>

          {/* Regulatory Notice */}
          <div className="mt-20 p-12 bg-white rounded-[3.5rem] text-center border border-slate-100 relative overflow-hidden group shadow-xl shadow-slate-200/20">
            <div className="absolute top-0 right-0 w-80 h-80 bg-accent/5 rounded-full -mr-40 -mt-40 blur-[100px] opacity-100 group-hover:bg-accent/10 transition-colors"></div>
            
            {/* Logo is now colorful and more prominent as per user request */}
            <Logo type="square" className="h-16 mx-auto mb-8 relative z-10 drop-shadow-sm" />
            
            <h4 className="text-sm font-black uppercase tracking-[0.3em] text-primary mb-6 relative z-10">Authorization Disclosure</h4>
            <p className="text-xs text-slate-400 uppercase tracking-widest leading-loose max-w-2xl mx-auto italic relative z-10">
              VelaCore Standards are revised bi-annually to reflect evolving digital luxury and forensic data processing capabilities. These standards are protected intellectual property.
              <br /><br />
              Protocol Hash: VC-STD-2026-X • Revision: 09.02
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Standards;
