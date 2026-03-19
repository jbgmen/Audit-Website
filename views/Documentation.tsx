import React from 'react';

interface Props { onBack: () => void; }

const Documentation: React.FC<Props> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-forensicWhite animate-in fade-in duration-700">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-10 sm:py-16 md:py-24">

        <button onClick={onBack} className="flex items-center gap-2 text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] sm:tracking-metadata text-slate-400 hover:text-primary mb-8 sm:mb-12 transition-all group">
          <span className="group-hover:-translate-x-1 transition-transform inline-block">←</span> Return to Command
        </button>

        <div className="space-y-12 sm:space-y-20 md:space-y-24">

          {/* Hero */}
          <div className="text-center space-y-4 sm:space-y-6 px-2">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[#D4AF37] text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] sm:tracking-[0.4em] mb-2">
              VelaCore Certification Framework
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-6xl font-black text-slate-900 italic tracking-tighter leading-tight">
              The Gold Standard<br className="hidden sm:block"/> in Verification
            </h2>
            <p className="text-sm sm:text-lg md:text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
              VelaCore Certification isn't just a badge — it's a rigorous data-driven assessment of digital performance excellence.
            </p>
          </div>

          {/* Feature cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {[
              { title: 'Independent Review',  desc: 'Zero human bias. Our engine analyzes objectively against global conversion benchmarks.',      icon: '⚖️' },
              { title: 'Performance Proof',   desc: 'Use the certificate as legal-grade proof of quality for stakeholders or portfolios.',            icon: '📜' },
              { title: 'Dynamic Tiers',       desc: 'From Needs Improvement to Exemplary. We define the threshold for web success.',                  icon: '📊' },
            ].map((item, i) => (
              <div key={i} className="bg-white p-6 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl border border-slate-100 shadow-lg hover:border-slate-200 hover:-translate-y-0.5 transition-all group">
                <div className="text-3xl sm:text-4xl mb-4 sm:mb-6 group-hover:scale-110 transition-transform inline-block">{item.icon}</div>
                <h3 className="text-base sm:text-xl md:text-2xl font-black text-slate-900 mb-2 sm:mb-3 tracking-tight uppercase">{item.title}</h3>
                <p className="text-slate-500 leading-relaxed text-xs sm:text-sm font-medium">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Recognition tiers dark card */}
          <div className="bg-slate-900 rounded-2xl sm:rounded-[3rem] p-6 sm:p-12 md:p-20 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-48 sm:w-64 h-48 sm:h-64 bg-white/5 rounded-full -mr-24 sm:-mr-32 -mt-24 sm:-mt-32 blur-3xl"/>
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 md:gap-16 items-start">

              <div className="space-y-6 sm:space-y-8 md:space-y-10">
                <h3 className="text-xl sm:text-3xl md:text-4xl font-black tracking-tight uppercase">Recognition Tiers</h3>
                <div className="space-y-4 sm:space-y-6">
                  {[
                    { label: 'Industry Benchmark (90%+)',   color: 'bg-emerald-500', desc: 'Leading performance. Ready for high-scale commercial traffic.' },
                    { label: 'Verified (75–89%)',            color: 'bg-blue-500',    desc: 'Strong foundation with professional optimization standards.' },
                    { label: 'Needs Optimization (60–74%)', color: 'bg-amber-500',   desc: 'Functional but losing potential revenue to UX friction.' },
                    { label: 'Revision Required (<60%)',    color: 'bg-rose-500',    desc: 'Critical gaps identified. Immediate overhaul recommended.' },
                  ].map((t, idx) => (
                    <div key={idx} className="flex items-start gap-3 sm:gap-4">
                      <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full mt-1 sm:mt-1.5 shrink-0 ${t.color}`}/>
                      <div>
                        <p className="font-black text-sm sm:text-base md:text-lg tracking-tight uppercase leading-snug">{t.label}</p>
                        <p className="text-slate-400 text-[10px] sm:text-xs md:text-sm font-medium leading-relaxed mt-0.5">{t.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 p-5 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl backdrop-blur-md">
                <p className="text-slate-200 italic mb-6 sm:mb-8 md:mb-10 text-xs sm:text-base md:text-lg leading-relaxed font-medium">
                  "VelaCore Analytics has become our primary protocol for validating developer handovers. The certificate provides a neutral ground for quality."
                </p>
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-slate-800 border-2 border-white/10 shrink-0 overflow-hidden flex items-center justify-center p-2">
                    <img src="https://velacore.site/assets/images/VelaCore-symbol-light.svg" alt="VelaCore" className="w-full h-full object-contain"/>
                  </div>
                  <div>
                    <p className="font-black text-sm sm:text-base uppercase tracking-wider">Marcus Thorne</p>
                    <p className="text-[9px] sm:text-[10px] text-slate-500 tracking-[0.2em] sm:tracking-[0.3em] uppercase font-black">CTO, Nexus Digital</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="p-6 sm:p-10 md:p-12 bg-slate-50 rounded-2xl sm:rounded-[3rem] text-center border border-slate-100">
            <h4 className="text-[10px] sm:text-sm font-black uppercase tracking-widest text-primary mb-3 sm:mb-4">Authorized Documentation</h4>
            <p className="text-[9px] sm:text-xs text-slate-400 uppercase tracking-widest leading-loose">
              Revision: 2025.04-F • Intellectual Property of VelaCore Labs<br/>
              Distribution restricted to licensed forensic auditors only.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Documentation;
