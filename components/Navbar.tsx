import React, { useState, useRef, useEffect } from 'react';
import Logo from './Logo';
import { View, User } from '../types';

interface Props {
  setView: (view: View) => void;
  activeView: View;
  user?: User | null;
}

const NB_TIER: Record<string, { color: string; bg: string; border: string }> = {
  Free:   { color: '#6b7280', bg: 'rgba(107,114,128,0.1)', border: 'rgba(107,114,128,0.2)' },
  Basic:  { color: '#2563eb', bg: 'rgba(37,99,235,0.1)',   border: 'rgba(37,99,235,0.25)'  },
  Pro:    { color: '#7c3aed', bg: 'rgba(124,58,237,0.1)',  border: 'rgba(124,58,237,0.25)' },
  Agency: { color: '#b8860b', bg: 'rgba(184,134,11,0.1)',  border: 'rgba(184,134,11,0.3)'  },
};

const NB_RESOURCES = [
  { id: 'docs',      label: 'Framework & Docs',  desc: 'API reference & integration guides',    tag: 'NEW',  icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
  { id: 'standards', label: 'Forensic Standards', desc: 'Audit methodology & scoring criteria',  tag: null,   icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
  { id: 'branding',  label: 'Identity Assets',    desc: 'Brand kit, logos & design tokens',      tag: null,   icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { id: 'privacy',   label: 'Privacy Protocol',   desc: 'Data handling & compliance docs',        tag: null,   icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
  { id: 'terms',     label: 'Terms of Registry',  desc: 'Service agreement & legal terms',        tag: null,   icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
];

const NB_MAIN = [
  { id: 'audit'   as View, label: 'Audit Engine' },
  { id: 'pricing' as View, label: 'Pricing'      },
  { id: 'vault'   as View, label: 'Vault'        },
];

const Navbar: React.FC<Props> = ({ setView, activeView, user }) => {
  const [menuOpen,  setMenuOpen]  = useState(false);
  const [resHover,  setResHover]  = useState(false);
  const [scrolled,  setScrolled]  = useState(false);
  const resRef     = useRef<HTMLDivElement>(null);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const tier      = user?.tier || 'Free';
  const tierStyle = NB_TIER[tier] || NB_TIER.Free;
  const isResActive = NB_RESOURCES.some(r => r.id === activeView);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const go = (v: View) => { setView(v); setMenuOpen(false); setResHover(false); };

  const openRes  = () => { if (leaveTimer.current) clearTimeout(leaveTimer.current); setResHover(true); };
  const closeRes = () => { leaveTimer.current = setTimeout(() => setResHover(false), 120); };

  return (
    <>
      <style>{`
        *, *::before, *::after { cursor: default; }
        a, button, [role="button"], [tabindex]:not([tabindex="-1"]),
        label, select, input[type="submit"], input[type="reset"],
        input[type="button"], input[type="checkbox"], input[type="radio"] {
          cursor: pointer !important;
        }
        input[type="text"], input[type="email"], input[type="password"],
        input[type="search"], input[type="url"], input[type="number"], textarea {
          cursor: text !important;
        }

        /* ── Floating pill wrapper ── */
        .fnb-wrap {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          display: flex; justify-content: center;
          padding: 14px 24px 0;
          pointer-events: none;
        }

        /* ── The pill ── */
        .fnb-pill {
          pointer-events: all;
          display: flex; align-items: center; justify-content: space-between;
          width: 100%; max-width: 1160px;
          height: 54px;
          padding: 0 8px 0 16px;
          border-radius: 999px;
          background: rgba(255,255,255,0.82);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border: 1px solid rgba(255,255,255,0.9);
          box-shadow:
            0 2px 4px rgba(15,23,42,0.04),
            0 8px 24px rgba(15,23,42,0.08),
            inset 0 1px 0 rgba(255,255,255,0.8);
          transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
        }
        .fnb-pill.scrolled {
          background: rgba(255,255,255,0.92);
          box-shadow:
            0 4px 8px rgba(15,23,42,0.06),
            0 16px 40px rgba(15,23,42,0.1),
            inset 0 1px 0 rgba(255,255,255,0.9);
        }

        /* ── Logo side ── */
        .fnb-logo-btn {
          background: none; border: none; padding: 0; display: flex; align-items: center; flex-shrink: 0;
          border-radius: 999px;
          transition: opacity 0.15s;
        }
        .fnb-logo-btn:hover { opacity: 0.8; }

        /* ── Center links ── */
        .fnb-links { display: flex; align-items: center; gap: 2px; }

        .fnb-link {
          position: relative; background: none; border: none;
          padding: 7px 14px; border-radius: 999px;
          font-size: 10px; font-weight: 800; letter-spacing: 0.18em; text-transform: uppercase;
          color: #64748b; transition: all 0.18s; white-space: nowrap;
        }
        .fnb-link:hover { color: #0f172a; background: rgba(15,23,42,0.05); }
        .fnb-link.active {
          color: #0f172a;
          background: rgba(15,23,42,0.07);
        }
        .fnb-link.active::after {
          content: '';
          position: absolute; bottom: 5px; left: 50%; transform: translateX(-50%);
          width: 18px; height: 2px; border-radius: 999px;
          background: #d4a017;
        }

        /* ── Resources hover ── */
        .fnb-res-wrap { position: relative; }
        .fnb-res-btn {
          display: flex; align-items: center; gap: 5px;
          background: none; border: none;
          padding: 7px 14px; border-radius: 999px;
          font-size: 10px; font-weight: 800; letter-spacing: 0.18em; text-transform: uppercase;
          color: #64748b; transition: all 0.18s;
        }
        .fnb-res-btn:hover, .fnb-res-btn.active { color: #0f172a; background: rgba(15,23,42,0.05); }
        .fnb-chevron { transition: transform 0.2s; }
        .fnb-chevron.open { transform: rotate(180deg); }

        /* ── Dropdown ── */
        .fnb-drop {
          position: absolute; top: calc(100% + 14px); left: 50%; transform: translateX(-50%);
          width: 520px;
          background: #fff;
          border: 1px solid rgba(15,23,42,0.08);
          border-radius: 20px;
          box-shadow:
            0 0 0 1px rgba(15,23,42,0.03),
            0 8px 16px rgba(15,23,42,0.06),
            0 32px 64px rgba(15,23,42,0.12);
          padding: 10px;
          opacity: 0; visibility: hidden;
          transform: translateX(-50%) translateY(-8px) scale(0.97);
          transition: all 0.2s cubic-bezier(0.4,0,0.2,1);
          z-index: 200;
        }
        .fnb-drop.open {
          opacity: 1; visibility: visible;
          transform: translateX(-50%) translateY(0) scale(1);
        }

        /* Grid layout inside dropdown */
        .fnb-drop-grid {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 4px;
        }
        .fnb-drop-item {
          display: flex; align-items: flex-start; gap: 12px;
          padding: 12px 14px; border-radius: 12px;
          background: none; border: none; text-align: left;
          transition: background 0.14s; position: relative;
          overflow: hidden;
        }
        .fnb-drop-item::before {
          content: ''; position: absolute; inset: 0; border-radius: 12px;
          background: linear-gradient(135deg, rgba(212,160,23,0.06), transparent);
          opacity: 0; transition: opacity 0.15s;
        }
        .fnb-drop-item:hover::before { opacity: 1; }
        .fnb-drop-item:hover { background: #fafaf8; }
        .fnb-drop-item.active { background: #fafaf8; }

        .fnb-drop-icon-wrap {
          width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          background: #f1f5f9; border: 1px solid #e2e8f0; color: #64748b;
          transition: all 0.15s;
        }
        .fnb-drop-item:hover .fnb-drop-icon-wrap,
        .fnb-drop-item.active .fnb-drop-icon-wrap {
          background: #0f172a; border-color: #0f172a; color: #d4a017;
        }

        .fnb-drop-content { min-width: 0; }
        .fnb-drop-header { display: flex; align-items: center; gap: 6px; margin-bottom: 3px; }
        .fnb-drop-label { font-size: 12px; font-weight: 700; color: #0f172a; }
        .fnb-drop-tag {
          font-size: 8px; font-weight: 900; letter-spacing: 0.1em; text-transform: uppercase;
          color: #d4a017; background: rgba(212,160,23,0.12); border: 1px solid rgba(212,160,23,0.25);
          border-radius: 3px; padding: 1px 5px;
        }
        .fnb-drop-desc { font-size: 11px; color: #94a3b8; line-height: 1.4; }

        /* Dropdown footer */
        .fnb-drop-footer {
          margin-top: 8px; padding: 10px 14px;
          border-top: 1px solid #f1f5f9;
          display: flex; align-items: center; justify-content: space-between;
        }
        .fnb-drop-footer-text { font-size: 10px; color: #94a3b8; }
        .fnb-drop-footer-link {
          font-size: 10px; font-weight: 700; color: #0f172a;
          background: none; border: none;
          display: flex; align-items: center; gap: 4px; transition: gap 0.15s;
        }
        .fnb-drop-footer-link:hover { gap: 7px; }

        /* ── Right side ── */
        .fnb-right { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }

        .fnb-tier {
          display: flex; align-items: center; gap: 5px;
          padding: 4px 10px; border-radius: 999px; border: 1px solid;
          font-size: 9px; font-weight: 900; letter-spacing: 0.1em; text-transform: uppercase;
          background: none; transition: opacity 0.15s;
        }
        .fnb-tier:hover { opacity: 0.75; }
        .fnb-tier-dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }

        .fnb-user {
          display: flex; align-items: center; gap: 7px;
          padding: 4px 6px 4px 10px; border-radius: 999px;
          background: rgba(15,23,42,0.04); border: 1px solid rgba(15,23,42,0.08);
          transition: all 0.15s;
        }
        .fnb-user:hover { background: rgba(15,23,42,0.07); border-color: rgba(15,23,42,0.12); }
        .fnb-user-name { font-size: 11px; font-weight: 700; color: #0f172a; max-width: 80px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .fnb-avatar {
          width: 28px; height: 28px; border-radius: 50%;
          background: #0f172a; display: flex; align-items: center; justify-content: center;
          font-size: 10px; font-weight: 900; color: #d4a017; overflow: hidden; flex-shrink: 0;
        }
        .fnb-avatar img { width: 100%; height: 100%; object-fit: cover; }

        .fnb-signin {
          padding: 7px 16px; border-radius: 999px;
          border: 1px solid rgba(15,23,42,0.12); background: none;
          font-size: 10px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase;
          color: #475569; transition: all 0.15s;
        }
        .fnb-signin:hover { border-color: #0f172a; color: #0f172a; background: rgba(15,23,42,0.04); }

        .fnb-cta {
          display: flex; align-items: center; gap: 7px;
          padding: 8px 18px; border-radius: 999px;
          background: #0f172a; border: none; color: #fff;
          font-size: 10px; font-weight: 900; letter-spacing: 0.12em; text-transform: uppercase;
          transition: all 0.18s; white-space: nowrap;
          box-shadow: 0 2px 8px rgba(15,23,42,0.25), inset 0 1px 0 rgba(255,255,255,0.08);
        }
        .fnb-cta:hover {
          background: #1e293b;
          box-shadow: 0 4px 16px rgba(15,23,42,0.35), inset 0 1px 0 rgba(255,255,255,0.08);
          transform: translateY(-1px);
        }
        .fnb-cta:active { transform: none; }
        .fnb-cta-gem { color: #d4a017; font-size: 8px; }

        /* ── Hamburger ── */
        .fnb-ham {
          display: none; width: 36px; height: 36px; border-radius: 50%;
          background: rgba(15,23,42,0.05); border: none;
          flex-direction: column; align-items: center; justify-content: center; gap: 4px;
          transition: background 0.15s;
        }
        .fnb-ham:hover { background: rgba(15,23,42,0.08); }
        .fnb-ham span { display: block; width: 16px; height: 1.5px; background: #0f172a; border-radius: 1px; transition: all 0.2s; transform-origin: center; }
        .fnb-ham.open span:nth-child(1) { transform: rotate(45deg) translate(4px,4px); }
        .fnb-ham.open span:nth-child(2) { opacity:0; transform: scaleX(0); }
        .fnb-ham.open span:nth-child(3) { transform: rotate(-45deg) translate(4px,-4px); }

        /* ── Spacer ── */
        .fnb-spacer { height: 82px; }

        /* ── Mobile drawer ── */
        .fnb-drawer {
          position: fixed; top: 78px; left: 12px; right: 12px; z-index: 99;
          background: rgba(255,255,255,0.97); backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.9); border-radius: 20px;
          box-shadow: 0 8px 32px rgba(15,23,42,0.12);
          flex-direction: column; padding: 12px 14px 16px;
          max-height: calc(100vh - 100px); overflow-y: auto;
          display: none;
        }
        .fnb-drawer.open { display: flex; }
        .fnb-drawer-section { font-size: 8px; font-weight: 900; letter-spacing: 0.2em; text-transform: uppercase; color: #94a3b8; margin: 10px 0 6px 4px; }
        .fnb-drawer-link {
          display: flex; align-items: center; justify-content: space-between;
          padding: 10px 12px; border-radius: 10px; width: 100%;
          background: none; border: none; text-align: left;
          font-size: 11px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase;
          color: #374151; transition: background 0.12s; margin-bottom: 2px;
        }
        .fnb-drawer-link:hover { background: rgba(15,23,42,0.04); }
        .fnb-drawer-link.active { background: #0f172a; color: #fff; }
        .fnb-drawer-arrow { color: #cbd5e1; font-size: 11px; }
        .fnb-drawer-link.active .fnb-drawer-arrow { color: #d4a017; }
        .fnb-drawer-sep { height: 1px; background: #f1f5f9; margin: 6px 0; }
        .fnb-drawer-cta {
          margin-top: 8px; width: 100%; padding: 13px; border-radius: 12px;
          background: #0f172a; color: #fff; border: none;
          font-size: 10px; font-weight: 900; letter-spacing: 0.12em; text-transform: uppercase;
          transition: background 0.15s;
        }
        .fnb-drawer-cta:hover { background: #1e293b; }

        @media (max-width: 900px) {
          .fnb-links, .fnb-res-wrap, .fnb-signin { display: none !important; }
          .fnb-ham { display: flex !important; }
          .fnb-wrap { padding: 10px 12px 0; }
          .fnb-pill { padding: 0 8px 0 12px; }
        }
        @media (max-width: 560px) {
          .fnb-user-name, .fnb-tier { display: none !important; }
        }
      `}</style>

      <div className="fnb-wrap">
        <div className={`fnb-pill ${scrolled ? 'scrolled' : ''}`}>

          {/* Logo */}
          <button className="fnb-logo-btn" onClick={() => go('home')}>
            <Logo type="horizontal" inverse={false} className="h-9 sm:h-10 md:h-11" />
          </button>

          {/* Center links */}
          <div className="fnb-links">
            {NB_MAIN.map(l => (
              <button key={l.id} className={`fnb-link ${activeView === l.id ? 'active' : ''}`} onClick={() => go(l.id)}>
                {l.label}
              </button>
            ))}

            {/* Resources — hover to open */}
            <div className="fnb-res-wrap" ref={resRef} onMouseEnter={openRes} onMouseLeave={closeRes}>
              <button className={`fnb-res-btn ${isResActive || resHover ? 'active' : ''}`}>
                Resources
                <svg className={`fnb-chevron ${resHover ? 'open' : ''}`} width="11" height="11" viewBox="0 0 12 12" fill="none">
                  <path d="M2.5 4.5L6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              <div className={`fnb-drop ${resHover ? 'open' : ''}`} onMouseEnter={openRes} onMouseLeave={closeRes}>
                <div className="fnb-drop-grid">
                  {NB_RESOURCES.map(r => (
                    <button key={r.id} className={`fnb-drop-item ${activeView === r.id ? 'active' : ''}`} onClick={() => go(r.id as View)}>
                      <div className="fnb-drop-icon-wrap">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d={r.icon}/>
                        </svg>
                      </div>
                      <div className="fnb-drop-content">
                        <div className="fnb-drop-header">
                          <span className="fnb-drop-label">{r.label}</span>
                          {r.tag && <span className="fnb-drop-tag">{r.tag}</span>}
                        </div>
                        <p className="fnb-drop-desc">{r.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="fnb-drop-footer">
                  <span className="fnb-drop-footer-text">VelaCore Forensic Registry v2.5</span>
                  <button className="fnb-drop-footer-link" onClick={() => go('docs')}>
                    View all resources <span>→</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="fnb-right">
            {user ? (
              <>
                <button className="fnb-tier" onClick={() => go('pricing')} style={{ color: tierStyle.color, background: tierStyle.bg, borderColor: tierStyle.border }}>
                  <div className="fnb-tier-dot" style={{ background: tierStyle.color }}/>
                  {tier}
                </button>
                <button className="fnb-user" onClick={() => go('profile')}>
                  <span className="fnb-user-name">{user.name || user.email}</span>
                  <div className="fnb-avatar">
                    {user.avatar ? <img src={user.avatar} alt=""/> : (user.name?.[0] || user.email?.[0] || 'U').toUpperCase()}
                  </div>
                </button>
              </>
            ) : (
              <button className="fnb-signin" onClick={() => go('auth')}>Sign In</button>
            )}

            <button className="fnb-cta" onClick={() => go('audit')}>
              <span className="fnb-cta-gem">◆</span>
              <span className="hidden sm:inline">Initiate Protocol</span>
              <span className="sm:hidden">Audit</span>
            </button>

            <button className={`fnb-ham ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(!menuOpen)}>
              <span/><span/><span/>
            </button>
          </div>
        </div>
      </div>

      {/* Spacer */}
      <div className="fnb-spacer"/>

      {/* Mobile drawer */}
      <div className={`fnb-drawer ${menuOpen ? 'open' : ''}`}>
        <div className="fnb-drawer-section">Navigation</div>
        {NB_MAIN.map(l => (
          <button key={l.id} className={`fnb-drawer-link ${activeView === l.id ? 'active' : ''}`} onClick={() => go(l.id)}>
            {l.label} <span className="fnb-drawer-arrow">→</span>
          </button>
        ))}
        <div className="fnb-drawer-sep"/>
        <div className="fnb-drawer-section">Registry Intelligence</div>
        {NB_RESOURCES.map(r => (
          <button key={r.id} className={`fnb-drawer-link ${activeView === r.id ? 'active' : ''}`} onClick={() => go(r.id as View)}>
            <span style={{ display:'flex', alignItems:'center', gap:9 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity:0.4, flexShrink:0 }}><path d={r.icon}/></svg>
              {r.label}
            </span>
            <span className="fnb-drawer-arrow">→</span>
          </button>
        ))}
        <div className="fnb-drawer-sep"/>
        {user ? (
          <button className="fnb-drawer-link" onClick={() => go('profile')}>
            <span style={{ display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ width:22, height:22, borderRadius:'50%', background:'#0f172a', display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, fontWeight:900, color:'#d4a017', flexShrink:0 }}>
                {(user.name?.[0] || 'U').toUpperCase()}
              </span>
              {user.name || user.email}
            </span>
            <span style={{ fontSize:9, fontWeight:900, textTransform:'uppercase', letterSpacing:'0.08em', color: tierStyle.color }}>{tier}</span>
          </button>
        ) : (
          <button className="fnb-drawer-link" onClick={() => go('auth')}>Sign In <span className="fnb-drawer-arrow">→</span></button>
        )}
        <button className="fnb-drawer-cta" onClick={() => go('audit')}>◆ Initiate Forensic Protocol</button>
      </div>
    </>
  );
};

export default Navbar;
