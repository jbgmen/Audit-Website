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
  const [audits,         setAudits]         = useState<AuditRecord[]>([]);
  const [isLoadingAudits,setIsLoadingAudits] = useState(true);
  const [isUpdating,     setIsUpdating]     = useState(false);
  const [name,           setName]           = useState(user.name || '');
  const [saveStatus,     setSaveStatus]     = useState<'idle'|'success'|'error'>('idle');
  const [isDownloading,  setIsDownloading]  = useState<string|null>(null);
  const [domainLicenses, setDomainLicenses] = useState<DomainLicense[]>([]);
  const [purgeTarget,    setPurgeTarget]    = useState<AuditRecord|null>(null);
  const [isDeleting,     setIsDeleting]     = useState<string|null>(null);
  const [notes,          setNotes]          = useState<Record<string,string>>({});
  const [noteOpen,       setNoteOpen]       = useState<string|null>(null);
  const [activeTab,      setActiveTab]      = useState<'audits'|'certs'|'settings'>('audits');

  useEffect(() => {
    const fetch = async () => {
      setIsLoadingAudits(true);
      try {
        const [auditData, licenseData] = await Promise.all([
          getUserAudits(user.id),
          getDomainLicenses(user.id),
        ]);
        setAudits(auditData || []);
        setDomainLicenses(licenseData || []);
      } catch (err) { console.error('Profile Fetch Error:', err); }
      finally { setIsLoadingAudits(false); }
    };
    fetch();
  }, [user.id]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true); setSaveStatus('idle');
    try {
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: name });
        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 3000);
      }
    } catch { setSaveStatus('error'); }
    finally { setIsUpdating(false); }
  };

  const executePurge = async () => {
    if (!purgeTarget) return;
    setIsDeleting(purgeTarget.id);
    try {
      await deleteAuditFromFirebase(purgeTarget.id);
      setAudits(p => p.filter(a => a.id !== purgeTarget.id));
      if (onDeleteAudit) onDeleteAudit(purgeTarget.id);
      setPurgeTarget(null);
    } catch { alert('PROTOCOL ERROR: Deletion denied.'); }
    finally { setIsDeleting(null); }
  };

  const getFavicon = (url?: string) => {
    if (!url) return null;
    try {
      const domain = url.replace(/^(https?:\/\/)?(www\.)?/,'').split('/')[0];
      return `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;
    } catch { return null; }
  };

  const tier     = user.tier || 'Free';
  const certAudits = audits.filter(a => (a.data?.executiveSummary?.score ?? 0) >= 75);

  const TIER_COLOR: Record<string, string> = {
    Free: '#6b7280', Basic: '#2563eb', Pro: '#7c3aed', Agency: '#b8860b',
  };
  const tierColor = TIER_COLOR[tier] || TIER_COLOR.Free;

  const stats = [
    { label: 'Total Audits',   value: audits.length,       icon: '🔍' },
    { label: 'Certificates',   value: certAudits.length,   icon: '🏆' },
    { label: 'Avg Score',      value: audits.length ? Math.round(audits.reduce((s,a) => s + (a.data?.executiveSummary?.score ?? 0), 0) / audits.length) + '%' : '—', icon: '📊' },
    { label: 'Plan',           value: tier,                icon: '⭐' },
  ];

  return (
    <>
      <style>{`
        .pr-tab { padding: 9px 18px; border-radius: 999px; font-size: 11px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; border: none; cursor: pointer; transition: all 0.18s; }
        .pr-tab.active { background: #0f172a; color: #fff; }
        .pr-tab.inactive { background: transparent; color: #94a3b8; }
        .pr-tab.inactive:hover { color: #0f172a; background: rgba(15,23,42,0.05); }
        .pr-card { background: #fff; border: 1px solid #f1f5f9; border-radius: 20px; transition: all 0.18s; }
        .pr-card:hover { border-color: #e2e8f0; box-shadow: 0 4px 24px rgba(15,23,42,0.06); }
        .pr-input { width: 100%; padding: 12px 18px; border-radius: 12px; border: 1.5px solid #e2e8f0; background: #f8fafc; font-size: 13px; font-weight: 600; color: #0f172a; outline: none; transition: all 0.18s; }
        .pr-input:focus { border-color: #0f172a; background: #fff; box-shadow: 0 0 0 3px rgba(15,23,42,0.06); }
        .pr-audit-row { display: flex; align-items: center; gap: 14px; padding: 14px 16px; border-radius: 14px; transition: background 0.14s; cursor: pointer; }
        .pr-audit-row:hover { background: #f8fafc; }
        @media (max-width: 640px) {
          .pr-tab { padding: 7px 13px; font-size: 9.5px; }
        }
      `}</style>

      {/* ── Purge Modal ── */}
      {purgeTarget && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#020617]/90 backdrop-blur-xl">
          <div className="w-full max-w-sm bg-white rounded-[2rem] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.5)] animate-in zoom-in duration-300">
            <div className="bg-rose-600 p-8 text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
              </div>
              <h4 className="text-white text-xl font-black uppercase tracking-tighter">Confirm Data Purge</h4>
              <p className="text-rose-100 text-[9px] font-black uppercase tracking-[0.4em] mt-1">This action is irreversible</p>
            </div>
            <div className="p-8 space-y-6">
              <p className="text-sm text-slate-500 font-medium italic leading-relaxed text-center">
                Permanently remove audit for
                <span className="block text-slate-900 font-black text-base mt-1 not-italic break-all">"{purgeTarget.data?.overview?.websiteName || purgeTarget.url}"</span>
              </p>
              <button disabled={isDeleting === purgeTarget.id} onClick={executePurge}
                className="w-full py-4 bg-rose-600 text-white text-[11px] font-black uppercase tracking-[0.3em] rounded-xl shadow-lg hover:bg-rose-700 transition-all active:scale-95 flex items-center justify-center gap-3 cursor-pointer border-0">
                {isDeleting === purgeTarget.id ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : 'Execute Purge Protocol'}
              </button>
              <button onClick={() => setPurgeTarget(null)} className="w-full py-3 text-slate-400 text-[9px] font-black uppercase tracking-widest hover:text-slate-900 transition-all bg-transparent border-0 cursor-pointer">
                Abort
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-[#fafaf8]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-8 sm:py-12 md:py-16">

          {/* ── Header ── */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 mb-8 sm:mb-12">

            {/* Left: avatar + info */}
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#0f172a] flex-shrink-0 flex items-center justify-center text-2xl sm:text-3xl font-black shadow-xl overflow-hidden border-2" style={{ borderColor: tierColor + '40' }}>
                {user.avatar
                  ? <img src={user.avatar} className="w-full h-full object-cover"
                      onError={e => { (e.target as HTMLImageElement).style.display='none'; (e.target as HTMLImageElement).parentElement!.innerHTML = `<span class="text-2xl font-black" style="color:#d4a017">${(user.name?.[0]||user.email?.[0]||'U').toUpperCase()}</span>`; }}/>
                  : <span style={{ color: '#d4a017' }}>{(user.name?.[0]||user.email?.[0]||'U').toUpperCase()}</span>
                }
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tighter leading-none">{user.name || 'Registry User'}</h1>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wide border"
                    style={{ color: tierColor, background: tierColor + '12', borderColor: tierColor + '30' }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: tierColor }}/>
                    {tier}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-400 font-medium mt-1 truncate max-w-[220px] sm:max-w-xs">{user.email}</p>
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest font-mono mt-1">ID: {user.id.slice(0,14)}…</p>
              </div>
            </div>

            {/* Right: actions */}
            <div className="flex items-center gap-3 flex-wrap">
              <button onClick={() => setView('pricing')}
                className="px-4 sm:px-5 py-2.5 rounded-xl text-[10px] sm:text-[11px] font-black uppercase tracking-wide border transition-all hover:-translate-y-0.5 cursor-pointer"
                style={{ color: tierColor, borderColor: tierColor + '40', background: tierColor + '08' }}>
                Upgrade Plan
              </button>
              <button onClick={onLogout}
                className="px-4 sm:px-5 py-2.5 rounded-xl text-[10px] sm:text-[11px] font-black uppercase tracking-wide border border-slate-200 text-slate-500 hover:border-rose-200 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer bg-transparent">
                Sign Out
              </button>
            </div>
          </div>

          {/* ── Stats row ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-10">
            {stats.map((s, i) => (
              <div key={i} className="pr-card p-4 sm:p-5 flex flex-col gap-2">
                <span className="text-xl sm:text-2xl">{s.icon}</span>
                <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tighter leading-none">{s.value}</span>
                <span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</span>
              </div>
            ))}
          </div>

          {/* ── Usage bars ── */}
          <div className="pr-card p-5 sm:p-7 mb-8 sm:mb-10">
            <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-5">Consumption Matrix</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-8">
              {[
                { label: 'Monthly Audits',      used: audits.length,       limit: tier === 'Free' ? 3 : tier === 'Basic' ? 50 : 999, barColor: '#0f172a' },
                { label: 'Active Certificates', used: certAudits.length,   limit: tier === 'Free' ? 1 : 50,                          barColor: '#d4a017' },
              ].map((item, i) => {
                const pct = item.limit >= 999 ? 100 : Math.min((item.used / item.limit) * 100, 100);
                return (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between items-center text-[9px] sm:text-[10px] font-black uppercase tracking-widest">
                      <span className="text-slate-400">{item.label}</span>
                      <span className="text-slate-700">{item.used} / {item.limit >= 999 ? '∞' : item.limit}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${pct}%`, background: item.barColor }}/>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Tabs ── */}
          <div className="flex items-center gap-2 mb-6 sm:mb-8 overflow-x-auto pb-1">
            {(['audits','certs','settings'] as const).map(tab => (
              <button key={tab} className={`pr-tab ${activeTab === tab ? 'active' : 'inactive'}`} onClick={() => setActiveTab(tab)}>
                {tab === 'audits' ? `Audits (${audits.length})` : tab === 'certs' ? `Certificates (${certAudits.length})` : 'Settings'}
              </button>
            ))}
          </div>

          {/* ── AUDITS TAB ── */}
          {activeTab === 'audits' && (
            <div className="pr-card overflow-hidden">
              {isLoadingAudits ? (
                <div className="flex items-center justify-center py-20 gap-3">
                  <div className="w-5 h-5 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin"/>
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Querying Records…</span>
                </div>
              ) : audits.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <span className="text-5xl">📭</span>
                  <p className="text-sm text-slate-400 font-medium italic">No verification records initialized.</p>
                  <button onClick={() => setView('audit')} className="mt-2 px-6 py-3 bg-[#0f172a] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all cursor-pointer border-0">
                    Run First Audit
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {audits.map((audit) => {
                    const score    = audit.data?.executiveSummary?.score ?? 0;
                    const siteName = audit.data?.overview?.websiteName || 'Unknown Asset';
                    const favicon  = getFavicon(audit.data?.overview?.websiteUrl);
                    return (
                      <React.Fragment key={audit.id}>
                        <div className={`pr-audit-row ${isDeleting === audit.id ? 'opacity-40 pointer-events-none' : ''}`}
                          onClick={() => onSelectAudit && onSelectAudit(audit)}>

                          {/* Favicon */}
                          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
                            {favicon
                              ? <img src={favicon} alt="" className="w-5 h-5 sm:w-6 sm:h-6 object-contain"/>
                              : <svg className="w-4 h-4 text-slate-200" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93V18c0-.55-.45-1-1-1s-1 .45-1 1v1.93C7.06 19.48 4 16.08 4 12c0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93z"/></svg>
                            }
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm sm:text-base font-black text-slate-900 tracking-tight truncate leading-tight">{siteName}</p>
                            <p className="text-[9px] sm:text-[10px] text-slate-400 font-mono truncate mt-0.5">{audit.url}</p>
                          </div>

                          {/* Score badge */}
                          <div className="hidden xs:flex flex-col items-end gap-1 shrink-0">
                            <span className={`text-base sm:text-lg font-black tracking-tighter ${score >= 75 ? 'text-emerald-600' : 'text-amber-500'}`}>{score}%</span>
                            <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border ${score >= 75 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                              {score >= 75 ? 'Market Ready' : 'Needs Work'}
                            </span>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1.5 shrink-0 ml-1" onClick={e => e.stopPropagation()}>
                            <button onClick={() => setNoteOpen(noteOpen === audit.id ? null : audit.id)}
                              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center transition-all cursor-pointer border-0 ${noteOpen === audit.id ? 'bg-slate-900 text-white' : 'bg-transparent text-slate-300 hover:bg-slate-100 hover:text-slate-700'}`}>
                              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                            </button>
                            <button onClick={() => setPurgeTarget(audit)}
                              className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center text-slate-200 hover:bg-rose-50 hover:text-rose-500 transition-all cursor-pointer border-0 bg-transparent">
                              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                            </button>
                            <button onClick={() => onSelectAudit && onSelectAudit(audit)}
                              className="hidden sm:flex px-3 sm:px-4 py-1.5 sm:py-2 bg-[#0f172a] text-white text-[9px] sm:text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-slate-800 transition-all cursor-pointer border-0">
                              View
                            </button>
                          </div>
                        </div>

                        {/* Note panel */}
                        {noteOpen === audit.id && (
                          <div className="px-4 sm:px-5 py-4 bg-slate-50 border-t border-slate-100">
                            <div className="flex justify-between items-center mb-3">
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Internal Note</span>
                              <button onClick={() => alert(`Note saved for ${audit.id.slice(0,8)}`)}
                                className="px-3 py-1.5 bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest rounded-lg cursor-pointer border-0 hover:bg-emerald-600 transition-all">
                                Save
                              </button>
                            </div>
                            <textarea
                              placeholder="Record client-specific comments…"
                              value={notes[audit.id] || ''}
                              onChange={e => setNotes({...notes, [audit.id]: e.target.value})}
                              className="w-full p-3 rounded-xl border-2 border-slate-200 bg-white outline-none focus:border-slate-900 text-xs font-medium resize-none"
                              rows={3}
                            />
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── CERTS TAB ── */}
          {activeTab === 'certs' && (
            <div>
              {certAudits.length === 0 ? (
                <div className="pr-card flex flex-col items-center justify-center py-20 gap-4">
                  <span className="text-5xl">🏆</span>
                  <p className="text-sm text-slate-400 font-medium italic text-center max-w-xs">Certificates are issued for audits scoring 75% or above.</p>
                  <button onClick={() => setView('audit')} className="mt-2 px-6 py-3 bg-[#0f172a] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all cursor-pointer border-0">
                    Run an Audit
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  {certAudits.map((audit) => {
                    const score    = audit.data?.executiveSummary?.score ?? 0;
                    const siteName = audit.data?.overview?.websiteName || 'Unknown';
                    const favicon  = getFavicon(audit.data?.overview?.websiteUrl);
                    return (
                      <div key={audit.id} onClick={() => onSelectAudit && onSelectAudit(audit)}
                        className="p-5 sm:p-7 rounded-[1.5rem] sm:rounded-[2rem] border-2 border-[#D4AF37]/20 bg-gradient-to-br from-[#FAF7ED]/60 to-white flex flex-col gap-5 group hover:border-[#D4AF37]/50 hover:-translate-y-0.5 transition-all shadow-sm cursor-pointer">

                        {/* Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white border border-[#D4AF37]/20 flex items-center justify-center shadow-sm overflow-hidden">
                              {favicon ? <img src={favicon} alt="" className="w-6 h-6 object-contain"/> : <Logo type="square" className="h-7 w-7"/>}
                            </div>
                            <div>
                              <p className="text-sm font-black text-slate-900 tracking-tight truncate max-w-[120px] sm:max-w-[150px]">{siteName}</p>
                              <p className="text-[8px] font-black text-[#927021] uppercase tracking-widest">Certified</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-black tracking-tighter" style={{ color: '#D4AF37' }}>{score}%</p>
                            <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">Active 2026</p>
                          </div>
                        </div>

                        {/* ID */}
                        <div className="pt-4 border-t border-[#D4AF37]/15 flex items-center justify-between">
                          <p className="text-[9px] font-black text-slate-300 uppercase font-mono tracking-widest truncate">ID: {audit.data?.auditId || audit.id.slice(0,12)}</p>
                          <span className="text-[9px] font-black text-[#927021] group-hover:underline">View Report →</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── SETTINGS TAB ── */}
          {activeTab === 'settings' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">

              {/* Identity form */}
              <div className="pr-card p-5 sm:p-7">
                <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-5 sm:mb-6">Identity Settings</p>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 block mb-2">Display Name</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} className="pr-input" placeholder="Your name"/>
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 block mb-2">Email Address</label>
                    <input type="email" value={user.email} disabled className="pr-input opacity-50" style={{ cursor: 'not-allowed' }}/>
                  </div>
                  <button type="submit" disabled={isUpdating}
                    className={`w-full py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm active:scale-[0.98] cursor-pointer border-0 ${saveStatus === 'success' ? 'bg-emerald-500 text-white' : saveStatus === 'error' ? 'bg-rose-500 text-white' : 'bg-[#0f172a] text-white hover:bg-slate-800'}`}>
                    {isUpdating ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                        Synchronizing…
                      </span>
                    ) : saveStatus === 'success' ? '✓ Protocol Updated' : saveStatus === 'error' ? '✕ Update Failed' : 'Update Identity'}
                  </button>
                </form>
              </div>

              {/* Subscription */}
              <div className="bg-[#0f172a] rounded-[1.25rem] sm:rounded-[1.5rem] p-5 sm:p-7 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-[#D4AF37]/5 rounded-full blur-3xl -mr-20 -mt-20"/>
                <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-5 relative z-10">Subscription Protocol</p>
                <div className="space-y-5 relative z-10">
                  <div>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Current Tier</p>
                    <p className="text-2xl sm:text-3xl font-black tracking-tighter uppercase" style={{ color: tierColor }}>{tier}</p>
                  </div>
                  <div className="h-px bg-white/10"/>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-white/5 border border-white/8">
                      <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Audits / mo</p>
                      <p className="text-base font-black text-white">{tier === 'Free' ? '3' : tier === 'Basic' ? '50' : '∞'}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-white/5 border border-white/8">
                      <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">PDF Export</p>
                      <p className="text-base font-black text-white">{tier === 'Free' ? 'No' : 'Yes'}</p>
                    </div>
                  </div>
                  <button onClick={() => setView('pricing')}
                    className="w-full py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer border-0 hover:-translate-y-0.5"
                    style={{ background: '#D4AF37', color: '#0f172a' }}>
                    Upgrade Plan →
                  </button>
                </div>
              </div>

              {/* Agency teaser */}
              <div className="pr-card p-5 sm:p-7 relative overflow-hidden">
                <div className="filter blur-[3px] opacity-30 pointer-events-none select-none space-y-3">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Team Protocol</p>
                  {[1,2,3].map(i => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                      <div className="w-8 h-8 rounded-full bg-slate-200"/>
                      <div className="h-3 w-24 bg-slate-200 rounded"/>
                    </div>
                  ))}
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
                  <span className="text-3xl mb-3">👥</span>
                  <p className="text-xs font-black text-slate-900 mb-1">Team Collaboration</p>
                  <span className="text-[8px] font-black text-[#927021] bg-[#D4AF37]/10 px-3 py-1 rounded-full uppercase tracking-wide border border-[#D4AF37]/20 mb-3">Agency Feature</span>
                  <button onClick={() => setView('pricing')} className="text-[9px] font-black text-slate-700 underline hover:text-slate-900 transition-colors cursor-pointer bg-transparent border-0">
                    View Agency Plan
                  </button>
                </div>
              </div>

              {/* Danger zone */}
              <div className="pr-card p-5 sm:p-7 border-rose-100/50">
                <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-5">Registry Governance</p>
                <div className="space-y-3">
                  <button onClick={() => alert('Compiling Registry Data Export…')}
                    className="w-full py-3 rounded-xl border-2 border-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest hover:border-slate-300 hover:text-slate-900 transition-all cursor-pointer bg-transparent">
                    Export All Data
                  </button>
                  <button onClick={() => { if (confirm('Deactivate account? This cannot be undone.')) {} }}
                    className="w-full py-3 rounded-xl border-2 border-rose-100 text-rose-400 text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all cursor-pointer bg-transparent">
                    Deactivate Account
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
};

export default Profile;
