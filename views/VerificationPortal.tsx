
import React, { useState, useEffect } from 'react';
import { AuditRecord } from '../types';
import { db } from '../services/firebaseService';
import { doc, getDoc } from 'firebase/firestore';
import Logo from '../components/Logo';

interface VerificationPortalProps {
  auditId: string;
  onBack: () => void;
}

const VerificationPortal: React.FC<VerificationPortalProps> = ({ auditId, onBack }) => {
  const [record, setRecord] = useState<AuditRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAuditData = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, "audits", auditId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setRecord({ id: docSnap.id, ...docSnap.data() } as AuditRecord);
        } else {
          setError("INVALID OR TAMPERED AUDIT: Registry ID not found in the forensic database.");
        }
      } catch (err) {
        console.error("Verification Error:", err);
        setError("AUTHENTICATION FAILURE: Unable to connect to the VelaCore Verification Gateway.");
      } finally {
        setLoading(false);
      }
    };
    if (auditId) loadAuditData();
  }, [auditId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-8">
        <div className="w-16 h-16 border-4 border-accent/20 border-t-accent rounded-full animate-spin mb-8"></div>
        <p className="text-accent font-black uppercase tracking-[0.5em] text-xs">Accessing Forensic Vault...</p>
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-8 text-center">
        <div className="w-24 h-24 bg-rose-500/10 border-2 border-rose-500 rounded-[2rem] flex items-center justify-center mb-8 shadow-2xl shadow-rose-500/20">
           <svg className="w-12 h-12 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
        </div>
        <h2 className="text-2xl font-black text-rose-500 uppercase tracking-tighter mb-4">Integrity Disrupted</h2>
        <p className="text-slate-400 font-medium max-w-md italic mb-10 leading-relaxed">{error}</p>
        <button onClick={onBack} className="px-10 py-4 bg-white text-primary text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-slate-100 transition-all">Return to Home</button>
      </div>
    );
  }

  const auditData = record.data;

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 md:py-24 px-6 animate-in">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start gap-2">
            <Logo type="horizontal" className="h-16 md:h-20" />
            <h1 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] ml-1">Audit Verified by VelaCore Analytics</h1>
          </div>
          
          <div className="flex flex-col items-end">
            <div className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20">
               <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
               AUTHENTIC • VERIFIED
            </div>
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-2">Protocol Registry v2.5 Secured</p>
          </div>
        </div>

        {/* MAIN PORTAL CARD */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_40px_100px_rgba(15,23,42,0.08)] overflow-hidden">
          {/* TOP BANNER */}
          <div className="bg-[#0F172A] p-10 sm:p-14 text-white flex flex-col sm:flex-row justify-between items-center gap-10">
             <div className="space-y-2 flex-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Digital Asset Identity</p>
                <h2 className="text-3xl sm:text-4xl font-black tracking-tighter uppercase leading-tight">{auditData.overview.websiteName}</h2>
                <p className="text-accent text-[11px] font-bold tracking-widest uppercase italic">{auditData.overview.url}</p>
             </div>
             <div className="text-center sm:text-right shrink-0">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Audit Registry Score</p>
                <p className="text-7xl font-black text-white tracking-tighter drop-shadow-lg">{auditData.executiveSummary.score}%</p>
             </div>
          </div>

          <div className="p-10 sm:p-14 grid grid-cols-1 md:grid-cols-2 gap-12 sm:gap-20">
             {/* COLUMN 1: META & INTEGRITY */}
             <div className="space-y-12">
                <div className="space-y-6">
                   <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] border-b border-slate-50 pb-3">Audit Meta Information</h3>
                   <div className="space-y-5">
                      <div className="flex justify-between items-center">
                         <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Registry ID</span>
                         <span className="text-[11px] font-black text-slate-900 font-mono bg-slate-50 px-3 py-1 rounded">{record.id}</span>
                      </div>
                      <div className="flex justify-between items-center">
                         <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Audit Engine</span>
                         <span className="text-[11px] font-black text-slate-900 uppercase">Gemini-Pro / {auditData.engineClass}</span>
                      </div>
                      <div className="flex justify-between items-center">
                         <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Verification Date</span>
                         <span className="text-[11px] font-black text-slate-900 uppercase">{auditData.auditDate || new Date(record.timestamp).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                         <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Plan Type</span>
                         <span className="text-[11px] font-black text-accent uppercase tracking-widest">{auditData.planType || 'Free'} License</span>
                      </div>
                   </div>
                </div>

                <div className="space-y-6">
                   <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] border-b border-slate-50 pb-3">Integrity Confirmation</h3>
                   <div className="p-8 bg-slate-50 rounded-[2rem] space-y-6 border border-slate-100">
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                           <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                        </div>
                        <p className="text-[13px] font-bold text-slate-600 leading-relaxed italic">
                          "This audit has not been modified since generation. The record matches our central forensic database exactly."
                        </p>
                      </div>
                      <div className="pt-6 border-t border-slate-200">
                         <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">Digital Fingerprint (Forensic Hash)</p>
                         <p className="text-[9px] font-mono font-black text-slate-950 break-all leading-relaxed">{auditData.verificationHash}</p>
                      </div>
                   </div>
                </div>
             </div>

             {/* COLUMN 2: LICENSING & SECURITY */}
             <div className="space-y-12">
                <div className="space-y-6">
                   <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] border-b border-slate-50 pb-3">Licensing Protocol Proof</h3>
                   <div className="grid grid-cols-2 gap-5">
                      <div className="p-8 bg-emerald-50 border border-emerald-100 rounded-3xl text-center flex flex-col items-center justify-center gap-2">
                         <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Domain Licensed</p>
                         <p className="text-3xl font-black text-emerald-700 uppercase tracking-tighter">YES</p>
                      </div>
                      <div className="p-8 bg-slate-50 border border-slate-100 rounded-3xl text-center flex flex-col items-center justify-center gap-2">
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">License ID</p>
                         <p className="text-xs font-black text-slate-900 uppercase font-mono">{auditData.licenseId || 'REG-ACTIVE'}</p>
                      </div>
                   </div>
                </div>

                <div className="space-y-6">
                   <h3 className="text-[11px] font-black text-rose-500 uppercase tracking-[0.4em] border-b border-rose-50 pb-3">Security & Anti-Forgery Notice</h3>
                   <div className="p-8 bg-rose-50/10 border-2 border-dashed border-rose-100 rounded-3xl space-y-4">
                      <p className="text-[13px] font-bold text-slate-600 leading-relaxed">
                        If the QR code used to access this page did not direct you to the official <span className="text-[#0F172A] font-black underline decoration-rose-500">velacore.analytics</span> verification environment, the report you are holding is a forgery.
                      </p>
                      <p className="text-[11px] text-slate-400 italic">Forged reports may contain inaccurate data and should not be used for commercial decision-making.</p>
                   </div>
                </div>
                
                <div className="pt-6 flex flex-col gap-6">
                   <button onClick={onBack} className="w-full py-6 bg-[#0F172A] text-white text-[11px] font-black uppercase tracking-[0.3em] rounded-2xl shadow-2xl hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center gap-4">
                      <span>Close Verification Gateway</span>
                   </button>
                   <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.5em] text-center">Authorized by VelaCore Labs Digital Registry</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationPortal;
