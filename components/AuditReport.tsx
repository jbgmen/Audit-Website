
import React, { useState, useEffect, useCallback } from 'react';
import { AuditReportData, User, ActionStep } from '../types';
import Certificate from './Certificate';
import Logo from './Logo';
// @ts-ignore
import html2pdf from 'html2pdf.js';

interface AuditReportProps {
  data: AuditReportData;
  user: User | null;
  onLoginRequired: () => void;
  onClose: () => void;
  onUpgrade?: () => void;
}

const AuditReport: React.FC<AuditReportProps> = ({ data, user, onLoginRequired, onClose, onUpgrade }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingCert, setIsExportingCert] = useState(false);
  const [showUpgradeOverlay, setShowUpgradeOverlay] = useState(false);
  const [isSecurityBlackout, setIsSecurityBlackout] = useState(false);
  
  if (!data || !data.executiveSummary) return null;

  const isLoggedIn = !!user;
  const tier = user?.tier || 'Free';
  const score = data.executiveSummary.score;
  const verdict = data.executiveSummary.verdict;

  // --- VISUAL CAPTURE PROTECTION PROTOCOL ---
  const triggerBlackout = useCallback(() => {
    if (!isExporting && !isExportingCert) {
      setIsSecurityBlackout(true);
    }
  }, [isExporting, isExportingCert]);

  const removeBlackout = useCallback(() => {
    setIsSecurityBlackout(false);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Common screenshot shortcuts
      const isPrtSc = e.key === 'PrintScreen';
      const isMacShot = (e.metaKey && e.shiftKey && (e.key === '3' || e.key === '4'));
      const isWinShot = (e.metaKey && e.shiftKey && e.key === 'S');

      if (isPrtSc || isMacShot || isWinShot) {
        triggerBlackout();
        // Automatically remove after 2 seconds
        setTimeout(removeBlackout, 2000);
      }
    };

    window.addEventListener('blur', triggerBlackout);
    window.addEventListener('focus', removeBlackout);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('blur', triggerBlackout);
      window.removeEventListener('focus', removeBlackout);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [triggerBlackout, removeBlackout]);

  // --- ACCESS CONTROL LOGIC ---
  const hasDownloadPermission = isLoggedIn && (tier === 'Basic' || tier === 'Pro' || tier === 'Agency');

  const getScoreTierStyles = (s: number) => {
    if (s >= 90) return 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-100';
    if (s >= 75) return 'bg-blue-50 text-blue-700 border-blue-200 ring-1 ring-blue-100';
    if (s >= 60) return 'bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-100';
    return 'bg-rose-50 text-rose-700 border-rose-200 ring-1 ring-rose-100';
  };

  const getScoreRingHex = (s: number) => {
    if (s >= 90) return '#10b981';
    if (s >= 75) return '#3b82f6';
    if (s >= 60) return '#f59e0b';
    return '#f43f5e';
  };

  const handleExportFull = async () => {
    if (!isLoggedIn) {
      onLoginRequired();
      return;
    }
    if (!hasDownloadPermission) {
      setShowUpgradeOverlay(true);
      return;
    }
    
    setIsExporting(true);
    const element = document.getElementById('audit-report-container');
    if (!element) {
      setIsExporting(false);
      return;
    }
    
    window.scrollTo({ top: 0, behavior: 'instant' });
    await new Promise(resolve => setTimeout(resolve, 1200));

    const tabletWidth = 836; 
    const opt: any = {
      margin: [0, 0, 0, 0], 
      filename: `VelaCore_Forensic_Audit_${data.auditId}.pdf`,
      image: { type: 'jpeg', quality: 1.0 },
      html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff', width: tabletWidth, windowWidth: tabletWidth },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait', compress: true },
    };

    try {
      await html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error("VelaCore PDF Export Failed:", err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCertificate = async () => {
    if (!isLoggedIn) {
      onLoginRequired();
      return;
    }
    if (!hasDownloadPermission) {
      setShowUpgradeOverlay(true);
      return;
    }
    setIsExportingCert(true);
    const element = document.getElementById('official-verification-certificate');
    if (!element) {
      setIsExportingCert(false);
      return;
    }

    const certWidthPx = 800;
    const certHeightPx = 1450;
    const opt: any = {
      margin: 0,
      filename: `VelaCore_Official_Certificate_${data.auditId}.pdf`,
      image: { type: 'jpeg', quality: 1.0 },
      html2canvas: { scale: 4, useCORS: true, backgroundColor: '#FAF7ED', width: certWidthPx, height: certHeightPx, windowWidth: certWidthPx, windowHeight: certHeightPx },
      jsPDF: { unit: 'mm', format: [212, 384], orientation: 'portrait', compress: true },
    };

    try {
      await html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error("VelaCore Cert Export Failed:", err);
    } finally {
      setIsExportingCert(false);
    }
  };

  const phasedActions = data.actionPlan.reduce((acc, step) => {
    if (!acc[step.phase]) acc[step.phase] = [];
    acc[step.phase].push(step);
    return acc;
  }, {} as Record<string, ActionStep[]>);

  const phaseOrder = ['Phase 1: Fix Immediately', 'Phase 2: Improve Next', 'Phase 3: Optional Enhancements'];
  const radius = 45;
  const circumference = 2 * Math.PI * radius;

  const SecurityBlackoutOverlay = () => (
    <div className="fixed inset-0 z-[200] bg-[#020617] flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300">
      <div className="w-24 h-24 mb-10 relative">
        <div className="absolute inset-0 bg-accent/20 rounded-full animate-ping"></div>
        <div className="absolute inset-0 border-2 border-accent rounded-full flex items-center justify-center bg-primary">
          <svg className="w-10 h-10 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
          </svg>
        </div>
      </div>
      <Logo type="horizontal" inverse className="h-16 mb-8 opacity-50" />
      <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">Security Protocol <span className="text-accent italic">Active</span></h2>
      <p className="text-slate-500 font-bold uppercase tracking-[0.4em] text-[10px] mb-12">Proprietary Visual Assets Protected</p>
      <div className="max-w-md p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
        <p className="text-sm text-slate-400 font-medium leading-relaxed italic">
          "Direct visual capture and unauthorized recording of VelaCore Forensic Reports are restricted. Please use the official export protocol to generate a verified PDF document."
        </p>
      </div>
      <p className="mt-12 text-[8px] font-black text-slate-700 uppercase tracking-widest">Authorized by VelaCore Analytics Authority v2.5</p>
    </div>
  );

  const GatedOverlay = ({ type, isModal = false }: { type: 'auth' | 'upgrade', isModal?: boolean }) => {
    const isAuth = type === 'auth';
    return (
      <div className={`flex flex-col items-center justify-center z-[100] p-6 ${isModal ? 'fixed inset-0 bg-[#020617]/95 backdrop-blur-md' : 'absolute inset-0 bg-[#020617]/40'}`}>
        <div className="w-full max-w-lg bg-[#0F172A] border border-white/20 p-8 sm:p-12 rounded-[3rem] text-center shadow-[0_80px_160px_rgba(0,0,0,0.8)] animate-in zoom-in duration-500 relative ring-1 ring-white/10">
          {isModal && (
            <button onClick={() => setShowUpgradeOverlay(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          )}
          <div className="w-20 h-20 bg-accent/20 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-accent/30 shadow-[0_0_40px_rgba(212,175,55,0.2)]">
            <svg className="w-10 h-10 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
            </svg>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tighter mb-6 leading-tight">
            {isAuth ? 'Unlock Full Forensic Data' : 'Upgrade Required'}
          </h3>
          <p className="text-slate-400 font-medium text-sm mb-10 leading-relaxed">
            {isAuth 
              ? 'Authentication is required to view the complete technical roadmap and detailed insights.' 
              : 'The following forensic modules are restricted to Premium accounts. Upgrade to Basic or Pro to unlock full growth forecasts, gap analysis, and the forensic roadmap.'}
          </p>
          <button onClick={isAuth ? onLoginRequired : onUpgrade} className="w-full py-6 bg-white text-primary text-xs font-black uppercase tracking-[0.4em] rounded-2xl shadow-2xl hover:bg-accent hover:text-white transition-all active:scale-95 mb-6">
            {isAuth ? 'Login to Continue' : 'Upgrade to Basic/Pro'}
          </button>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em]">VelaCore Analytics Protocol v2.5</p>
        </div>
      </div>
    );
  };

  return (
    <div className={`w-full max-w-6xl mx-auto space-y-6 sm:space-y-12 pb-24 sm:pb-32 animate-in fade-in duration-1000 ${isExporting ? 'pdf-mode-active' : ''}`}>
      
      {isSecurityBlackout && <SecurityBlackoutOverlay />}
      {showUpgradeOverlay && <GatedOverlay type="upgrade" isModal={true} />}

      <div className="max-w-5xl mx-auto mb-6 flex flex-col sm:flex-row justify-between items-center no-print mt-8 sm:mt-12 px-6 gap-4">
        <button onClick={onClose} className="w-full sm:w-auto px-6 py-2.5 bg-primary text-white font-bold rounded-2xl hover:-translate-y-1 transition-all uppercase tracking-widest text-xs">← New Audit</button>
        {isLoggedIn && (
          <button onClick={handleExportFull} className="w-full sm:w-auto px-8 py-3.5 font-black rounded-2xl shadow-lg hover:-translate-y-1 transition-all uppercase tracking-widest text-xs bg-slate-900 text-white">
            {isExporting ? 'Exporting...' : (hasDownloadPermission ? 'Export Forensic PDF' : 'Download PDF Report')}
          </button>
        )}
      </div>

      <style>{`
        .content-gated-blur { filter: blur(12px); pointer-events: none; user-select: none; opacity: 0.5; }
        .gated-viewport-area { min-height: 500px; position: relative; overflow: hidden; }
        .fade-out-preview { mask-image: linear-gradient(to bottom, black 20%, transparent 95%); }
        .roadmap-phase-card { position: relative; padding-left: 2rem; border-left: 3px solid #F1F5F9; }
        .roadmap-phase-card::before { content: ""; position: absolute; left: -8px; top: 0; width: 13px; height: 13px; background: #D4AF37; border-radius: 50%; border: 3px solid #fff; }
      `}</style>

      <section id="audit-report-container" className="bg-white border border-slate-200 rounded-[2rem] sm:rounded-[3rem] shadow-2xl overflow-hidden mx-4 md:mx-auto relative">
        
        {/* HEADER SECTION */}
        <div className="p-6 sm:p-10 md:p-16 border-b border-slate-100 bg-white">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-10">
            <div className="flex-1 space-y-6 sm:space-y-8">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Audit Protocol</span>
                <span className="h-1 w-1 bg-slate-200 rounded-full"></span>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{isLoggedIn ? data.engineClass : "Forensic Preview"}</span>
              </div>
              <div className="space-y-3">
                <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-slate-900 tracking-tighter leading-[0.9]">{data.overview.websiteName}</h1>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Asset Integrity Assessment for Commercial Deployment</p>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className={`inline-flex px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest border ${getScoreTierStyles(score)}`}>{verdict}</div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100/50 px-5 py-2.5 rounded-full border border-slate-100">Registry ID: {isLoggedIn ? data.auditId : "VC-PREV-XXXX"}</div>
              </div>
              <div className="pt-8 border-t border-slate-100">
                <p className={`text-lg sm:text-2xl text-slate-600 font-medium leading-relaxed italic ${!isLoggedIn ? 'fade-out-preview' : ''}`}>
                  "{(!isLoggedIn) ? data.executiveSummary.summary.split('.').slice(0, 2).join('.') + '...' : data.executiveSummary.summary}"
                </p>
                {isLoggedIn && (
                  <div className="mt-8 bg-slate-900 text-white p-6 rounded-2xl border border-white/5 flex items-center gap-4">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shrink-0"></div>
                    <p className="text-sm font-black uppercase tracking-tight">{data.executiveSummary.decisionLine}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="w-full lg:w-[320px] flex justify-center shrink-0">
              <div className="bg-white p-10 rounded-[3rem] border border-slate-100 flex flex-col items-center w-full shadow-xl">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-10">Performance Index</span>
                <div className="relative w-44 h-44 flex items-center justify-center">
                  <svg className="absolute inset-0" viewBox="0 0 120 120" width="100%" height="100%" style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}>
                    <circle cx="60" cy="60" r={radius} stroke="#F1F5F9" strokeWidth="10" fill="none" />
                    <circle cx="60" cy="60" r={radius} stroke={getScoreRingHex(score)} strokeWidth="10" fill="none" strokeDasharray={circumference.toFixed(2)} strokeDashoffset={(circumference - (circumference * score) / 100).toFixed(2)} strokeLinecap="round" />
                  </svg>
                  <div className="flex items-baseline justify-center select-none relative z-10">
                    <span className={`font-black text-slate-900 tracking-tighter ${score.toString().length > 3 ? 'text-4xl' : 'text-6xl'}`}>
                      {score}
                    </span>
                    <span className="text-xl font-black text-slate-900 ml-0.5 opacity-40">%</span>
                  </div>
                </div>
                <p className="mt-10 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-8 py-3 rounded-full border border-slate-100">Verified System Score</p>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN BODY AREA */}
        <div className="transition-all duration-700">
          {/* NEW SECTION: PEER BENCHMARKING (High Value Add) - ALWAYS VISIBLE TO FREE USERS */}
          <div className="p-6 sm:p-10 md:p-16 bg-white border-b border-slate-100">
             <div className="mb-12">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-3 block">Peer Analysis Registry</span>
              <h2 className="text-2xl sm:text-5xl font-black text-slate-950 tracking-tight uppercase leading-none">Industry Benchmarking</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
               <div className="p-10 rounded-[2.5rem] bg-slate-50 border border-slate-100 flex flex-col justify-between gap-10">
                  <div className="space-y-4">
                     <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Competitive Standing</h3>
                     <p className="text-sm text-slate-500 font-medium leading-relaxed italic">Compared to other digital assets in your sector, your audit score ranks in the:</p>
                  </div>
                  <div className="flex items-baseline gap-2">
                     <span className="text-7xl font-black text-slate-950 tracking-tighter">{data.industryComparison?.percentile ?? 0}th</span>
                     <span className="text-xl font-bold text-slate-400 uppercase tracking-widest">Percentile</span>
                  </div>
                  <div className="inline-flex px-6 py-2.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-full w-fit">
                     Status: {data.industryComparison?.standing ?? "Analyzing"}
                  </div>
               </div>
               <div className="space-y-8">
                  <div className="p-8 rounded-[2rem] bg-white border border-slate-100 flex items-center justify-between">
                     <div className="space-y-1">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Industry Average</p>
                        <p className="text-lg font-black text-slate-900 uppercase tracking-tight">Standard Performance</p>
                     </div>
                     <span className="text-4xl font-black text-slate-300 tracking-tighter">{data.industryComparison?.averageScore ?? 0}%</span>
                  </div>
                  <div className="p-8 rounded-[2rem] bg-white border-2 border-accent/20 flex items-center justify-between">
                     <div className="space-y-1">
                        <p className="text-[9px] font-black text-accent uppercase tracking-widest">Top 5% Threshold</p>
                        <p className="text-lg font-black text-slate-900 uppercase tracking-tight">Market Leadership</p>
                     </div>
                     <span className="text-4xl font-black text-accent tracking-tighter">{data.industryComparison?.topFivePercentScore ?? 0}%</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium leading-relaxed px-4">
                    *Benchmarked against 10,000+ proprietary audits within the VelaCore Global Data Repository.
                  </p>
               </div>
            </div>
          </div>

          <div className="relative">
            <div className={`relative ${(!isLoggedIn || tier === 'Free') ? 'gated-viewport-area' : ''}`}>
              <div className={(!isLoggedIn || tier === 'Free') ? 'content-gated-blur' : ''}>
                {/* NEW SECTION: ROI GROWTH FORECAST (The "Money" Section) */}
                <div className="p-6 sm:p-10 md:p-16 bg-slate-950 border-b border-slate-100 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-[100px] -mr-48 -mt-48"></div>
                  <div className="mb-12 relative z-10">
                    <span className="text-[10px] font-black text-accent uppercase tracking-[0.4em] mb-3 block">Financial Impact projection</span>
                    <h2 className="text-2xl sm:text-5xl font-black text-white tracking-tight uppercase leading-none">Growth Forecast</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                     <div className="p-10 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-md flex flex-col gap-6">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estimated Lift</p>
                        <span className="text-6xl font-black text-accent tracking-tighter">+{data.roiForecast?.estimatedLift ?? "0%"}</span>
                        <p className="text-xs text-slate-300 font-medium leading-relaxed italic">Projected increase in conversion architectural efficiency.</p>
                     </div>
                     <div className="p-10 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-md flex flex-col gap-6">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Confidence Level</p>
                        <span className="text-4xl font-black text-white tracking-tight uppercase">{data.roiForecast?.confidenceLevel ?? "High"}</span>
                        <p className="text-xs text-slate-300 font-medium leading-relaxed italic">Based on historical protocol implementation accuracy.</p>
                     </div>
                     <div className="p-10 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-md flex flex-col gap-6">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Primary Driver</p>
                        <span className="text-xl font-black text-white tracking-tight leading-tight uppercase">{data.roiForecast?.primaryGrowthDriver ?? "Architecture"}</span>
                        <p className="text-xs text-slate-300 font-medium leading-relaxed italic">The core structural element yielding maximum business lift.</p>
                     </div>
                  </div>
                </div>

                {/* SECTION 1: SECTIONAL SCORING */}
                <div className="p-6 sm:p-10 md:p-16 bg-white border-b border-slate-100">
                  <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight uppercase mb-12">Forensic Sectional Scoring</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-16">
                    {data.scoreBreakdown.map((cat, i) => (
                      <div key={i} className="flex flex-col gap-6">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{cat.label}</span>
                            <span className="text-xs font-bold text-slate-600 block leading-snug">{cat.meaning}</span>
                          </div>
                          <span className="text-3xl font-black text-slate-950 tracking-tighter">{cat.score}</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full relative overflow-hidden">
                          <div className="absolute top-0 left-0 h-full bg-slate-900 rounded-full" style={{ width: `${cat.score}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SECTION 2: CRITICAL SCORE GAPS */}
                <div className="p-6 sm:p-10 md:p-16 bg-slate-50/50 border-b border-slate-100">
                  <div className="mb-12">
                    <span className="text-[10px] font-black text-rose-600 uppercase tracking-[0.4em] mb-3 block">Structural Deductions</span>
                    <h2 className="text-2xl sm:text-5xl font-black text-slate-950 tracking-tight uppercase leading-none">Critical Score Gaps</h2>
                  </div>
                  <div className="grid grid-cols-1 gap-8">
                    {data.gapBreakdown?.map((gap, i) => (
                      <div key={i} className="bg-white border border-slate-100 rounded-[2.5rem] p-8 sm:p-10 shadow-sm flex flex-col md:flex-row justify-between gap-10 hover:border-rose-200 transition-all group">
                        <div className="flex-1 space-y-6">
                          <div className="flex flex-wrap items-center gap-4">
                            <span className={`px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${gap.priority === 'Critical' ? 'bg-rose-600 text-white' : 'bg-slate-900 text-white'}`}>
                              Priority: {gap.priority}
                            </span>
                            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight uppercase">{gap.category}</h3>
                          </div>
                          <div className="space-y-3">
                            <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Forensic Evidence (The Proof)</p>
                            <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed italic border-l-4 border-rose-100 pl-6">
                              "{gap.evidence}"
                            </p>
                          </div>
                        </div>
                        <div className="shrink-0 flex flex-col items-center justify-center p-5 sm:p-6 bg-rose-50 rounded-[1.5rem] border border-rose-100 min-w-[130px] self-center md:self-auto h-fit">
                          <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest mb-1">Impact</span>
                          <span className="text-3xl font-black text-rose-600 tracking-tighter">−{gap.deduction}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SECTION: PATH TO A 100% AUDIT SCORE */}
                <div className="p-6 sm:p-10 md:p-16 bg-white border-b border-slate-100">
                  <div className="mb-12">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-3 block">Projection Intelligence</span>
                    <h2 className="text-2xl sm:text-5xl font-black text-slate-950 tracking-tight uppercase leading-none">Path to a 100% Audit Score</h2>
                  </div>
                  
                  <div className="mb-10 p-8 sm:p-12 bg-[#0F172A] rounded-[2.5rem] text-center shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
                    <p className="text-lg sm:text-2xl text-slate-200 font-medium leading-relaxed italic relative z-10">
                      "If these specific technical enhancements are fully implemented, the estimated audit score would increase from {score}% to approximately 100%."
                    </p>
                  </div>

                  <div className="space-y-6">
                    {data.pathToPerfect?.map((path, i) => (
                      <div key={i} className="p-8 sm:p-10 rounded-[2.5rem] bg-slate-50/50 border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-8 group hover:bg-white hover:border-emerald-200 transition-all">
                        <div className="flex-1 space-y-3 text-center sm:text-left">
                           <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Strategic Enhancement</span>
                           <h4 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{path.task}</h4>
                           <p className="text-sm text-slate-500 italic max-w-2xl">"{path.reason}"</p>
                        </div>
                        <div className="shrink-0 flex items-center gap-4">
                           <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest hidden sm:block">Projected Lift</span>
                           <div className="px-6 py-3 bg-emerald-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-emerald-500/20">
                              +{path.projectedImpact}%
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SECTION 3: VERIFIED STRENGTHS */}
                <div className="p-6 sm:p-10 md:p-16 bg-white border-b border-slate-100">
                  <div className="mb-12">
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.4em] mb-3 block">Structural Integrity</span>
                    <h2 className="text-2xl sm:text-5xl font-black text-slate-900 tracking-tight uppercase leading-none">Verified Assets</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {data.strengths.map((s, i) => (
                      <div key={i} className="p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm flex flex-col gap-6 hover:border-emerald-200 transition-colors">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                           </div>
                           <h4 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{s.point}</h4>
                        </div>
                        <div className="space-y-4">
                           <div>
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Strategic Impact</p>
                              <p className="text-sm font-bold text-slate-600 italic">"{s.impact}"</p>
                           </div>
                           <div>
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Business Value</p>
                              <p className="text-[13px] font-bold text-slate-900 leading-relaxed uppercase tracking-tight">{s.businessValue}</p>
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SECTION 4: FORENSIC ROADMAP */}
                <div className="p-6 sm:p-10 md:p-16 bg-slate-50/30 border-b border-slate-100">
                  <div className="mb-12">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-3 block">Technical Execution</span>
                    <h2 className="text-2xl sm:text-5xl font-black text-slate-900 tracking-tight uppercase leading-none">Forensic Roadmap</h2>
                  </div>
                  <div className="space-y-16">
                    {phaseOrder.map((phase) => phasedActions[phase] && (
                      <div key={phase} className="space-y-8">
                        <div className="flex items-center gap-6">
                          <div className="h-px bg-slate-200 flex-1"></div>
                          <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.5em] shrink-0">{phase}</h4>
                          <div className="h-px bg-slate-200 flex-1"></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {phasedActions[phase].map((step, idx) => (
                            <div key={idx} className="roadmap-phase-card bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between gap-6 hover:-translate-y-1 transition-all">
                              <div className="space-y-2">
                                <p className="text-[9px] font-black text-accent uppercase tracking-widest">Protocol Step</p>
                                <h5 className="text-lg font-black text-slate-900 tracking-tight leading-snug">{step.task}</h5>
                              </div>
                              <div className="flex justify-between items-center pt-6 border-t border-slate-50">
                                 <div className="flex items-center gap-2">
                                   <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Effort Assessment</span>
                                   <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${step.effort === 'High' ? 'bg-rose-50 text-rose-600' : step.effort === 'Medium' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                     {step.effort}
                                   </span>
                                 </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SECTION 5: CERTIFICATE VIEW */}
                <div className="p-0 bg-white pb-20">
                   <div className="w-full py-24 flex flex-col items-center">
                      <h2 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tighter uppercase mb-16">Official Verification Certificate</h2>
                      <div className="w-full">
                        <Certificate data={data} />
                      </div>
                      <div className="mt-12 px-6 w-full max-w-xl no-print">
                        <button onClick={handleExportCertificate} className="w-full flex items-center justify-center gap-4 px-10 py-6 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl transition-all bg-slate-900 text-white hover:bg-slate-800">
                          {isExportingCert ? 'Compiling Asset...' : 'Download Official Certificate'}
                        </button>
                      </div>
                   </div>
                </div>
              </div>
            </div>
            {!isLoggedIn ? (
              <GatedOverlay type="auth" />
            ) : tier === 'Free' ? (
              <GatedOverlay type="upgrade" />
            ) : null}
          </div>
        </div>

        {/* FOOTER SECTION */}
        <div className="p-10 sm:p-20 text-center border-t border-slate-100 bg-slate-50">
           <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-6">Audit Disclaimer & Registry Info</p>
           <p className="text-slate-400 leading-relaxed font-medium max-w-3xl mx-auto text-[10px]">
             This document is issued for informational purposes only. VelaCore Analytics does not provide legal advice. Audit results reflect a point-in-time snapshot.
           </p>
           <div className="pt-10">
             <p className="text-[11px] font-black text-slate-900 uppercase tracking-[0.4em]">Issued By VelaCore Analytics Authority</p>
             <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest font-mono mt-2">Hash: {isLoggedIn ? data.verificationHash : "VC-PREV-XXXX-XXXX"}</p>
           </div>
        </div>
      </section>

      {isLoggedIn && (
        <div className="flex justify-center no-print px-6">
          <button onClick={handleExportFull} disabled={isExporting} className="w-full sm:w-auto flex items-center justify-center gap-6 px-16 py-8 bg-slate-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl hover:bg-slate-800 transition-all">
            {isExporting ? 'Generating PDF...' : 'Download Full Forensic Report'}
          </button>
        </div>
      )}
    </div>
  );
};

export default AuditReport;
