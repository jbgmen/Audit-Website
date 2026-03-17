
import React, { useState, useEffect } from 'react';
import { AuditReportData, AuditRecord, AuditInput } from '../types';
import { performForensicAudit } from '../services/geminiService';
import AuditLoader from '../components/AuditLoader';

interface Props {
  onComplete: (record: AuditRecord) => void;
  onCancel: () => void;
  licensedDomains?: string[];
}

const AuditFlow: React.FC<Props> = ({ onComplete, onCancel, licensedDomains = ['google.com', 'apple.com'] }) => {
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [industry, setIndustry] = useState('Fintech');
  const [image, setImage] = useState<string | null>(null);
  const [isDomainLicensed, setIsDomainLicensed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Defensive check to ensure url is a string before calling replace
    const safeUrl = typeof url === 'string' ? url : '';
    const cleanUrl = safeUrl.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0].toLowerCase();
    setIsDomainLicensed(licensedDomains.some(d => cleanUrl === d.toLowerCase()));
  }, [url, licensedDomains]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleFinalLaunch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    // Check for API key selection for paid models
    if (window.aistudio && !(await window.aistudio.hasSelectedApiKey())) {
      await window.aistudio.openSelectKey();
      // Proceed after selection (assuming success as per guidelines)
    }
    
    setLoading(true);
    setError('');
    
    let finalUrl = url.trim();
    if (finalUrl && !/^https?:\/\//i.test(finalUrl)) finalUrl = `https://${finalUrl}`;

    try {
      const auditInput: AuditInput = {
        url: finalUrl,
        description,
        image: image || undefined
      };

      const result = await performForensicAudit(auditInput, industry);
      const record: AuditRecord = {
        id: result.auditId,
        timestamp: Date.now(),
        url: finalUrl,
        industry,
        description,
        data: result,
        operatorSnapshot: image || undefined
      };
      onComplete(record);
    } catch (err: any) {
      setError(err.message || 'Audit failed. Please verify API key and URL.');
      setLoading(false);
    }
  };

  if (loading) return <AuditLoader />;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 sm:p-8 pt-10 sm:pt-12 animate-in relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#0F172A 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
      
      <div className="w-full max-w-4xl space-y-6 md:space-y-8 relative z-10">
        <div className="text-center md:text-left mb-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="px-2">
            <button 
              onClick={onCancel} 
              className="group inline-flex items-center gap-3 text-[9px] sm:text-[10px] font-black uppercase tracking-metadata text-slate-400 hover:text-primary transition-all mb-4"
            >
              <span className="group-hover:-translate-x-1 transition-transform">←</span> Abort Protocol
            </button>
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-heading font-black uppercase tracking-tighter text-primary">
              Audit <span className="text-accent italic">Engine</span>
            </h1>
            <p className="text-slate-500 font-body font-bold text-sm md:text-lg max-w-md mt-2 mx-auto md:mx-0">
              Structural quality verification for digital heritage assets.
            </p>
          </div>
          <div className="flex gap-2 sm:gap-3 justify-center md:justify-end px-2">
             <div className="px-3 py-2 sm:px-4 sm:py-2 bg-white border border-slate-100 rounded-xl shadow-sm text-center">
                <div className="text-[7px] sm:text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Load</div>
                <div className="text-base sm:text-lg font-heading font-black text-primary">0.04s</div>
             </div>
             <div className="px-3 py-2 sm:px-4 sm:py-2 bg-white border border-slate-100 rounded-xl shadow-sm text-center">
                <div className="text-[7px] sm:text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Security</div>
                <div className="text-base sm:text-lg font-heading font-black text-emerald-500">ACTIVE</div>
             </div>
          </div>
        </div>

        <div className="bg-white p-6 sm:p-10 md:p-12 rounded-[1.5rem] sm:rounded-[2rem] shadow-[0_40px_80px_rgba(0,0,0,0.06)] border border-slate-100 text-left w-full relative overflow-hidden">
          <form onSubmit={handleFinalLaunch} className="relative z-10 space-y-6 sm:space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <div className="space-y-2.5 sm:space-y-3">
                <div className="flex justify-between items-center ml-2">
                   <label className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest">Registry Asset URL</label>
                   {isDomainLicensed && (
                     <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#FAF7ED] border border-[#D4AF37]/20 rounded-full">
                        <span className="text-[6px] sm:text-[7px] font-black text-[#927021] uppercase tracking-widest">Licensed</span>
                     </div>
                   )}
                </div>
                <input
                  required
                  type="text"
                  placeholder="example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className={`w-full px-4 py-3.5 sm:px-5 sm:py-4 rounded-xl border-2 bg-white text-slate-900 placeholder:text-slate-200 outline-none transition-all text-base sm:text-lg font-bold ${
                    isDomainLicensed ? 'border-[#D4AF37]/30 focus:border-[#D4AF37]' : 'border-slate-50 focus:border-slate-900'
                  }`}
                />
              </div>

              <div className="space-y-2.5 sm:space-y-3">
                <label className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Sector Protocol</label>
                <select 
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full px-4 py-3.5 sm:px-5 sm:py-4 bg-slate-50 border-2 border-slate-100 rounded-xl font-body font-bold text-base sm:text-lg text-primary focus:border-slate-900 focus:bg-white outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="Fintech">Fintech (High Priority)</option>
                  <option value="E-commerce">E-commerce</option>
                  <option value="SaaS">SaaS Architecture</option>
                  <option value="Health">Healthcare Systems</option>
                  <option value="Legal">Legal Compliance</option>
                </select>
              </div>
            </div>

            <div className="space-y-2.5 sm:space-y-3">
              <label className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Context (Optional)</label>
              <textarea
                placeholder="Commercial objectives, friction points..."
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3.5 sm:px-5 sm:py-4 rounded-xl border-2 border-slate-50 bg-white text-slate-900 placeholder:text-slate-200 focus:border-slate-900 outline-none transition-all resize-none text-sm sm:text-base font-bold"
              />
            </div>

            <div className="space-y-2.5 sm:space-y-3">
              <label className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Structural Capture (Optional)</label>
              <div className="relative group/upload">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full text-[8px] sm:text-[9px] text-slate-500 file:mr-3 sm:file:mr-4 file:py-1.5 sm:file:py-2 file:px-4 sm:file:px-6 file:rounded-lg file:border-0 file:text-[7px] sm:file:text-[8px] file:font-black file:bg-slate-900 file:text-white hover:file:bg-slate-800 cursor-pointer border-2 border-dashed border-slate-100 p-4 sm:p-6 rounded-xl bg-slate-50/20 transition-all uppercase tracking-widest"
                />
                {image && (
                  <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2">
                     <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg overflow-hidden border-2 border-emerald-500 shadow-lg">
                       <img src={image} className="w-full h-full object-cover" alt="" />
                     </div>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2 sm:pt-4">
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 sm:py-5 rounded-xl sm:rounded-2xl font-black text-[11px] sm:text-sm uppercase tracking-[0.25em] sm:tracking-[0.3em] text-white transition-all flex items-center justify-center gap-3 sm:gap-4 active:scale-[0.98] shadow-xl ${
                  loading ? 'bg-slate-200 cursor-not-allowed' : (isDomainLicensed ? 'bg-[#927021] hover:bg-[#7a5d1b]' : 'bg-primary hover:bg-slate-800')
                }`}
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                    <span>{isDomainLicensed ? 'Re-Audit Licensed' : 'Initiate Protocol'}</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-6 p-3 sm:p-4 bg-red-50 rounded-xl border border-red-100 flex items-center gap-2 sm:gap-3">
              <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
              <p className="text-red-600 font-bold text-[10px] sm:text-xs">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuditFlow;
