import React from 'react';
import { View } from '../types';

interface Props {
  setView: (view: View) => void;
}

const Landing: React.FC<Props> = ({ setView }) => {
  return (
    <div className="min-h-screen relative overflow-hidden bg-forensicWhite">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-10%] right-[-5%] w-[45%] h-[65%] bg-accent/5 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[60%] bg-primary/5 blur-[120px] rounded-full" />
      </div>

      {/* Hero Section */}
      <main className="container mx-auto px-6 sm:px-8 pt-12 md:pt-20 pb-20 flex flex-col lg:flex-row items-center gap-12 lg:gap-20 animate-in">
        <div className="flex-1 space-y-6 md:space-y-10 text-center lg:text-left">
          <div className="inline-flex items-center gap-3 px-5 py-2 bg-primary text-white rounded-full text-[10px] font-black uppercase tracking-metadata border border-white/10 shadow-xl mx-auto lg:mx-0">
            <span className="w-2 h-2 bg-accent rounded-full animate-ping" />
            Proprietary Forensic Protocol v2.5
          </div>
          
          <h1 className="text-4xl sm:text-6xl md:text-[100px] font-heading font-black leading-[0.9] tracking-tighter text-primary">
            Independent<br />Quality <span className="text-accent italic">Auditing</span>.
          </h1>
          
          <p className="text-slate-500 font-body text-lg md:text-2xl font-medium max-w-2xl leading-relaxed mx-auto lg:mx-0">
            Uncover digital anomalies hindering your growth with our forensic architecture scan. <span className="text-primary font-bold">Authority meets digital luxury.</span>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 pt-4 justify-center lg:justify-start">
            <button 
              onClick={() => setView('audit')}
              className="px-8 md:px-12 py-5 md:py-7 bg-primary text-white text-sm md:text-lg font-black rounded-2xl shadow-2xl shadow-primary/30 hover:-translate-y-2 active:scale-95 transition-all uppercase tracking-widest flex items-center justify-center gap-4 group"
            >
              <span>Initiate Forensic Link</span>
              <svg className="w-5 h-5 md:w-6 md:h-6 transition-transform group-hover:translate-x-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
            <button 
              onClick={() => setView('docs')}
              className="px-8 md:px-12 py-5 md:py-7 border-2 border-slateBorder text-primary text-sm md:text-lg font-black rounded-2xl hover:bg-slate-50 hover:-translate-y-1 active:scale-95 transition-all uppercase tracking-widest"
            >
              View Protocols
            </button>
          </div>
          
          <div className="flex items-center justify-center lg:justify-start gap-8 pt-8 opacity-40">
            <div className="h-px w-12 md:w-20 bg-slate-300" />
            <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Trusted by Global Audit Networks</span>
          </div>
        </div>
        
        <div className="flex-1 relative hidden lg:block">
          <div className="w-[520px] h-[580px] bg-white border border-slate-100 rounded-[2rem] shadow-[0_40px_100px_rgba(15,23,42,0.1)] relative flex flex-col items-center justify-center overflow-hidden animate-in [animation-delay:400ms]">
             <div className="absolute top-0 left-0 right-0 p-10 flex justify-between items-center border-b border-slate-50">
               <div className="text-[10px] font-black tracking-metadata uppercase text-slate-300">Case ID: #772-B</div>
               <div className="w-2 h-2 bg-green-500 rounded-full" />
             </div>

             <div className="p-16 text-center space-y-8">
                <div className="w-32 h-32 mx-auto relative">
                   <div className="absolute inset-0 bg-accent/10 rounded-[1.5rem] rotate-12 transition-transform hover:rotate-0 duration-700" />
                   <div className="absolute inset-0 bg-primary text-accent rounded-[1.5rem] flex items-center justify-center shadow-xl">
                      <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                   </div>
                </div>
                <div className="space-y-3">
                  <div className="text-primary font-heading font-black text-3xl uppercase tracking-tighter">Forensic Grade<br />Certification</div>
                  <p className="text-slate-400 font-bold text-sm tracking-wide">Validation Layer Active</p>
                </div>
                
                <div className="space-y-4 pt-4">
                  <div className="w-full h-3 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                    <div className="w-[92%] h-full bg-accent animate-[width_3s_ease-out]" />
                  </div>
                  <div className="flex justify-between font-black text-[10px] tracking-widest text-primary">
                    <span className="opacity-40 uppercase">Trust Index</span>
                    <span className="text-accent">92.4%</span>
                  </div>
                </div>
             </div>

             <div className="absolute bottom-0 left-0 right-0 h-24 bg-slate-50 border-t border-slate-100 p-8 flex items-center justify-center gap-8">
               <div className="flex gap-2">
                 {[1,2,3,4].map(i => <div key={i} className="w-1.5 h-1.5 bg-slate-200 rounded-full" />)}
               </div>
               <div className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-300">VelaCore Verification Systems</div>
             </div>
          </div>
        </div>
      </main>

      {/* Secondary Branding Strip */}
      <section className="bg-slate-50 border-y border-slateBorder py-12 md:py-20 relative z-10 mb-10 md:mb-20">
        <div className="container mx-auto px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 items-center opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
             <span className="font-heading font-black text-xl md:text-3xl text-center">AUDIT_PRO</span>
             <span className="font-heading font-black text-xl md:text-3xl text-center">VERIFY.IO</span>
             <span className="font-heading font-black text-xl md:text-3xl text-center">TRUST_NET</span>
             <span className="font-heading font-black text-xl md:text-3xl text-center">CORE_QUAL</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;