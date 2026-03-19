import React, { useState, useRef, useEffect } from 'react';
import Logo from './Logo';
import { View, User } from '../types';

interface Props {
  setView: (view: View) => void;
  activeView: View;
  user?: User | null;
}

const NB_TIER: Record<string, { color: string; bg: string; border: string }> = {
  Free:   { color: '#6b7280', bg: 'rgba(107,114,128,0.08)', border: 'rgba(107,114,128,0.2)' },
  Basic:  { color: '#2563eb', bg: 'rgba(37,99,235,0.08)',   border: 'rgba(37,99,235,0.2)'   },
  Pro:    { color: '#7c3aed', bg: 'rgba(124,58,237,0.08)',  border: 'rgba(124,58,237,0.2)'  },
  Agency: { color: '#b8860b', bg: 'rgba(184,134,11,0.08)',  border: 'rgba(184,134,11,0.25)' },
};

const NB_RESOURCES = [
  { id: 'docs',      label: 'Framework & Docs',  desc: 'API reference & integration guides',   icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
  { id: 'standards', label: 'Forensic Standards', desc: 'Audit methodology & scoring criteria', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
  { id: 'branding',  label: 'Identity Assets',    desc: 'Brand kit, logos & design tokens',     icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { id: 'privacy',   label: 'Privacy Protocol',   desc: 'Data handling & compliance docs',       icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
  { id: 'terms',     label: 'Terms of Registry',  desc: 'Service agreement & legal terms',       icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
];

const NB_MAIN = [
  { id: 'audit'   as View, label: 'Audit Engine', shortcut: '⌘A' },
  { id: 'pricing' as View, label: 'Pricing',      shortcut: '⌘P' },
  { id: 'vault'   as View, label: 'Vault',         shortcut: '⌘V' },
];

const Navbar: React.FC<Props> = ({ setView, activeView, user }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hovered,  setHovered]  = useState<string | null>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  const tier      = user?.tier || 'Free';
  const tierStyle = NB_TIER[tier] || NB_TIER.Free;
  const isResActive = NB_RESOURCES.some(r => r.id === activeView);

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

  // Keyboard shortcuts
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        if (e.key === 'a') { e.preventDefault(); go('audit'); }
        if (e.key === 'p') { e.preventDefault(); go('pricing'); }
        if (e.key === 'v') { e.preventDefault(); go('vault'); }
      }
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, []);

  const go = (v: View) => { setView(v); setMenuOpen(false); setDropOpen(false); };

  return (
    <>
      <style>{`
        /* ── Custom pointer cursor everywhere ── */
        *, *::before, *::after { cursor: default; }
        a, button, [role="button"], select,
        label[for], input[type="checkbox"], input[type="radio"],
        input[type="submit"], input[type="reset"],
        [tabindex]:not([tabindex="-1"]) {
          cursor: pointer !important;
        }
        input[type="text"], input[type="email"], input[type="password"],
        input[type="search"], input[type="url"], input[type="number"],
        textarea, [contenteditable] {
          cursor: text !important;
        }

        /* ── Navbar specific ── */
        .nb-root {
          position: sticky; top: 0; z-index: 60; width: 100%;
        }

        /* Top accent bar */
        .nb-accent-bar {
          height: 2px;
          background: linear-gradient(90deg, transparent 0%, #d4a017 30%, #f59e0b 50%, #d4a017 70%, transparent 100%);
          opacity: 0;
          transition: opacity 0.3s;
        }
        .nb-root.scrolled .nb-accent-bar { opacity: 1; }

        .nb-inner {
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 40px; height: 60px;
          max-width: 1440px; margin: 0 auto;
          transition: height 0.2s;
        }
        .nb-root.scrolled .nb-inner { height: 56px; }

        /* ── Left: logo + index tag ── */
        .nb-left { display: flex; align-items: center; gap: 0; flex-shrink: 0; }
        .nb-index-tag {
          display: flex; align-items: center; gap: 6px;
          margin-left: 16px; padding: 3px 8px;
          border-left: 2px solid #d4a017;
          font-size: 8.5px; font-weight: 900; letter-spacing: 0.18em;
          text-transform: uppercase; color: #94a3b8; line-height: 1;
        }
        .nb-index-tag strong { color: #0f172a; }
        .nb-pulse { width: 5px; height: 5px; border-radius: 50%; background: #22c55e; flex-shrink: 0; animation: nbPulse 2s ease-in-out infinite; }
        @keyframes nbPulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.8)} }

        /* ── Center: nav links ── */
        .nb-center { display: flex; align-items: center; }

        .nb-link {
          position: relative; display: flex; align-items: center; gap: 6px;
          padding: 6px 14px; border-radius: 0;
          font-size: 9px; font-weight: 900; letter-spacing: 0.2em; text-transform: uppercase;
          color: #94a3b8; background: none; border: none;
          transition: color 0.15s; white-space: nowrap;
        }
        .nb-link:hover, .nb-link.active { color: #0f172a; }

        /* Animated underline */
        .nb-link-line {
          position: absolute; bottom: 0; left: 14px; right: 14px; height: 1px;
          background: #d4a017;
          transform: scaleX(0); transform-origin: left;
          transition: transform 0.2s cubic-bezier(0.4,0,0.2,1);
        }
        .nb-link:hover .nb-link-line, .nb-link.active .nb-link-line { transform: scaleX(1); }

        /* Keyboard shortcut badge */
        .nb-shortcut {
          font-size: 8px; font-weight: 700; letter-spacing: 0.04em;
          color: #cbd5e1; background: #f1f5f9; border: 1px solid #e2e8f0;
          border-radius: 3px; padding: 1px 4px; font-family: monospace;
          opacity: 0; transition: opacity 0.15s;
        }
        .nb-link:hover .nb-shortcut { opacity: 1; }

        /* Divider */
        .nb-div { width: 1px; height: 14px; background: #e2e8f0; margin: 0 4px; }

        /* ── Resources dropdown ── */
        .nb-res-btn {
          display: flex; align-items: center; gap: 5px;
          padding: 6px 14px; font-size: 9px; font-weight: 900;
          letter-spacing: 0.2em; text-transform: uppercase;
          color: #94a3b8; background: none; border: none;
          transition: color 0.15s;
        }
        .nb-res-btn:hover, .nb-res-btn.active { color: #0f172a; }
        .nb-chevron { transition: transform 0.2s; }
        .nb-chevron.open { transform: rotate(180deg); }

        .nb-drop {
          position: absolute; top: calc(100% + 6px); left: 50%;
          transform: translateX(-50%) translateY(-4px);
          width: 288px;
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          box-shadow: 0 0 0 1px rgba(15,23,42,0.04), 0 8px 16px rgba(15,23,42,0.06), 0 24px 48px rgba(15,23,42,0.08);
          padding: 6px;
          opacity: 0; visibility: hidden;
          transition: all 0.15s cubic-bezier(0.4,0,0.2,1);
          z-index: 100;
        }
        .nb-drop.open {
          opacity: 1; visibility: visible; transform: translateX(-50%) translateY(0);
        }
        .nb-drop-item {
          display: flex; align-items: center; gap: 10px;
          padding: 8px 10px; border-radius: 7px; width: 100%;
          background: none; border: none; text-align: left;
          transition: background 0.12s;
        }
        .nb-drop-item:hover, .nb-drop-item.active { background: #f8fafc; }
        .nb-drop-icon {
          width: 32px; height: 32px; border-radius: 7px; flex-shrink: 0;
          border: 1px solid #e2e8f0; background: #f8fafc;
          display: flex; align-items: center; justify-content: center;
          color: #94a3b8; transition: all 0.12s;
        }
        .nb-drop-item:hover .nb-drop-icon, .nb-drop-item.active .nb-drop-icon {
          background: #0f172a; border-color: #0f172a; color: #d4a017;
        }
        .nb-drop-label { font-size: 11.5px; font-weight: 700; color: #0f172a; display: block; }
        .nb-drop-desc  { font-size: 10px; color: #94a3b8; display: block; margin-top: 1px; line-height: 1.4; }
        .nb-drop-sep   { height: 1px; background: #f1f5f9; margin: 4px 4px; }

        /* ── Right ── */
        .nb-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }

        .nb-tier-badge {
          display: flex; align-items: center; gap: 5px;
          padding: 3px 9px; border-radius: 3px; border: 1px solid;
          font-size: 8.5px; font-weight: 900; letter-spacing: 0.1em;
          text-transform: uppercase; background: none;
          transition: opacity 0.15s;
        }
        .nb-tier-badge:hover { opacity: 0.7; }

        .nb-user-btn {
          display: flex; align-items: center; gap: 8px;
          padding: 4px 6px 4px 10px;
          border: 1px solid #e2e8f0; border-radius: 8px;
          background: transparent; transition: all 0.15s;
        }
        .nb-user-btn:hover { background: #f8fafc; border-color: #cbd5e1; }
        .nb-user-meta { text-align: right; }
        .nb-user-role { display: block; font-size: 7.5px; font-weight: 900; letter-spacing: 0.16em; text-transform: uppercase; color: #94a3b8; line-height: 1; }
        .nb-user-name { display: block; font-size: 10.5px; font-weight: 700; color: #0f172a; max-width: 88px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-top: 2px; }
        .nb-avatar {
          width: 28px; height: 28px; border-radius: 6px;
          background: #0f172a; border: 1px solid #e2e8f0;
          display: flex; align-items: center; justify-content: center;
          font-size: 10px; font-weight: 900; color: #d4a017;
          overflow: hidden; flex-shrink: 0;
          transition: border-color 0.15s;
        }
        .nb-user-btn:hover .nb-avatar { border-color: #d4a017; }

        .nb-signin {
          padding: 6px 14px; border-radius: 7px;
          border: 1px solid #e2e8f0; background: none;
          font-size: 9px; font-weight: 900; letter-spacing: 0.12em; text-transform: uppercase;
          color: #64748b; transition: all 0.15s;
        }
        .nb-signin:hover { border-color: #0f172a; color: #0f172a; background: #f8fafc; }

        .nb-cta {
          display: flex; align-items: center; gap: 7px;
          padding: 7px 16px; border-radius: 7px;
          background: #0f172a; border: 1px solid #0f172a; color: #fff;
          font-size: 9px; font-weight: 900; letter-spacing: 0.12em; text-transform: uppercase;
          transition: all 0.15s; white-space: nowrap;
        }
        .nb-cta:hover { background: #1e293b; border-color: #1e293b; box-shadow: 0 4px 12px rgba(15,23,42,0.2); }
        .nb-cta-gem { font-size: 9px; color: #d4a017; }

        /* ── Hamburger ── */
        .nb-ham { display: none; flex-direction: column; gap: 4px; align-items: center; justify-content: center; width: 36px; height: 36px; background: none; border: none; }
        .nb-ham span { display: block; width: 18px; height: 1.5px; background: #0f172a; border-radius: 1px; transition: all 0.2s; transform-origin: center; }
        .nb-ham.open span:nth-child(1) { transform: rotate(45deg) translate(4px, 4px); }
        .nb-ham.open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
        .nb-ham.open span:nth-child(3) { transform: rotate(-45deg) translate(4px, -4px); }

        /* ── Mobile drawer ── */
        .nb-drawer {
          display: none; position: absolute; top: 100%; left: 0; right: 0;
          background: #fff; border-bottom: 1px solid #e2e8f0;
          box-shadow: 0 20px 40px rgba(15,23,42,0.1);
          flex-direction: column; padding: 12px 16px 20px;
          overflow-y: auto; max-height: calc(100vh - 60px); z-index: 50;
        }
        .nb-drawer.open { display: flex; }
        .nb-drawer-section { font-size: 7.5px; font-weight: 900; letter-spacing: 0.2em; text-transform: uppercase; color: #94a3b8; margin: 12px 0 6px 2px; }
        .nb-drawer-link {
          display: flex; align-items: center; justify-content: space-between;
          padding: 10px 12px; border-radius: 7px; width: 100%;
          background: none; border: none; text-align: left;
          font-size: 10.5px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase;
          color: #374151; transition: background 0.12s; margin-bottom: 2px;
        }
        .nb-drawer-link:hover { background: #f8fafc; }
        .nb-drawer-link.active { background: #0f172a; color: #fff; }
        .nb-drawer-link.active .nb-drawer-arrow { color: #d4a017; }
        .nb-drawer-arrow { color: #cbd5e1; font-size: 11px; }
        .nb-drawer-sep { height: 1px; background: #f1f5f9; margin: 6px 0; }
        .nb-drawer-cta {
          margin-top: 10px; width: 100%; padding: 13px;
          border-radius: 8px; background: #0f172a; color: #fff; border: none;
          font-size: 9.5px; font-weight: 900; letter-spacing: 0.14em; text-transform: uppercase;
          transition: background 0.15s;
        }
        .nb-drawer-cta:hover { background: #1e293b; }

        @media (max-width: 1024px) {
          .nb-center, .nb-index-tag .nb-label { display: none !important; }
          .nb-ham { display: flex !important; }
          .nb-inner { padding: 0 20px; }
        }
        @media (max-width: 640px) {
          .nb-user-meta, .nb-signin { display: none !important; }
        }
      `}</style>

      <div className={`nb-root ${scrolled ? 'scrolled' : ''}`} style={{ background: scrolled ? 'rgba(255,255,255,0.97)' : 'rgba(255,255,255,0.99)', borderBottom: '1px solid #f1f5f9', backdropFilter: scrolled ? 'blur(20px)' : 'none', boxShadow: scrolled ? '0 1px 3px rgba(15,23,42,0.05), 0 6px 20px rgba(15,23,42,0.04)' : 'none' }}>

        {/* Gold accent bar — visible on scroll */}
        <div className="nb-accent-bar" />

        <div className="nb-inner">

          {/* ── Left ── */}
          <div className="nb-left">
            <button onClick={() => go('home')} style={{ background:'none', border:'none', padding:0, display:'flex', alignItems:'center' }}>
              <Logo type="horizontal" inverse={false} className="h-10 sm:h-12 md:h-14" />
            </button>
            <div className="nb-index-tag">
              <div className="nb-pulse" />
              <span><strong>v2.5</strong> &nbsp;ACTIVE</span>
            </div>
          </div>

          {/* ── Center ── */}
          <div className="nb-center">
            {NB_MAIN.map((l, i) => (
              <React.Fragment key={l.id}>
                {i > 0 && <div className="nb-div"/>}
                <button className={`nb-link ${activeView === l.id ? 'active' : ''}`} onClick={() => go(l.id)}>
                  {l.label}
                  <span className="nb-shortcut">{l.shortcut}</span>
                  <span className="nb-link-line"/>
                </button>
              </React.Fragment>
            ))}

            <div className="nb-div"/>

            {/* Resources */}
            <div style={{ position:'relative' }} ref={dropRef}>
              <button className={`nb-res-btn ${isResActive || dropOpen ? 'active' : ''}`} onClick={() => setDropOpen(!dropOpen)}>
                Resources
                <svg className={`nb-chevron ${dropOpen ? 'open' : ''}`} width="11" height="11" viewBox="0 0 12 12" fill="none">
                  <path d="M2.5 4.5L6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              <div className={`nb-drop ${dropOpen ? 'open' : ''}`}>
                {NB_RESOURCES.map((r, i) => (
                  <React.Fragment key={r.id}>
                    {i === 2 && <div className="nb-drop-sep"/>}
                    <button className={`nb-drop-item ${activeView === r.id ? 'active' : ''}`} onClick={() => go(r.id as View)}>
                      <div className="nb-drop-icon">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d={r.icon}/>
                        </svg>
                      </div>
                      <div>
                        <span className="nb-drop-label">{r.label}</span>
                        <span className="nb-drop-desc">{r.desc}</span>
                      </div>
                    </button>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right ── */}
          <div className="nb-right">
            {user ? (
              <>
                <button className="nb-tier-badge" onClick={() => go('pricing')} style={{ color: tierStyle.color, background: tierStyle.bg, borderColor: tierStyle.border }}>
                  <span style={{ width:5, height:5, borderRadius:'50%', background: tierStyle.color, display:'inline-block', flexShrink:0 }}/>
                  {tier}
                </button>

                <div className="nb-div"/>

                <button className="nb-user-btn" onClick={() => go('profile')}>
                  <div className="nb-user-meta">
                    <span className="nb-user-role">Operator</span>
                    <span className="nb-user-name">{user.name || user.email}</span>
                  </div>
                  <div className="nb-avatar">
                    {user.avatar
                      ? <img src={user.avatar} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                      : (user.name?.[0] || user.email?.[0] || 'U').toUpperCase()
                    }
                  </div>
                </button>
              </>
            ) : (
              <>
                <button className="nb-signin" onClick={() => go('auth')}>Sign In</button>
                <div className="nb-div"/>
              </>
            )}

            <button className="nb-cta" onClick={() => go('audit')}>
              <span className="nb-cta-gem">◆</span>
              <span className="hidden sm:inline">Initiate Protocol</span>
              <span className="sm:hidden">Audit</span>
            </button>

            <button className={`nb-ham ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(!menuOpen)}>
              <span/><span/><span/>
            </button>
          </div>
        </div>

        {/* ── Mobile drawer ── */}
        <div className={`nb-drawer ${menuOpen ? 'open' : ''}`}>
          <div className="nb-drawer-section">Core Console</div>
          {NB_MAIN.map(l => (
            <button key={l.id} className={`nb-drawer-link ${activeView === l.id ? 'active' : ''}`} onClick={() => go(l.id)}>
              <span style={{ display:'flex', alignItems:'center', gap:8 }}>
                {l.label}
                <span style={{ fontFamily:'monospace', fontSize:8, color: activeView === l.id ? 'rgba(212,160,23,0.7)' : '#e2e8f0', background: activeView === l.id ? 'rgba(212,160,23,0.15)' : '#f8fafc', border:'1px solid', borderColor: activeView === l.id ? 'rgba(212,160,23,0.3)' : '#e2e8f0', borderRadius:3, padding:'1px 4px' }}>{l.shortcut}</span>
              </span>
              <span className="nb-drawer-arrow">→</span>
            </button>
          ))}

          <div className="nb-drawer-sep"/>
          <div className="nb-drawer-section">Registry Intelligence</div>
          {NB_RESOURCES.map(r => (
            <button key={r.id} className={`nb-drawer-link ${activeView === r.id ? 'active' : ''}`} onClick={() => go(r.id as View)}>
              <span style={{ display:'flex', alignItems:'center', gap:10 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity:0.4, flexShrink:0 }}><path d={r.icon}/></svg>
                {r.label}
              </span>
              <span className="nb-drawer-arrow">→</span>
            </button>
          ))}

          <div className="nb-drawer-sep"/>
          {user ? (
            <button className="nb-drawer-link" onClick={() => go('profile')}>
              <span style={{ display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ width:24, height:24, borderRadius:5, background:'#0f172a', display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, fontWeight:900, color:'#d4a017', flexShrink:0 }}>
                  {(user.name?.[0] || 'U').toUpperCase()}
                </span>
                {user.name || user.email}
              </span>
              <span style={{ fontSize:8, fontWeight:900, textTransform:'uppercase', letterSpacing:'0.08em', color: tierStyle.color }}>{tier}</span>
            </button>
          ) : (
            <button className="nb-drawer-link" onClick={() => go('auth')}>
              Sign In <span className="nb-drawer-arrow">→</span>
            </button>
          )}

          <button className="nb-drawer-cta" onClick={() => go('audit')}>◆ Initiate Forensic Protocol</button>
        </div>
      </div>
    </>
  );
};

export default Navbar;
