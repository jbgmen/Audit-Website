import React, { useState, useRef, useEffect } from 'react';
import Logo from './Logo';
import { View, User } from '../types';

interface Props {
  setView: (view: View) => void;
  activeView: View;
  user?: User | null;
}

const TIER_CONFIG: Record<string, { color: string; bg: string; border: string }> = {
  Free:   { color: '#6b7280', bg: 'rgba(107,114,128,0.08)',  border: 'rgba(107,114,128,0.2)'  },
  Basic:  { color: '#2563eb', bg: 'rgba(37,99,235,0.08)',    border: 'rgba(37,99,235,0.2)'    },
  Pro:    { color: '#7c3aed', bg: 'rgba(124,58,237,0.08)',   border: 'rgba(124,58,237,0.2)'   },
  Agency: { color: '#b8860b', bg: 'rgba(184,134,11,0.08)',   border: 'rgba(184,134,11,0.25)'  },
};

const RESOURCE_LINKS = [
  { id: 'docs',      label: 'Framework & Docs',  desc: 'API reference & integration guides',     icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
  { id: 'standards', label: 'Forensic Standards', desc: 'Audit methodology & scoring criteria',   icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
  { id: 'branding',  label: 'Identity Assets',    desc: 'Brand kit, logos & design tokens',       icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { id: 'privacy',   label: 'Privacy Protocol',   desc: 'Data handling & compliance docs',         icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
  { id: 'terms',     label: 'Terms of Registry',  desc: 'Service agreement & legal terms',         icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
];

const Navbar: React.FC<Props> = ({ setView, activeView, user }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  const tier      = user?.tier || 'Free';
  const tierStyle = TIER_CONFIG[tier] || TIER_CONFIG.Free;

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setDropOpen(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const go = (v: View) => { setView(v); setMenuOpen(false); setDropOpen(false); };

  const mainLinks = [
    { id: 'audit'   as View, label: 'Audit Engine' },
    { id: 'pricing' as View, label: 'Pricing'      },
    { id: 'vault'   as View, label: 'Vault'        },
  ];

  const isResActive = RESOURCE_LINKS.some(r => r.id === activeView);

  return (
    <div className={`sticky top-0 z-[60] w-full transition-all duration-200 ${
      scrolled
        ? 'bg-white/96 backdrop-blur-xl border-b border-slate-200 shadow-[0_1px_3px_rgba(15,23,42,0.06),0_8px_24px_rgba(15,23,42,0.04)]'
        : 'bg-white/98 border-b border-slate-100'
    }`}>

      {/* ── Main bar ── */}
      <nav className="flex items-center justify-between px-6 md:px-10 h-[62px] max-w-[1440px] mx-auto">

        {/* Logo + tag */}
        <div className="flex items-center gap-0 flex-shrink-0">
          <button onClick={() => go('home')} className="hover:opacity-80 transition-opacity flex-shrink-0 p-0 bg-transparent border-0 cursor-pointer">
            <Logo type="horizontal" inverse={false} className="h-10 sm:h-12 md:h-14" />
          </button>
          <div className="hidden sm:flex items-center gap-1.5 ml-4 px-2.5 py-1 rounded-[3px] border text-[8px] font-black uppercase tracking-[0.15em] text-[#b8860b] bg-[rgba(212,160,23,0.07)] border-[rgba(212,160,23,0.18)] flex-shrink-0">
            <span className="w-[5px] h-[5px] rounded-full bg-green-500 animate-pulse flex-shrink-0" />
            Protocol v2.5
          </div>
        </div>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center">
          {mainLinks.map(l => (
            <button
              key={l.id}
              onClick={() => go(l.id)}
              className={`relative px-4 py-2 text-[9px] font-black uppercase tracking-[0.22em] transition-colors duration-150 group ${
                activeView === l.id ? 'text-slate-900' : 'text-slate-400 hover:text-slate-900'
              }`}
            >
              {l.label}
              <span className={`absolute bottom-1 left-4 right-4 h-[1.5px] bg-[#d4a017] rounded-full origin-left transition-transform duration-200 ${
                activeView === l.id ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
              }`} />
            </button>
          ))}

          {/* Resources */}
          <div className="relative" ref={dropRef}>
            <button
              onClick={() => setDropOpen(!dropOpen)}
              className={`flex items-center gap-1.5 px-4 py-2 text-[9px] font-black uppercase tracking-[0.22em] transition-colors duration-150 ${
                isResActive || dropOpen ? 'text-slate-900' : 'text-slate-400 hover:text-slate-900'
              }`}
            >
              Resources
              <svg className={`w-3 h-3 transition-transform duration-200 ${dropOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 12 12">
                <path d="M2.5 4.5L6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {/* Dropdown */}
            <div className={`absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 w-72 bg-white border border-slate-200 rounded-xl shadow-[0_4px_6px_rgba(15,23,42,0.04),0_20px_48px_rgba(15,23,42,0.1)] p-1.5 transition-all duration-150 z-50 ${
              dropOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-1.5'
            }`}>
              {RESOURCE_LINKS.map((r, i) => (
                <React.Fragment key={r.id}>
                  {i === 2 && <div className="h-px bg-slate-100 my-1 mx-2"/>}
                  <button
                    onClick={() => go(r.id as View)}
                    className={`flex items-center gap-3 w-full p-2.5 rounded-lg text-left transition-colors group/item ${
                      activeView === r.id ? 'bg-slate-50' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-[7px] border flex items-center justify-center flex-shrink-0 transition-all ${
                      activeView === r.id
                        ? 'bg-slate-900 border-slate-900 text-[#d4a017]'
                        : 'bg-slate-50 border-slate-200 text-slate-400 group-hover/item:bg-slate-900 group-hover/item:border-slate-900 group-hover/item:text-[#d4a017]'
                    }`}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d={r.icon}/>
                      </svg>
                    </div>
                    <div>
                      <span className="block text-[11px] font-700 text-slate-900 font-bold">{r.label}</span>
                      <span className="block text-[10px] text-slate-400 mt-0.5">{r.desc}</span>
                    </div>
                  </button>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          {user ? (
            <>
              {/* Tier */}
              <button
                onClick={() => go('pricing')}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] border text-[9px] font-black uppercase tracking-[0.1em] transition-opacity hover:opacity-75"
                style={{ color: tierStyle.color, background: tierStyle.bg, borderColor: tierStyle.border }}
              >
                <span className="w-[5px] h-[5px] rounded-full flex-shrink-0" style={{ background: tierStyle.color }}/>
                {tier}
              </button>

              <div className="hidden sm:block w-px h-4 bg-slate-200"/>

              {/* User */}
              <button
                onClick={() => go('profile')}
                className="flex items-center gap-2.5 pl-3 pr-1.5 py-1.5 border border-slate-200 rounded-[8px] hover:bg-slate-50 hover:border-slate-300 transition-all bg-transparent cursor-pointer"
              >
                <div className="hidden md:block text-right">
                  <span className="block text-[8px] font-black text-slate-400 uppercase tracking-[0.15em] leading-none">Operator</span>
                  <span className="block text-[10px] font-bold text-slate-900 max-w-[90px] truncate mt-0.5">{user.name || user.email}</span>
                </div>
                <div className="w-7 h-7 rounded-[6px] bg-slate-900 border border-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {user.avatar
                    ? <img src={user.avatar} alt="" className="w-full h-full object-cover"/>
                    : <span className="text-[10px] font-black text-[#d4a017]">{(user.name?.[0] || user.email?.[0] || 'U').toUpperCase()}</span>
                  }
                </div>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => go('auth')}
                className="hidden sm:block px-4 py-2 border border-slate-200 rounded-[7px] text-[9px] font-black uppercase tracking-[0.14em] text-slate-500 hover:border-slate-900 hover:text-slate-900 hover:bg-slate-50 transition-all bg-transparent cursor-pointer"
              >
                Sign In
              </button>
              <div className="hidden sm:block w-px h-4 bg-slate-200"/>
            </>
          )}

          <button
            onClick={() => go('audit')}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-[7px] text-[9px] font-black uppercase tracking-[0.14em] hover:bg-slate-800 transition-all cursor-pointer border-0"
            style={{ boxShadow: '0 1px 3px rgba(15,23,42,0.2)' }}
          >
            <span style={{ color: '#d4a017', fontSize: 10 }}>◆</span>
            <span className="hidden sm:inline">Initiate Protocol</span>
            <span className="sm:hidden">Audit</span>
          </button>

          {/* Hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden flex flex-col gap-[4px] justify-center items-center w-9 h-9 border-0 bg-transparent cursor-pointer"
          >
            <span className={`block w-5 h-[1.5px] bg-slate-900 rounded-full transition-all duration-200 origin-center ${menuOpen ? 'rotate-45 translate-y-[5.5px]' : ''}`}/>
            <span className={`block w-5 h-[1.5px] bg-slate-900 rounded-full transition-all duration-200 ${menuOpen ? 'opacity-0 scale-x-0' : ''}`}/>
            <span className={`block w-5 h-[1.5px] bg-slate-900 rounded-full transition-all duration-200 origin-center ${menuOpen ? '-rotate-45 -translate-y-[5.5px]' : ''}`}/>
          </button>
        </div>
      </nav>

      {/* ── Mobile drawer ── */}
      {menuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-b border-slate-200 shadow-[0_24px_48px_rgba(15,23,42,0.1)] flex flex-col px-5 py-4 max-h-[calc(100vh-62px)] overflow-y-auto z-50">
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Core Console</p>
          {mainLinks.map(l => (
            <button key={l.id} onClick={() => go(l.id)}
              className={`flex items-center justify-between w-full px-3.5 py-3 rounded-lg text-[11px] font-bold uppercase tracking-[0.06em] mb-1 cursor-pointer border-0 transition-colors ${
                activeView === l.id ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50 bg-transparent'
              }`}>
              {l.label}
              <span style={{ color: activeView === l.id ? '#d4a017' : '#cbd5e1', fontSize: 12 }}>→</span>
            </button>
          ))}

          <div className="h-px bg-slate-100 my-3"/>
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Registry Intelligence</p>
          {RESOURCE_LINKS.map(r => (
            <button key={r.id} onClick={() => go(r.id as View)}
              className={`flex items-center justify-between w-full px-3.5 py-3 rounded-lg text-[11px] font-bold uppercase tracking-[0.06em] mb-1 cursor-pointer border-0 transition-colors ${
                activeView === r.id ? 'bg-slate-50 text-slate-900' : 'text-slate-500 hover:bg-slate-50 bg-transparent'
              }`}>
              <span className="flex items-center gap-2.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.45 }}>
                  <path d={r.icon}/>
                </svg>
                {r.label}
              </span>
              <span style={{ color: '#cbd5e1', fontSize: 12 }}>→</span>
            </button>
          ))}

          <div className="h-px bg-slate-100 my-3"/>
          {user ? (
            <button onClick={() => go('profile')} className="flex items-center justify-between w-full px-3.5 py-3 rounded-lg text-[11px] font-bold text-slate-600 hover:bg-slate-50 transition-colors mb-2 cursor-pointer border-0 bg-transparent">
              <span className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-[5px] bg-slate-900 flex items-center justify-center text-[9px] font-black" style={{ color: '#d4a017' }}>
                  {(user.name?.[0] || 'U').toUpperCase()}
                </span>
                {user.name || user.email}
              </span>
              <span className="text-[9px] font-black uppercase tracking-wide" style={{ color: tierStyle.color }}>{tier}</span>
            </button>
          ) : (
            <button onClick={() => go('auth')} className="flex items-center justify-between w-full px-3.5 py-3 rounded-lg text-[11px] font-bold text-slate-600 hover:bg-slate-50 transition-colors mb-2 cursor-pointer border-0 bg-transparent">
              Sign In <span style={{ color: '#cbd5e1', fontSize: 12 }}>→</span>
            </button>
          )}
          <button onClick={() => go('audit')} className="w-full py-3.5 bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase tracking-[0.14em] hover:bg-slate-800 transition-colors cursor-pointer border-0 mt-1">
            ◆ Initiate Forensic Protocol
          </button>
        </div>
      )}
    </div>
  );
};

export default Navbar;
