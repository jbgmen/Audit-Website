import React from 'react';

interface Props {
  onBack: () => void;
}

const Documentation: React.FC<Props> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-forensicWhite py-24 px-8 animate-in">
      <div className="max-w-5xl mx-auto">
        <button 
          onClick={onBack} 
          className="text-xs font-black uppercase tracking-metadata text-slate-400 hover:text-primary mb-8 block transition-all"
        >
          ← Return to Command
        </button>

        <div className="space-y-12 md:space-y-24 py-12 md:py-20 px-4 md:px-6 w-full overflow-hidden">
          <div className="text-center space-y-4 px-4">
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-black text-slate-900 italic tracking-tighter leading-tight">
              The Gold Standard in Verification
            </h2>
            <p className="text-base sm:text-xl text-slate-500 max-w-2xl mx-auto font-medium">
              VelaCore Certification isn't just a badge—it's a rigorous data-driven assessment of digital performance excellence.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[
              { 
                title: "Independent Review", 
                desc: "Zero human bias. Our engine analyzes objectively against global conversion benchmarks.",
                icon: "⚖️"
              },
              { 
                title: "Performance Proof", 
                desc: "Use the certificate as legal-grade proof of quality for stakeholders or portfolios.",
                icon: "📜"
              },
              { 
                title: "Dynamic Tiers", 
                desc: "From 'Needs Improvement' to 'Exemplary'. We define the threshold for web success.",
                icon: "📊"
              }
            ].map((item, i) => (
              <div key={i} className="bg-white p-6 md:p-10 rounded-[1.5rem] md:rounded-3xl border border-slate-100 shadow-xl hover:border-slate-300 transition-all group">
                <div className="text-3xl md:text-4xl mb-4 md:mb-6 group-hover:scale-110 transition-transform inline-block">{item.icon}</div>
                <h3 className="text-lg md:text-2xl font-black text-slate-900 mb-3 tracking-tight uppercase">{item.title}</h3>
                <p className="text-slate-500 leading-relaxed text-xs md:text-base font-medium">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="bg-slate-900 rounded-[1.5rem] sm:rounded-[3rem] p-8 md:p-20 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16 items-center">
              <div className="space-y-8 md:space-y-10">
                <h3 className="text-2xl md:text-4xl font-black tracking-tight uppercase">Recognition Tiers</h3>
                <div className="space-y-6">
                  {[
                    { label: "Industry Benchmark (90%+)", color: "bg-emerald-500", desc: "Leading performance. Ready for high-scale commercial traffic." },
                    { label: "Verified (75-89%)", color: "bg-blue-500", desc: "Strong foundation with professional optimization standards." },
                    { label: "Needs Optimization (60-74%)", color: "bg-amber-500", desc: "Functional but losing potential revenue to UX friction." },
                    { label: "Revision Required (<60%)", color: "bg-rose-500", desc: "Critical gaps identified. Immediate overhaul recommended." }
                  ].map((tier, idx) => (
                    <div key={idx} className="flex items-start gap-4">
                      <div className={`w-3 h-3 rounded-full mt-1.5 shrink-0 ${tier.color} shadow-[0_0_8px_rgba(255,255,255,0.2)]`}></div>
                      <div>
                        <p className="font-black text-sm md:text-lg tracking-tight uppercase">{tier.label}</p>
                        <p className="text-slate-400 text-[10px] md:text-sm font-medium leading-relaxed">{tier.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 p-6 md:p-10 rounded-[1.5rem] md:rounded-3xl backdrop-blur-md">
                <p className="text-slate-200 italic mb-6 md:mb-10 text-sm md:text-lg leading-relaxed font-medium">
                  "VelaCore Analytics has become our primary protocol for validating developer handovers. The certificate provides a neutral ground for quality."
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-slate-800 border-2 border-white/10 shrink-0 shadow-inner overflow-hidden flex items-center justify-center p-2.5">
                    <img 
                      src="https://velacore.site/assets/images/VelaCore-symbol-light.svg" 
                      alt="VelaCore Authority Seal" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <p className="font-black text-sm md:text-base uppercase tracking-wider">Marcus Thorne</p>
                    <p className="text-[8px] md:text-[10px] text-slate-500 tracking-[0.3em] uppercase font-black">CTO, Nexus Digital</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-24 p-12 bg-slate-50 rounded-[3rem] text-center border border-slate-100">
             <h4 className="text-sm font-black uppercase tracking-widest text-primary mb-4">Authorized Documentation</h4>
             <p className="text-xs text-slate-400 uppercase tracking-widest leading-loose">
               Revision: 2025.04-F • Intellectual Property of VelaCore Labs<br />
               Distribution restricted to licensed forensic auditors only.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Documentation;