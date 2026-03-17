
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import VECPaymentModal from '../components/VECPaymentModal';
import { openPaddleCheckout, initializePaddle } from '../services/paddleService';

interface PricingViewProps {
  user?: User | null;
  onRefreshUser?: () => void;
  onBack: () => void;
}

const Pricing: React.FC<PricingViewProps> = ({ user, onRefreshUser, onBack }) => {
  const [cryptoPayment, setCryptoPayment] = useState<{ active: boolean; usd: number; domain?: string }>({ 
    active: false, 
    usd: 0 
  });

  // Handle scroll lock when modal is active
  useEffect(() => {
    if (cryptoPayment.active) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [cryptoPayment.active]);

  // Ensure Paddle is ready
  useEffect(() => {
    initializePaddle();
  }, []);
  
  const currentPlan = user ? user.tier : null;

  const handlePurchaseSingleLicense = async () => {
    if (!user) {
      alert("Please authenticate to purchase a permanent website license.");
      return;
    }
    const domain = prompt("Enter the domain for your permanent license (e.g., mysite.com):");
    if (domain && domain.trim()) {
      const confirmed = confirm(`Are you sure? This license will be PERMANENTLY locked to [${domain.trim()}]. It cannot be changed later.`);
      if (confirmed) {
        // Option A: VEC Payment
        // setCryptoPayment({ active: true, usd: 23, domain: domain.trim() });
        
        // Option B: Paddle Payment (Replace with your Lifetime Price ID)
        openPaddleCheckout('YOUR_LIFETIME_PRICE_ID', user?.email);
      }
    }
  };

  const handlePayWithVec = (usd: number) => {
    if (!user) {
      alert("Please sign in to proceed with $VEC authorization.");
      return;
    }
    setCryptoPayment({ active: true, usd });
  };

  const handleStandardPayment = (priceId: string) => {
    if (!user) {
      alert("Please sign in to secure your license.");
      return;
    }
    // Initiates the real Paddle Overlay
    openPaddleCheckout(priceId, user?.email);
  };

  const plans = [
    {
      name: "FREE",
      price: "0",
      priceId: "",
      features: ["Summary Report", "Overall Score", "1 Audit/Day", "Basic Architecture Scan"],
      cta: "GET FREE",
      popular: false
    },
    {
      name: "BASIC",
      price: "7",
      priceId: "YOUR_BASIC_PRICE_ID", // Replace with your Paddle Price ID
      features: ["Full Audit Report", "Gap Analysis", "5 Audits/Day", "PDF Export", "30-Day Archive"],
      cta: "GET BASIC",
      popular: false
    },
    {
      name: "PRO",
      price: "15",
      priceId: "YOUR_PRO_PRICE_ID", // Replace with your Paddle Price ID
      features: ["Official Certificate", "Registry Seal", "20 Audits/Day", "Path to 100% Logic", "Unlimited History", "Priority Support"],
      cta: "GET PRO",
      popular: true
    },
    {
      name: "AGENCY",
      price: "63",
      priceId: "YOUR_AGENCY_PRICE_ID", // Replace with your Paddle Price ID
      features: ["White-label Reports", "Team Access", "50+ Audits/Day", "API Access Registry", "24/7 VIP Protocol", "Elite Engine Branding"],
      cta: "GET AGENCY",
      popular: false
    }
  ];

  const comparisonData = [
    { 
      category: "Forensic Analysis",
      features: [
        { name: "Executive Summary Score", free: "✓", basic: "✓", pro: "✓", agency: "✓", single: "✓" },
        { name: "Engine Class Grading", free: "Standard", basic: "Commercial", pro: "Enterprise", agency: "Forensic", single: "Enterprise" },
        { name: "Structural Gap Analysis", free: "✕", basic: "✓", pro: "✓", agency: "✓", single: "✓" },
        { name: "Phased Action Roadmap", free: "✕", basic: "✓", pro: "✓", agency: "✓", single: "✓" },
        { name: "Path to 100% Projection", free: "✕", basic: "✕", pro: "✓", agency: "✓", single: "✓" },
        { name: "Deep Logical Scan (AI)", free: "Basic", basic: "Full", pro: "Pro", agency: "Elite", single: "Pro" },
      ]
    },
    {
      category: "Quota & Capacity",
      features: [
        { name: "Daily Audit Limit", free: "1", basic: "5", pro: "20", agency: "50+", single: "∞*" },
        { name: "Historical Archive", free: "24 Hours", basic: "30 Days", pro: "Unlimited", agency: "Unlimited", single: "Unlimited" },
        { name: "Re-Audit Capability", free: "1 / Day", basic: "5 / Day", pro: "20 / Day", agency: "50+ / Day", single: "∞ (On Domain)" },
      ]
    },
    {
      category: "Assets & Exports",
      features: [
        { name: "Official PDF Audit Report", free: "✕", basic: "✓", pro: "✓", agency: "✓", single: "✓" },
        { name: "Verification Certificate", free: "✕", basic: "✕", pro: "✓", agency: "✓", single: "✓" },
        { name: "White-Label Reports", free: "✕", basic: "✕", pro: "✕", agency: "✓", single: "✕" },
        { name: "Registry Seal Asset", free: "✕", basic: "✕", pro: "✓", agency: "✓", single: "✓" },
      ]
    }
  ];

  const CheckIcon = () => <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>;
  const CrossIcon = () => <svg className="w-4 h-4 text-slate-200 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"/></svg>;

  return (
    <>
      {cryptoPayment.active && user && (
        <VECPaymentModal 
          usdAmount={cryptoPayment.usd} 
          user={user} 
          domain={cryptoPayment.domain}
          onSuccess={() => {
            setCryptoPayment({ active: false, usd: 0 });
            if (onRefreshUser) onRefreshUser();
          }}
          onCancel={() => setCryptoPayment({ active: false, usd: 0 })}
        />
      )}

      <div className="max-w-[1440px] mx-auto py-8 sm:py-12 md:py-24 px-4 sm:px-6 md:px-10 lg:px-16 animate-in fade-in duration-500 w-full">

      <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 md:mb-24 px-4">
        <button onClick={onBack} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 text-slate-400 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.4em] mb-4 sm:mb-6 border border-slate-100 hover:text-primary transition-all">← Return to Console</button>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 text-slate-400 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.4em] mb-4 sm:mb-6 border border-slate-100">Licensing Framework</div>
        <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black text-slate-900 mb-4 sm:mb-6 tracking-tighter leading-tight">Authorize Your <br /><span className="text-slate-200 italic">Analysis Protocol.</span></h2>
      </div>

      {/* SECTION 1: MAIN PRICING CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-10 mb-20 sm:mb-24 items-stretch">
        {plans.map((plan, i) => {
          const isUserOnThisPlan = currentPlan === plan.name;
          const discountedPrice = (Number(plan.price) * 0.9).toFixed(2);
          return (
            <div key={i} className={`p-6 sm:p-8 md:p-14 rounded-[2.5rem] sm:rounded-[3.5rem] border transition-all flex flex-col relative ${plan.popular ? 'border-slate-900 ring-4 ring-slate-900/10 bg-white shadow-2xl z-10 lg:-translate-y-4' : 'border-slate-100 bg-white shadow-sm'} ${isUserOnThisPlan ? 'border-emerald-500 ring-4 ring-emerald-50' : ''}`}>
              {plan.price !== "0" && (
                <div className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 w-12 h-12 sm:w-16 sm:h-16 bg-[#D4AF37] text-primary rounded-full flex flex-col items-center justify-center font-black shadow-xl border-4 border-white rotate-12 z-20">
                  <span className="text-[7px] sm:text-[8px] leading-none">SAVE</span>
                  <span className="text-xs sm:text-sm leading-none">10%</span>
                </div>
              )}
              
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase mb-6 sm:mb-8">{plan.name}</h3>
              
              <div className="mb-8 sm:mb-10">
                <div className="flex items-baseline gap-1 sm:gap-1.5">
                  <span className="text-4xl sm:text-5xl md:text-7xl font-black text-slate-900 tracking-tighter">${plan.price}</span>
                  <span className="text-[10px] sm:text-[12px] font-bold text-slate-400 uppercase tracking-widest">/MO</span>
                </div>
                {plan.price !== "0" && (
                  <div className="mt-3 sm:mt-4 inline-block px-3 py-1.5 sm:px-4 sm:py-2 bg-emerald-50 border border-emerald-100 rounded-lg">
                    <p className="text-[9px] sm:text-[11px] font-black text-emerald-600 uppercase tracking-tight">${discountedPrice} WITH $VEC</p>
                  </div>
                )}
              </div>

              <div className="space-y-4 sm:space-y-6 mb-10 sm:mb-14 flex-1">
                {plan.features.map((f, j) => (
                  <div key={j} className="flex items-start gap-3 sm:gap-4 text-xs sm:text-sm font-bold text-slate-700">
                    <CheckIcon />
                    <span>{f}</span>
                  </div>
                ))}
              </div>

              {/* PAYMENT BUTTONS */}
              <div className="space-y-3 sm:space-y-4 w-full">
                {plan.price === "0" ? (
                  <button 
                    disabled={isUserOnThisPlan}
                    className={`w-full py-5 sm:py-6 rounded-[1.5rem] sm:rounded-[2rem] text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] transition-all shadow-xl active:scale-[0.98] ${isUserOnThisPlan ? 'bg-emerald-50 text-emerald-600' : 'bg-[#0F172A] text-white hover:bg-slate-800'}`}
                  >
                    {isUserOnThisPlan ? 'CURRENT ACTIVE' : 'GET FREE'}
                  </button>
                ) : (
                  <>
                    <button 
                      onClick={() => handleStandardPayment(plan.priceId)}
                      disabled={isUserOnThisPlan}
                      className={`w-full py-4 sm:py-5 rounded-[1.2rem] sm:rounded-[1.5rem] border-2 border-slate-100 text-primary text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.25em] hover:bg-slate-50 transition-all shadow-sm active:scale-95 ${isUserOnThisPlan ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      STANDARD CREDIT
                    </button>
                    <button 
                      onClick={() => handlePayWithVec(Number(plan.price))}
                      disabled={isUserOnThisPlan}
                      className={`w-full py-5 sm:py-6 rounded-[1.2rem] sm:rounded-[1.5rem] bg-[#0F172A] border-4 border-[#D4AF37] text-[#D4AF37] text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] hover:bg-slate-800 transition-all flex items-center justify-center gap-3 sm:gap-4 shadow-xl active:scale-95 group ${isUserOnThisPlan ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:scale-125" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                      PAY WITH $VEC
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* SECTION 2: SINGLE WEBSITE PERMANENT LICENSE */}
      <div className="mb-20 sm:mb-24 p-8 sm:p-12 md:p-16 rounded-[3rem] sm:rounded-[4.5rem] bg-[#FAF7ED] border-4 border-[#D4AF37]/30 shadow-2xl relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-64 h-64 sm:w-96 sm:h-96 bg-[#D4AF37]/10 rounded-full blur-[80px] sm:blur-[120px] -mr-20 sm:-mr-40 -mt-20 sm:-mt-40"></div>
         <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16 relative z-10">
            <div className="space-y-6 sm:space-y-10 text-center lg:text-left flex-1">
               <div className="space-y-3 sm:space-y-4">
                 <span className="text-[9px] sm:text-[11px] font-black text-[#927021] uppercase tracking-[0.4em] sm:tracking-[0.6em] bg-white/90 px-6 py-2 sm:px-8 sm:py-3 rounded-full border border-[#D4AF37]/20 shadow-sm inline-block">Special Domain Registry</span>
                 <h3 className="text-3xl sm:text-5xl md:text-8xl font-black text-slate-900 tracking-tighter leading-[0.9] sm:leading-[0.85]">Single Website <br/><span className="text-[#927021] italic">Permanent License.</span></h3>
               </div>
               <p className="text-lg sm:text-2xl text-slate-600 font-medium leading-relaxed italic max-w-2xl mx-auto lg:mx-0">Acquire a lifetime forensic audit bridge for a single domain identity. One-time dispatch. Permanent Registry status.</p>
               
               <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8 justify-center lg:justify-start">
                  <div className="flex items-center gap-4 sm:gap-5 p-4 sm:p-6 bg-primary rounded-[1.5rem] sm:rounded-[2.5rem] border-2 border-accent shadow-2xl group hover:scale-105 transition-transform">
                     <div className="w-10 h-10 sm:w-14 sm:h-14 bg-accent rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
                        <span className="text-primary text-base sm:text-xl font-black">-10%</span>
                     </div>
                     <div className="text-left">
                        <p className="text-[9px] sm:text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1 sm:mb-1.5">Loyalty Protocol</p>
                        <p className="text-xs sm:text-[15px] font-black text-white uppercase tracking-widest">Locked with $VEC Payment</p>
                     </div>
                  </div>
               </div>
            </div>

            <div className="shrink-0 flex flex-col items-center gap-8 sm:gap-10 p-8 sm:p-14 bg-white rounded-[2.5rem] sm:rounded-[4rem] shadow-2xl border border-[#D4AF37]/20 w-full lg:w-[460px]">
               <div className="text-center w-full">
                  <p className="text-[10px] sm:text-[12px] font-black text-slate-400 uppercase tracking-[0.3em] sm:tracking-[0.4em] mb-2 sm:mb-3">Lifetime Access Fee</p>
                  <div className="flex items-center justify-center gap-4 sm:gap-5">
                    <p className="text-6xl sm:text-8xl font-black text-slate-900 tracking-tighter">$23</p>
                    <div className="h-12 sm:h-16 w-[2px] bg-slate-100"></div>
                    <div className="text-left">
                       <p className="text-xl sm:text-2xl font-black text-emerald-600 tracking-tight leading-none">$20.70</p>
                       <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">WITH $VEC</p>
                    </div>
                  </div>
                  <div className="mt-8 sm:mt-10 py-3 sm:py-4 px-6 sm:px-8 bg-slate-50 border border-slate-100 rounded-2xl sm:rounded-3xl">
                     <p className="text-[9px] sm:text-[11px] font-black text-[#D4AF37] uppercase tracking-[0.2em] sm:tracking-[0.3em]">Universal Verification Asset</p>
                  </div>
               </div>
               
               <div className="w-full space-y-4 sm:space-y-5">
                 <button onClick={handlePurchaseSingleLicense} className="w-full py-5 sm:py-6 rounded-[1.5rem] sm:rounded-[2rem] bg-white border-2 border-slate-100 text-primary text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] hover:bg-slate-50 transition-all shadow-sm active:scale-95">STANDARD CREDIT</button>
                 <button onClick={() => handlePayWithVec(23)} className="w-full py-6 sm:py-7 rounded-[1.5rem] sm:rounded-[2rem] bg-[#0F172A] border-4 border-accent text-accent text-xs sm:text-sm font-black uppercase tracking-[0.2em] sm:tracking-[0.25em] hover:bg-slate-800 transition-all flex items-center justify-center gap-4 sm:gap-5 shadow-xl active:scale-95 group">
                    <svg className="w-6 h-6 sm:w-8 sm:h-8 transition-transform group-hover:scale-125" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                    PAY WITH $VEC
                 </button>
               </div>
            </div>
         </div>
      </div>
    </div>
  </>
);
};

export default Pricing;
