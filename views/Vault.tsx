
import React from 'react';
import { AuditRecord, View } from '../types';
import Logo from '../components/Logo';

interface Props {
  records: AuditRecord[];
  onSelect: (record: AuditRecord) => void;
  onBack: () => void;
}

const Vault: React.FC<Props> = ({ records, onSelect, onBack }) => {
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

  return (
    <div className="min-h-screen bg-forensicWhite py-24 px-8 animate-in">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-8">
          <div>
            <button onClick={onBack} className="text-xs font-black uppercase tracking-metadata text-slate-400 hover:text-primary mb-4 block">
              ← Command Center
            </button>
            <h1 className="text-6xl font-heading font-black uppercase tracking-tighter">
              <span className="text-slate-200 drop-shadow-sm">THE</span> <span className="text-accent">Vault</span>
            </h1>
            <p className="text-slate-500 font-body font-bold text-lg mt-2">
              Archives of Proprietary Forensic Certificates.
            </p>
          </div>
          <div className="flex items-center gap-6 px-8 py-4 bg-slate-50 rounded-[2rem] border border-slate-100">
             <div className="text-center">
               <div className="text-2xl font-heading font-black text-primary">{records.length}</div>
               <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Saved Audits</div>
             </div>
             <div className="w-px h-10 bg-slate-200"></div>
             <div className="text-center">
               <div className="text-2xl font-heading font-black text-accent">Active</div>
               <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Protocol v2.5</div>
             </div>
          </div>
        </div>

        {records.length === 0 ? (
          <div className="text-center py-32 bg-slate-50 rounded-[4rem] border-2 border-dashed border-slate-200">
             <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
             </div>
             <h3 className="text-2xl font-heading font-black uppercase text-slate-400">Vault Empty</h3>
             <p className="text-slate-400 font-bold mt-2">No audits have been archived in this session.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {records.map((record) => (
              <div 
                key={record.id}
                onClick={() => onSelect(record)}
                className="group bg-white rounded-[3rem] p-8 border border-slate-100 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all cursor-pointer overflow-hidden relative"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center overflow-hidden">
                    {getFavicon(record.data?.overview?.websiteUrl || record.url) ? (
                      <img 
                        src={getFavicon(record.data?.overview?.websiteUrl || record.url)!} 
                        alt="" 
                        className="w-8 h-8 object-contain filter group-hover:brightness-110 transition-all"
                      />
                    ) : (
                      <svg className="w-6 h-6 text-accent" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
                    )}
                  </div>
                  <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">#{record.id.slice(0, 8)}</div>
                </div>

                <div className="space-y-2 mb-8">
                  <h3 className="text-2xl font-heading font-black text-primary truncate uppercase">{(record.data?.overview?.websiteName || record.url || 'Unknown Asset').replace(/^https?:\/\//, '')}</h3>
                  <div className="inline-block px-3 py-1 bg-accent/10 text-accent text-[9px] font-black uppercase tracking-metadata rounded-full">
                    {record.industry || 'Asset'}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                   <div className="text-primary font-heading font-black text-3xl">
                     {record.data?.executiveSummary?.score ?? 0}<span className="text-accent text-sm">%</span>
                   </div>
                   <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                     {new Date(record.timestamp).toLocaleDateString()}
                   </div>
                </div>

                {/* Operator Preview */}
                {record.operatorSnapshot && (
                  <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full overflow-hidden opacity-10 group-hover:opacity-30 transition-opacity grayscale pointer-events-none">
                    <img src={record.operatorSnapshot} alt="Operator" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Vault;
