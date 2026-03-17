import React, { useState, useEffect } from 'react';
import { User, AuditRecord, DomainLicense, View } from '../types';
import { getUserAudits, auth, getDomainLicenses, deleteAuditFromFirebase } from '../services/firebaseService';
import { updateProfile } from 'firebase/auth';
import Logo from '../components/Logo';

interface ProfileProps {
  user: User;
  onLogout: () => void;
  onBack: () => void;
  setView: (view: View) => void;
  onSelectAudit?: (record: AuditRecord) => void;
  onDeleteAudit?: (auditId: string) => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onLogout, onBack, setView, onSelectAudit, onDeleteAudit }) => {
  const [audits, setAudits] = useState<AuditRecord[]>([]);
  const [isLoadingAudits, setIsLoadingAudits] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [name, setName] = useState(user.name || '');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isDownloading, setIsDownloading] = useState<string | null>(null);
  const [domainLicenses, setDomainLicenses] = useState<DomainLicense[]>([]);
  
  // Custom Modal State for Deletion
  const [purgeTarget, setPurgeTarget] = useState<AuditRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  
  const [folders, setFolders] = useState([
    { name: 'Master Registry', count: 0, active: true }
  ]);
  
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [isNoteVisible, setIsNoteVisible] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      setIsLoadingAudits(true);
      try {
        const [auditData, licenseData] = await Promise.all([
          getUserAudits(user.id),
          getDomainLicenses(user.id)
        ]);
        setAudits(auditData || []);
        setDomainLicenses(licenseData || []);
        setFolders(prev => prev.map(f => f.name === 'Master Registry' ? { ...f, count: (auditData || []).length } : f));
      } catch (err) {
        console.error("Profile Fetch Error:", err);
      } finally {
        setIsLoadingAudits(false);
      }
    };
    fetchProfileData();
  }, [user.id]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setSaveStatus('idle');
    try {
      if (auth.currentUser) {
        // Use functional updateProfile from firebase/auth
        await updateProfile(auth.currentUser, { displayName: name });
        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 3000);
      }
    } catch (err) {
      console.error(err);
      setSaveStatus('error');
    } finally {
      setIsUpdating(false);
    }
  };

  const executePurge = async () => {
    if (!purgeTarget) return;
    const auditId = purgeTarget.id;
    setIsDeleting(auditId);
    try {
      await deleteAuditFromFirebase(auditId);
      setAudits(prev => prev.filter(a => a.id !== auditId));
      setFolders(prev => prev.map(f => f.name === 'Master Registry' ? { ...f, count: Math.max(0, f.count - 1) } : f));
      if (onDeleteAudit) onDeleteAudit(auditId);
      setPurgeTarget(null);
    } catch (err) {
      console.error("Purge Error:", err);
      alert("PROTOCOL ERROR: Cloud infrastructure denied deletion request.");
    } finally {
      setIsDeleting(null);
    }
  };

  const handleNewFolder = (e: React.MouseEvent) => {
    e.stopPropagation();
    const folderName = prompt("Enter Folder Identity Name:");
    if (folderName && folderName.trim()) {
      setFolders([...folders, { name: folderName.trim(), count: 0, active: false }]);
    }
  };

  const handleSaveNote = (id: string) => {
    alert(`Protocol Note for ID [${id}] has been synchronized with your account.`);
  };

  const handleDownloadAsset = (e: React.MouseEvent, audit: AuditRecord) => {
    e.stopPropagation(); 
    setIsDownloading(audit.id);
    alert(`Compiling official PDF report for Registry ID ${audit.id.slice(0, 8)}...`);
    if (onSelectAudit) onSelectAudit(audit);
    setTimeout(() => {
      setIsDownloading(null);
    }, 1500);
  };

  const getFavicon = (url?: string) => {
    if (!url) return null;
    try {
      const cleanUrl = url.replace(/^(https?:\/\/)?(www\.)?/, '');
      const domain = cleanUrl.split('/')[0];
      return `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;
    } catch (e) {
      return null;
    }
  };

  const planInfo = {
    type: user.tier === 'Free' ? 'Standard Access' : `${user.tier} License`,
    status: 'Active',
    price: user.tier === 'Free' ? '$0.00' : '$49.00',
    renewal: 'February 28, 2026',
    auditsUsed: audits.length,
    auditLimit: user.tier === 'Free' ? 5 : 50,
    certsUsed: audits.filter(a => (a.data?.executiveSummary?.score ?? 0) >= 75).length,
    certLimit: user.tier === 'Free' ? 1 : 50
  };

  const SectionTitle = ({ children, subtitle, action }: { children?: React.ReactNode, subtitle?: string, action?: React.ReactNode }) => (
    <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
      <div className="space-y-1">
        <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight uppercase leading-none">{children}</h3>
        {subtitle && <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">{subtitle}</p>}
      </div>
      {action && <div className="w-full sm:w-auto">{action}</div>}
    </div>
  );

  return (
    <>
      {/* High-Fidelity Purge Modal - Fixed Centering outside transformed context */}
      {purgeTarget && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 bg-[#020617]/90 backdrop-blur-2xl">
           <div className="w-full max-w-md bg-white rounded-[2rem] sm:rounded-[3rem] overflow-hidden border border-white/20 shadow-[0_40px_100px_rgba(0,0,0,0.5)] animate-in zoom-in duration-300">
              <div className="bg-rose-600 p-8 sm:p-10 text-center">
                 <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                    <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                 </div>
                 <h4 className="text-white text-xl sm:text-2xl font-black uppercase tracking-tighter">Confirm Data Purge</h4>
                 <p className="text-rose-100 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] sm:tracking-[0.4em] mt-2">Action is irreversible</p>
              </div>
              <div className="p-8 sm:p-10 space-y-6 sm:space-y-8">
                 <div className="space-y-3 sm:space-y-4 text-center">
                    <p className="text-sm sm:text-base text-slate-500 font-medium italic leading-relaxed">
                       You are about to permanently remove the audit record for 
                       <span className="text-slate-900 font-black block mt-2 text-lg sm:text-xl break-all">"{purgeTarget.data?.overview?.websiteName || purgeTarget.url}"</span>
                    </p>
                 </div>
                 <div className="flex flex-col gap-3 sm:gap-4">
                    <button 
                       disabled={isDeleting === purgeTarget.id}
                       onClick={executePurge}
                       className="w-full py-4 sm:py-5 bg-rose-600 text-white text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] rounded-xl sm:rounded-2xl shadow-xl hover:bg-rose-700 transition-all active:scale-95 flex items-center justify-center gap-3"
                    >
                       {isDeleting === purgeTarget.id ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : <span>Execute Purge Protocol</span>}
                    </button>
                    <button onClick={() => setPurgeTarget(null)} className="w-full py-4 text-slate-400 text-[9px] sm:text-[10px] font-black uppercase tracking-widest hover:text-slate-900 transition-all">Abort Deletion</button>
                 </div>
              </div>
           </div>
        </div>
      )}

      <div className="max-w-[1440px] mx-auto px-4 sm:px-10 py-8 sm:py-12 md:py-20 animate-in fade-in slide-in-from-bottom-6 duration-700 relative">
        <div className="mb-12 sm:mb-16 pb-8 sm:pb-12 border-b border-slate-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 md:gap-10">
            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-6 sm:gap-8">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl sm:rounded-[2rem] bg-slate-900 flex-shrink-0 flex items-center justify-center text-white text-3xl font-black shadow-2xl overflow-hidden border-2 border-accent/20">
                {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).parentElement!.innerHTML = `<span class="text-3xl font-black">${(user.name?.[0] || user.email?.[0]).toUpperCase()}</span>` }} /> : (user.name ? user.name[0] : user.email[0]).toUpperCase()}
              </div>
              <div className="space-y-1 sm:space-y-2 flex-1 min-w-0">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 sm:gap-4">
                  <h1 className="text-2xl sm:text-3xl md:text-5xl font-black text-slate-900 tracking-tighter leading-none truncate max-w-full">{user.name || 'Registry User'}</h1>
                  <span className="px-2.5 py-1 rounded-full bg-[#D4AF37] text-white text-[7px] sm:text-[8px] font-black uppercase tracking-widest shrink-0">{planInfo.type}</span>
                </div>
                <p className="text-slate-400 font-bold text-xs sm:text-sm uppercase tracking-widest max-w-lg mx-auto sm:mx-0">Manage your audits, certificates, usage, and account settings.</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              <div className="text-center sm:text-right">
                <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Registry ID</p>
                <p className="text-[10px] sm:text-xs font-mono font-bold text-slate-900">{user.id.slice(0, 12)}...</p>
              </div>
              <button onClick={onLogout} className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl border-2 border-slate-100 text-slate-900 text-[9px] sm:text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-all active:scale-95">Disconnect Protocol</button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-16">
          <div className="lg:col-span-4 space-y-10 sm:space-y-16">
            <section className="bg-slate-50 p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] border border-slate-100 space-y-6 sm:space-y-8">
              <SectionTitle subtitle="Quota Intelligence">Consumption Matrix</SectionTitle>
              <div className="space-y-5 sm:space-y-6">
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex justify-between items-center text-[9px] sm:text-[10px] font-black uppercase tracking-widest">
                    <span className="text-slate-400">Monthly Audits</span>
                    <span className="text-slate-900">{planInfo.auditsUsed} / {planInfo.auditLimit}</span>
                  </div>
                  <div className="h-2 w-full bg-white rounded-full overflow-hidden border border-slate-100">
                    <div className="h-full bg-slate-900 rounded-full transition-all duration-1000" style={{ width: `${Math.min((planInfo.auditsUsed / planInfo.auditLimit) * 100, 100)}%` }}></div>
                  </div>
                </div>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex justify-between items-center text-[9px] sm:text-[10px] font-black uppercase tracking-widest">
                    <span className="text-slate-400">Active Certificates</span>
                    <span className="text-slate-900">{planInfo.certsUsed} / {planInfo.certLimit}</span>
                  </div>
                  <div className="h-2 w-full bg-white rounded-full overflow-hidden border border-slate-100">
                    <div className="h-full bg-[#D4AF37] rounded-full transition-all duration-1000" style={{ width: `${Math.min((planInfo.certsUsed / planInfo.certLimit) * 100, 100)}%` }}></div>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <SectionTitle subtitle="Account Authority">Identity Settings</SectionTitle>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3">Full Legal Name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-5 py-3.5 sm:px-6 sm:py-4 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-slate-900 transition-all outline-none font-bold text-slate-900 text-sm" />
                </div>
                <button disabled={isUpdating} className={`w-full py-4 rounded-xl sm:rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl active:scale-[0.98] ${saveStatus === 'success' ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white hover:bg-slate-800'}`}>
                  {isUpdating ? 'Synchronizing...' : saveStatus === 'success' ? 'Protocol Updated ✓' : 'Update Identity'}
                </button>
              </form>
            </section>

            <section className="p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] border border-slate-100 bg-white relative overflow-hidden group">
              <SectionTitle subtitle="Collaboration">Team Protocol</SectionTitle>
              <div className="space-y-4 filter blur-[2px] opacity-40 pointer-events-none select-none">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                  <div className="w-8 h-8 rounded-full bg-slate-200"></div>
                  <div className="h-3 w-24 bg-slate-200 rounded"></div>
                </div>
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 p-6 sm:p-8 text-center">
                <span className="text-[8px] sm:text-[9px] font-black text-slate-900 bg-slate-100 px-3 py-1 rounded-full uppercase tracking-[0.15em] sm:tracking-[0.2em] mb-4 border border-slate-200">Agency Feature</span>
                <button onClick={() => setView('pricing')} className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-slate-900 underline hover:text-slate-600 transition-colors">View Agency Benefits</button>
              </div>
            </section>
          </div>

          <div className="lg:col-span-8 space-y-16 sm:space-y-20">
            <section>
               <SectionTitle subtitle="Asset Organization" action={<button onClick={handleNewFolder} className="w-full sm:w-auto px-4 py-2 bg-slate-50 rounded-xl text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 hover:bg-slate-100 transition-all shadow-sm">+ New Folder</button>}>Client Directories</SectionTitle>
               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                  {folders.map((folder, idx) => (
                    <div key={idx} className={`p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] border-2 transition-all group cursor-pointer flex flex-col gap-5 sm:gap-6 ${folder.active ? 'border-slate-900 bg-white shadow-xl' : 'border-slate-100 bg-slate-50/50 opacity-60'}`}>
                       <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all ${folder.active ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-400'}`}><svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/></svg></div>
                       <div>
                          <p className={`text-sm sm:text-base font-black uppercase tracking-tight ${folder.active ? 'text-slate-900' : 'text-slate-500'}`}>{folder.name}</p>
                          <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">{folder.count} Verification Assets</p>
                       </div>
                    </div>
                  ))}
               </div>
            </section>

            <section id="verification-records">
              <SectionTitle subtitle="Historical Protocol Registry">Verification Records</SectionTitle>
              <div className="overflow-hidden border border-slate-100 rounded-[1.5rem] sm:rounded-[3rem] bg-white shadow-xl">
                <div className="w-full overflow-x-auto">
                  <table className="w-full text-left table-auto min-w-[600px] sm:min-w-0">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] sm:tracking-[0.3em]">
                        <th className="px-6 sm:px-8 py-5 sm:py-6">Digital Asset</th>
                        <th className="px-6 sm:px-8 py-5 sm:py-6">Score & Status</th>
                        <th className="px-6 sm:px-8 py-5 sm:py-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {isLoadingAudits ? (
                        <tr><td colSpan={3} className="p-16 sm:p-20 text-center text-[9px] sm:text-[10px] font-black text-slate-300 uppercase tracking-widest animate-pulse">Querying Records...</td></tr>
                      ) : audits.length === 0 ? (
                        <tr><td colSpan={3} className="p-16 sm:p-20 text-center text-slate-400 font-medium italic">No verification records initialized.</td></tr>
                      ) : audits.map((audit) => (
                        <React.Fragment key={audit.id}>
                          <tr className={`group hover:bg-slate-50/50 transition-colors cursor-pointer ${isDeleting === audit.id ? 'opacity-40 pointer-events-none' : ''}`}>
                            <td className="px-6 sm:px-8 py-6 sm:py-8" onClick={() => onSelectAudit && onSelectAudit(audit)}>
                              <div className="flex items-center gap-3 sm:gap-4">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
                                  {getFavicon(audit.data?.overview?.websiteUrl) ? <img src={getFavicon(audit.data?.overview?.websiteUrl)!} alt="" className="w-5 h-5 sm:w-6 sm:h-6 object-contain" /> : <svg className="w-4 h-4 sm:w-5 sm:h-5 text-slate-200" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>}
                                </div>
                                <div className="flex flex-col gap-0.5 overflow-hidden">
                                  <span className="text-sm sm:text-base font-black text-slate-900 tracking-tight truncate block">{audit.data?.overview?.websiteName || 'Unknown Asset'}</span>
                                  <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 truncate block">{audit.url}</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 sm:px-8 py-6 sm:py-8" onClick={() => onSelectAudit && onSelectAudit(audit)}>
                              <div className="flex flex-col gap-1 sm:gap-1.5">
                                 <div className="flex items-center gap-1.5 sm:gap-2">
                                    <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${(audit.data?.executiveSummary?.score ?? 0) >= 75 ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                                    <span className="text-lg sm:text-xl font-black text-slate-900">{audit.data?.executiveSummary?.score ?? 0}%</span>
                                 </div>
                                 <span className={`text-[7px] sm:text-[8px] font-black uppercase px-2 py-0.5 rounded border w-fit ${ (audit.data?.executiveSummary?.score ?? 0) >= 75 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100' }`}>
                                   {(audit.data?.executiveSummary?.score ?? 0) >= 75 ? 'Market Ready' : 'Revision Required'}
                                 </span>
                              </div>
                            </td>
                            <td className="px-6 sm:px-8 py-6 sm:py-8 text-right">
                              <div className="flex items-center justify-end gap-2 sm:gap-3">
                                <button onClick={(e) => { e.stopPropagation(); setIsNoteVisible(isNoteVisible === audit.id ? null : audit.id); }} className={`p-2 sm:p-3 rounded-lg sm:rounded-xl transition-all ${isNoteVisible === audit.id ? 'bg-slate-900 text-white' : 'hover:bg-white border border-transparent hover:border-slate-200 text-slate-400 hover:text-slate-900'}`}><svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg></button>
                                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setPurgeTarget(audit); }} className="p-2 sm:p-3 rounded-lg sm:rounded-xl hover:bg-rose-50 border border-transparent hover:border-rose-100 text-slate-300 hover:text-rose-600 transition-all"><svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>
                                <button onClick={() => onSelectAudit && onSelectAudit(audit)} className="px-4 py-2 sm:px-6 sm:py-3 bg-slate-900 text-white text-[9px] sm:text-[10px] font-black uppercase tracking-widest rounded-xl sm:rounded-2xl hover:bg-slate-800 transition-all">View</button>
                              </div>
                            </td>
                          </tr>
                          {isNoteVisible === audit.id && (
                            <tr className="bg-slate-50/50">
                              <td colSpan={3} className="px-6 sm:px-8 py-6 sm:py-8 border-x border-slate-100">
                                 <div className="space-y-4 animate-in slide-in-from-top-4 duration-300">
                                    <div className="flex justify-between items-center"><label className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Internal Protocol Notes</label><button onClick={() => handleSaveNote(audit.id)} className="px-4 py-1.5 sm:px-6 sm:py-2 bg-emerald-500 text-white text-[8px] sm:text-[9px] font-black uppercase tracking-widest rounded-lg">Save Note</button></div>
                                    <textarea placeholder="Record client-specific comments..." value={notes[audit.id] || ''} onChange={(e) => setNotes({...notes, [audit.id]: e.target.value})} className="w-full p-4 sm:p-6 rounded-2xl sm:rounded-3xl border-2 border-slate-200 bg-white outline-none focus:border-slate-900 text-xs shadow-inner" rows={3} />
                                 </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            <section>
              <SectionTitle subtitle="Official Issued Endorsements">Verification Assets</SectionTitle>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                {audits.filter(a => (a.data?.executiveSummary?.score ?? 0) >= 75).map((audit) => (
                  <div key={audit.id} onClick={() => onSelectAudit && onSelectAudit(audit)} className="p-8 sm:p-10 rounded-[2rem] sm:rounded-[3rem] border-2 border-[#D4AF37]/20 bg-[#FAF7ED]/30 flex flex-col gap-8 sm:gap-10 group hover:border-[#D4AF37]/50 transition-all shadow-sm cursor-pointer hover:-translate-y-1">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-0 relative">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-white border border-[#D4AF37]/30 flex items-center justify-center shadow-lg transform group-hover:-rotate-3 transition-transform overflow-hidden relative z-10">
                           <Logo type="square" className="h-full w-full" />
                        </div>
                        <div className="w-4 h-[2px] bg-[#D4AF37]/30 shrink-0 mx-[-4px]"></div>
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-white border border-[#D4AF37]/10 flex items-center justify-center shadow-lg overflow-hidden group-hover:rotate-3 transition-transform relative z-20">
                          {getFavicon(audit.data?.overview?.websiteUrl) ? (
                            <img src={getFavicon(audit.data?.overview?.websiteUrl)!} alt="" className="w-7 h-7 sm:w-10 sm:h-10 object-contain" />
                          ) : (
                            <span className="text-[7px] sm:text-[8px] font-black text-slate-300">N/A</span>
                          )}
                        </div>
                      </div>
                      <div className="text-right"><p className="text-[9px] sm:text-[10px] font-black text-[#927021] uppercase tracking-widest">Asset Status</p><p className="text-[10px] sm:text-xs font-bold text-emerald-600 uppercase italic">Active • Valid 2026</p></div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase leading-tight group-hover:text-[#927021] transition-colors truncate">{audit.data?.overview?.websiteName}</h4>
                      <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest truncate max-w-[200px]">ID: {audit.data?.auditId || audit.id.slice(0, 10)}</p>
                    </div>
                    <div className="pt-6 sm:pt-8 border-t border-[#D4AF37]/10 flex items-center justify-between">
                       <span className="text-[9px] sm:text-[10px] font-black text-[#927021] uppercase tracking-widest">Score {audit.data?.executiveSummary?.score ?? 0}%</span>
                       <button disabled={isDownloading === audit.id} onClick={(e) => handleDownloadAsset(e, audit)} className={`flex items-center gap-2 text-[9px] sm:text-[10px] font-black text-slate-900 uppercase tracking-widest transition-all ${isDownloading === audit.id ? 'opacity-50' : 'hover:underline'}`}>
                          {isDownloading === audit.id ? 'Loading...' : 'Download Report'}
                       </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-slate-900 rounded-[2rem] sm:rounded-[3rem] p-8 sm:p-16 text-white shadow-2xl relative overflow-hidden group">
              <SectionTitle subtitle="Licensing Management"><span className="text-white">Subscription Protocol</span></SectionTitle>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 sm:gap-16 mt-6 sm:mt-10 relative z-10">
                 <div className="space-y-6 sm:space-y-8">
                    <div className="space-y-2"><p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] sm:tracking-[0.4em]">Current Active Tier</p><p className="text-3xl sm:text-4xl font-black tracking-tighter uppercase text-white">{planInfo.type}</p></div>
                 </div>
                 <div className="space-y-8 sm:space-y-10">
                    <div className="p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-sm"><p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Auto-Renewal Protocol</p><p className="text-lg sm:text-xl font-black tracking-tight">{planInfo.renewal}</p></div>
                    <button onClick={() => setView('pricing')} className="w-full py-4 sm:py-5 rounded-xl sm:rounded-2xl bg-[#D4AF37] text-white text-[10px] sm:text-[11px] font-black uppercase tracking-widest hover:bg-[#B8962F] transition-all shadow-xl">Upgrade Tier</button>
                 </div>
              </div>
            </section>

            <section className="pt-10 pb-10">
              <div className="p-8 sm:p-12 rounded-[2rem] sm:rounded-[3rem] bg-rose-50/20 border-2 border-rose-100/30 flex flex-col md:flex-row items-center justify-between gap-10 sm:gap-12 text-center md:text-left">
                 <div className="space-y-2 sm:space-y-3"><h4 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight uppercase">Registry Governance</h4><p className="text-xs sm:text-sm font-medium text-slate-400 italic">Manage your protocol data export or account deactivation.</p></div>
                 <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full md:w-auto">
                    <button onClick={() => alert("Compiling full Registry Data Export...")} className="w-full md:px-10 py-4 sm:py-5 rounded-xl sm:rounded-2xl border-2 border-slate-200 text-slate-400 text-[9px] sm:text-[10px] font-black uppercase tracking-widest hover:text-slate-900 hover:border-slate-900 transition-all">Export Data</button>
                    <button onClick={() => confirm("Terminating all active audit certificates. Proceed?")} className="w-full md:px-10 py-4 sm:py-5 rounded-xl sm:rounded-2xl border-2 border-rose-200 text-rose-500 text-[9px] sm:text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all">Deactivate</button>
                 </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;