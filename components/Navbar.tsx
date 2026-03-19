import React, { useState, useRef, useEffect } from 'react';
import Logo from './Logo';
import { View, User } from '../types';

interface Props {
  setView: (view: View) => void;
  activeView: View;
  user?: User | null;
}

const TIER_CONFIG: Record<string, { color: string; bg: string; border: string }> = {
  Free:   { color: '#6b7280', bg: 'rgba(107,114,128,0.07)', border: 'rgba(107,114,128,0.18)' },
  Basic:  { color: '#2563eb', bg: 'rgba(37,99,235,0.07)',   border: 'rgba(37,99,235,0.18)'   },
  Pro:    { color: '#7c3aed', bg: 'rgba(124,58,237,0.07)',  border: 'rgba(124,58,237,0.18)'  },
  Agency: { color: '#b8860b', bg: 'rgba(184,134,11,0.08)',  border: 'rgba(184,134,11,0.22)'  },
};

const RESOURCE_LINKS = [
  { id: 'docs',      label: 'Framework & Docs',  desc: 'API reference & guides',         icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
  { id: 'standards', label: 'Forensic Standards', desc: 'Audit methodology & criteria',    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
  { id: 'branding',  label: 'Identity Assets',    desc: 'Logos, brand & design tokens',   icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { id: 'privacy',   label: 'Privacy Protocol',   desc: 'Data handling & compliance',      icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
  { id: 'terms',     label: 'Terms of Registry',  desc: 'Service agreement & legal',       icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
];

const Navbar: React.FC<Props> = ({ setView, activeView, user }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [time,     setTime]     = useState('');
  const dropRef = useRef<HTMLDivElement>(null);

  const tier      = user?.tier || 'Free';
  const tierStyle = TIER_CONFIG[tier] || TIER_CONFIG.Free;

  // Live clock for top bar
  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8);
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
  const isResActive = RESOURCE_LINKS.some(r => r.id === activeView);

  const NAV_LINKS = [
    { id: 'audit'   as View, label: 'Audit Engine', shortcut: '⌘A' },
    { id: 'pricing' as View, label: 'Pricing',      shortcut: '⌘P' },
    { id: 'vault'   as View, label: 'Vault',         shortcut: '⌘V' },
  ];

  const NAV_LINKS = [
    { id: 'audit'   as View, label: 'Audit Engine', shortcut: '⌘A' },
    { id: 'pricing' as View, label: 'Pricing',      shortcut: '⌘P' },
    { id: 'vault'   as View, label: 'Vault',         shortcut: '⌘V' },
  ];

  return (
    <>
      <style>{`
        /* ─── Global cursor fix ─────────────────────────────────── */
        button, a, [role="button"],
        select, label[for],
        .cursor-pointer { cursor: pointer !important; }
        input, textarea { cursor: text; }
        [disabled]      { cursor: not-allowed !important; }

        /* ─── Navbar shell ──────────────────────────────────────── */
        .nav-shell {
          position: sticky; top: 0; z-index: 60; width: 100%;
          transition: box-shadow 0.2s;
        }
        .nav-shell.raised {
          box-shadow: 0 1px 0 #e2e8f0, 0 8px 32px rgba(15,23,42,0.06);
        }

        /* ─── Top bar ───────────────────────────────────────────── */
        .nav-top {
          width: 100%;
          background: #0f172a;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          height: 32px;
          display: flex; align-items: center;
          padding: 0 32px;
        }
        .nav-top-inner {
          max-width: 1440px; margin: 0 auto; width: 100%;
          display: flex; align-items: center; justify-content: space-between;
        }
        .nav-top-left  { display: flex; align-items: center; gap: 20px; }
        .nav-top-right { display: flex; align-items: center; gap: 16px; }

        .nav-top-tag {
          display: flex; align-items: center; gap: 6px;
          font-size: 9px; font-weight: 800; letter-spacing: 0.18em;
          text-transform: uppercase; color: rgba(255,255,255,0.4);
        }
        .nav-top-dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: #22c55e;
          box-shadow: 0 0 0 2px rgba(34,197,94,0.25);
          animation: topDotPulse 2.5s infinite;
        }
        @keyframes topDotPulse {
          0%,100% { box-shadow: 0 0 0 2px rgba(34,197,94,0.25); }
          50%      { box-shadow: 0 0 0 5px rgba(34,197,94,0.08); }
        }
        .nav-top-sep { width: 1px; height: 12px; background: rgba(255,255,255,0.1); }
        .nav-top-label {
          font-size: 9px; font-weight: 700; letter-spacing: 0.12em;
          text-transform: uppercase; color: rgba(255,255,255,0.3);
        }
        .nav-top-time {
          font-family: 'Courier New', Courier, monospace;
          font-size: 10px; font-weight: 700; letter-spacing: 0.08em;
          color: #d4a017;
        }
        .nav-top-proto {
          font-size: 9px; font-weight: 800; letter-spacing: 0.14em;
          color: #d4a017; text-transform: uppercase;
          background: rgba(212,160,23,0.1);
          border: 1px solid rgba(212,160,23,0.2);
          padding: 2px 8px; border-radius: 2px;
        }

        /* ─── Main bar ──────────────────────────────────────────── */
        .nav-main {
          width: 100%;
          background: rgba(255,255,255,0.98);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid #e8ecf0;
          height: 72px;
          display: flex; align-items: center;
          padding: 0 32px;
        }
        .nav-main-inner {
          max-width: 1440px; margin: 0 auto; width: 100%;
          display: flex; align-items: center; justify-content: space-between;
          gap: 24px;
        }

        /* ─── Logo zone ─────────────────────────────────────────── */
        .nav-logo-zone {
          display: flex; align-items: center;
          flex-shrink: 0; gap: 0;
        }
        .nav-logo-btn {
          background: none; border: none; padding: 0;
          display: flex; align-items: center; cursor: pointer;
          transition: opacity 0.15s;
        }
        .nav-logo-btn:hover { opacity: 0.82; }

        /* Divider after logo */
        .nav-logo-divider {
          width: 1px; height: 28px; background: #e2e8f0; margin: 0 20px; flex-shrink: 0;
        }

        /* ─── Center nav ────────────────────────────────────────── */
        .nav-center { display: flex; align-items: center; flex: 1; }

        .nav-link {
          position: relative; background: none; border: none; cursor: pointer;
          padding: 0 16px; height: 72px;
          display: flex; align-items: center; gap: 6px;
          font-size: 10px; font-weight: 800; letter-spacing: 0.2em;
          text-transform: uppercase; color: #94a3b8;
          transition: color 0.15s;
          border-bottom: 2px solid transparent;
          margin-bottom: -1px; /* overlap main bar border */
        }
        .nav-link:hover { color: #0f172a; }
        .nav-link.active {
          color: #0f172a;
          border-bottom-color: #d4a017;
        }
        .nav-link-shortcut {
          font-size: 9px; font-weight: 700; letter-spacing: 0;
          color: #cbd5e1; font-family: 'Courier New', monospace;
          opacity: 0; transition: opacity 0.15s;
        }
        .nav-link:hover .nav-link-shortcut { opacity: 1; }

        /* Resources */
        .nav-res-wrap { position: relative; height: 72px; display: flex; align-items: center; margin-bottom: -1px; }
        .nav-res-btn {
          display: flex; align-items: center; gap: 5px;
          background: none; border: none; cursor: pointer;
          padding: 0 16px; height: 72px;
          font-size: 10px; font-weight: 800; letter-spacing: 0.2em;
          text-transform: uppercase; color: #94a3b8;
          transition: color 0.15s;
          border-bottom: 2px solid transparent;
        }
        .nav-res-btn:hover { color: #0f172a; }
        .nav-res-btn.active { color: #0f172a; border-bottom-color: #d4a017; }
        .nav-res-chevron { transition: transform 0.2s; flex-shrink: 0; }
        .nav-res-chevron.open { transform: rotate(180deg); }

        /* Dropdown — mega style */
        .nav-drop {
          position: absolute; top: calc(100% + 1px); left: 50%;
          transform: translateX(-50%) translateY(-6px);
          width: 320px;
          background: #fff;
          border: 1px solid #e2e8f0;
          border-top: 2px solid #d4a017;
          box-shadow: 0 4px 6px rgba(15,23,42,0.04), 0 24px 56px rgba(15,23,42,0.1);
          padding: 6px;
          opacity: 0; visibility: hidden;
          transition: opacity 0.16s, transform 0.16s, visibility 0.16s;
          z-index: 200;
        }
        .nav-drop.open {
          opacity: 1; visibility: visible;
          transform: translateX(-50%) translateY(0);
        }
        .nav-drop-item {
          display: flex; align-items: center; gap: 12px;
          padding: 10px 12px; width: 100%;
          background: none; border: none; cursor: pointer; text-align: left;
          transition: background 0.12s;
        }
        .nav-drop-item:hover { background: #f8fafc; }
        .nav-drop-item.active { background: #f8fafc; }
        .nav-drop-icon {
          width: 36px; height: 36px; flex-shrink: 0;
          background: #f1f5f9; border: 1px solid #e2e8f0;
          display: flex; align-items: center; justify-content: center;
          color: #64748b; transition: all 0.14s;
        }
        .nav-drop-item:hover .nav-drop-icon,
        .nav-drop-item.active .nav-drop-icon {
          background: #0f172a; border-color: #0f172a; color: #d4a017;
        }
        .nav-drop-label { font-size: 11.5px; font-weight: 700; color: #0f172a; display: block; line-height: 1.3; }
        .nav-drop-desc  { font-size: 10px; color: #94a3b8; display: block; margin-top: 2px; }
        .nav-drop-hr { height: 1px; background: #f1f5f9; margin: 4px 8px; }

        /* ─── Right zone ────────────────────────────────────────── */
        .nav-right { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }

        /* Tier badge */
        .nav-tier {
          display: flex; align-items: center; gap: 5px;
          padding: 4px 10px; border: 1px solid; border-radius: 2px;
          font-size: 9px; font-weight: 800; letter-spacing: 0.12em;
          text-transform: uppercase; cursor: pointer; background: none;
          transition: opacity 0.15s;
        }
        .nav-tier:hover { opacity: 0.75; }
        .nav-tier-dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }

        /* Vertical divider */
        .nav-vd { width: 1px; height: 22px; background: #e2e8f0; }

        /* User block */
        .nav-user {
          display: flex; align-items: center; gap: 10px;
          padding: 6px 8px 6px 14px;
          border: 1px solid #e8ecf0;
          background: #fafbfc;
          cursor: pointer; transition: all 0.14s;
          border-radius: 0;
        }
        .nav-user:hover { background: #f1f5f9; border-color: #cbd5e1; }
        .nav-user-info { text-align: right; }
        .nav-user-role { display: block; font-size: 8px; font-weight: 800; letter-spacing: 0.18em; text-transform: uppercase; color: #94a3b8; line-height: 1; }
        .nav-user-name { display: block; font-size: 11px; font-weight: 700; color: #0f172a; max-width: 96px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-top: 2px; }
        .nav-avatar {
          width: 30px; height: 30px;
          background: #0f172a;
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 800; color: #d4a017;
          overflow: hidden; flex-shrink: 0; border: none;
        }
        .nav-avatar img { width: 100%; height: 100%; object-fit: cover; }

        /* Sign in */
        .nav-signin {
          padding: 8px 18px;
          border: 1px solid #e2e8f0; background: none;
          font-size: 9px; font-weight: 800; letter-spacing: 0.14em;
          text-transform: uppercase; color: #475569; cursor: pointer;
          transition: all 0.14s; border-radius: 0;
        }
        .nav-signin:hover { border-color: #0f172a; color: #0f172a; background: #f8fafc; }

        /* CTA — the statement button */
        .nav-cta {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 22px;
          background: #0f172a; border: none; color: #fff;
          font-size: 9px; font-weight: 800; letter-spacing: 0.18em;
          text-transform: uppercase; cursor: pointer;
          transition: all 0.15s; border-radius: 0;
          position: relative; overflow: hidden;
        }
        .nav-cta::before {
          content: '';
          position: absolute; left: 0; top: 0; bottom: 0;
          width: 3px; background: #d4a017;
        }
        .nav-cta:hover { background: #1e293b; box-shadow: 0 4px 20px rgba(15,23,42,0.3); transform: translateY(-1px); }
        .nav-cta:active { transform: none; }
        .nav-cta-icon { color: #d4a017; font-size: 11px; }

        /* Hamburger */
        .nav-ham { display: none; flex-direction: column; gap: 4px; background: none; border: none; cursor: pointer; padding: 8px; flex-shrink: 0; }
        .nav-ham span { display: block; width: 20px; height: 1.5px; background: #0f172a; transition: all 0.2s; transform-origin: center; }
        .nav-ham.open span:nth-child(1) { transform: rotate(45deg) translate(4px,4px); }
        .nav-ham.open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
        .nav-ham.open span:nth-child(3) { transform: rotate(-45deg) translate(4px,-4px); }

        /* Mobile drawer */
        .nav-drawer {
          display: none; position: absolute; top: 100%; left: 0; right: 0;
          background: #fff; border-bottom: 2px solid #d4a017;
          box-shadow: 0 24px 56px rgba(15,23,42,0.12);
          flex-direction: column; overflow-y: auto;
          max-height: calc(100vh - 104px); z-index: 50;
        }
        .nav-drawer.open { display: flex; }
        .nav-drawer-section {
          padding: 14px 20px 8px;
          font-size: 8px; font-weight: 800; letter-spacing: 0.22em;
          text-transform: uppercase; color: #94a3b8;
          border-top: 1px solid #f1f5f9;
        }
        .nav-drawer-link {
          display: flex; align-items: center; justify-content: space-between;
          padding: 12px 20px; width: 100%;
          background: none; border: none; cursor: pointer; text-align: left;
          font-size: 11px; font-weight: 700; letter-spacing: 0.08em;
          text-transform: uppercase; color: #374151;
          transition: background 0.12s; border-bottom: 1px solid #f8fafc;
        }
        .nav-drawer-link:hover { background: #f8fafc; }
        .nav-drawer-link.active { background: #0f172a; color: #fff; border-bottom-color: #0f172a; }
        .nav-drawer-link.active .nav-arrow { color: #d4a017; }
        .nav-arrow { color: #cbd5e1; font-size: 12px; }
        .nav-drawer-bottom { padding: 16px 20px 24px; }
        .nav-drawer-cta {
          width: 100%; padding: 14px; background: #0f172a; color: #fff;
          border: none; cursor: pointer; font-size: 10px; font-weight: 800;
          letter-spacing: 0.16em; text-transform: uppercase;
          transition: background 0.15s; position: relative; overflow: hidden;
        }
        .nav-drawer-cta::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 3px; background: #d4a017; }
        .nav-drawer-cta:hover { background: #1e293b; }

        @media (max-width: 1024px) {
          .nav-center, .nav-vd, .nav-tier { display: none !important; }
          .nav-ham { display: flex !important; }
          .nav-main { padding: 0 20px; }
          .nav-top  { padding: 0 20px; }
        }
        @media (max-width: 640px) {
          .nav-user-info { display: none; }
          .nav-signin    { display: none; }
        }
      `}</style>

      <div className={`nav-shell ${scrolled ? 'raised' : ''}`}>

        {/* ══ TOP BAR ═══════════════════════════════════════════════ */}
        <div className="nav-top hidden lg:flex">
          <div className="nav-top-inner">
            <div className="nav-top-left">
              <div className="nav-top-tag">
                <div className="nav-top-dot"/>
                System Operational
              </div>
              <div className="nav-top-sep"/>
              <span className="nav-top-label">Engine v2.5.1</span>
              <div className="nav-top-sep"/>
              <span className="nav-top-label">BNB Testnet</span>
              <div className="nav-top-sep"/>
              <span className="nav-top-label">$VEC Payments Active</span>
            </div>
            <div className="nav-top-right">
              <div className="nav-top-proto">Protocol v2.5</div>
              <div className="nav-top-sep"/>
              <span className="nav-top-time">{time}</span>
            </div>
          </div>
        </div>

        {/* ══ MAIN BAR ══════════════════════════════════════════════ */}
        <div className="nav-main">
          <div className="nav-main-inner">

            {/* Logo */}
            <div className="nav-logo-zone">
              <button className="nav-logo-btn" onClick={() => go('home')}>
                <Logo type="horizontal" inverse={false} className="h-11 sm:h-12 md:h-[52px]" />
              </button>
              <div className="nav-logo-divider"/>
            </div>

            {/* Center links */}
            <div className="nav-center">
              {NAV_LINKS.map(l => (
                <button key={l.id} className={`nav-link ${activeView === l.id ? 'active' : ''}`} onClick={() => go(l.id)}>
                  {l.label}
                  <span className="nav-link-shortcut">{l.shortcut}</span>
                </button>
              ))}

              {/* Resources */}
              <div className="nav-res-wrap" ref={dropRef}>
                <button className={`nav-res-btn ${isResActive || dropOpen ? 'active' : ''}`} onClick={() => setDropOpen(!dropOpen)}>
                  Resources
                  <svg className={`nav-res-chevron ${dropOpen ? 'open' : ''}`} width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2.5 4.5L6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>

                <div className={`nav-drop ${dropOpen ? 'open' : ''}`}>
                  {RESOURCE_LINKS.map((r, i) => (
                    <React.Fragment key={r.id}>
                      {i === 2 && <div className="nav-drop-hr"/>}
                      <button className={`nav-drop-item ${activeView === r.id ? 'active' : ''}`} onClick={() => go(r.id as View)}>
                        <div className="nav-drop-icon">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d={r.icon}/>
                          </svg>
                        </div>
                        <div>
                          <span className="nav-drop-label">{r.label}</span>
                          <span className="nav-drop-desc">{r.desc}</span>
                        </div>
                      </button>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>

            {/* Right */}
            <div className="nav-right">
              {user ? (
                <>
                  <button className="nav-tier" onClick={() => go('pricing')}
                    style={{ color: tierStyle.color, background: tierStyle.bg, borderColor: tierStyle.border }}>
                    <span className="nav-tier-dot" style={{ background: tierStyle.color }}/>
                    {tier}
                  </button>
                  <div className="nav-vd"/>
                  <button className="nav-user" onClick={() => go('profile')}>
                    <div className="nav-user-info">
                      <span className="nav-user-role">Operator</span>
                      <span className="nav-user-name">{user.name || user.email}</span>
                    </div>
                    <div className="nav-avatar">
                      {user.avatar
                        ? <img src={user.avatar} alt="" onError={e => (e.target as HTMLImageElement).style.display='none'}/>
                        : (user.name?.[0] || user.email?.[0] || 'U').toUpperCase()
                      }
                    </div>
                  </button>
                </>
              ) : (
                <>
                  <button className="nav-signin" onClick={() => go('auth')}>Sign In</button>
                  <div className="nav-vd"/>
                </>
              )}

              <button className="nav-cta" onClick={() => go('audit')}>
                <span className="nav-cta-icon">◆</span>
                Initiate Protocol
              </button>

              {/* Hamburger */}
              <button className={`nav-ham ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(!menuOpen)}>
                <span/><span/><span/>
              </button>
            </div>
          </div>
        </div>

        {/* ══ MOBILE DRAWER ═════════════════════════════════════════ */}
        <div className={`nav-drawer ${menuOpen ? 'open' : ''}`}>
          <div className="nav-drawer-section">Core Console</div>
          {NAV_LINKS.map(l => (
            <button key={l.id} className={`nav-drawer-link ${activeView === l.id ? 'active' : ''}`} onClick={() => go(l.id)}>
              {l.label} <span className="nav-arrow">→</span>
            </button>
          ))}

          <div className="nav-drawer-section">Registry Intelligence</div>
          {RESOURCE_LINKS.map(r => (
            <button key={r.id} className={`nav-drawer-link ${activeView === r.id ? 'active' : ''}`} onClick={() => go(r.id as View)}>
              <span style={{ display:'flex', alignItems:'center', gap:10 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity:0.4, flexShrink:0 }}>
                  <path d={r.icon}/>
                </svg>
                {r.label}
              </span>
              <span className="nav-arrow">→</span>
            </button>
          ))}

          <div className="nav-drawer-bottom">
            {user ? (
              <button
                style={{ display:'flex', alignItems:'center', gap:10, width:'100%', marginBottom:12, padding:'10px 0', background:'none', border:'none', cursor:'pointer', borderBottom:'1px solid #f1f5f9' }}
                onClick={() => go('profile')}>
                <div style={{ width:28, height:28, background:'#0f172a', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:800, color:'#d4a017', flexShrink:0 }}>
                  {(user.name?.[0] || 'U').toUpperCase()}
                </div>
                <div style={{ textAlign:'left' }}>
                  <span style={{ display:'block', fontSize:8, fontWeight:800, letterSpacing:'0.15em', textTransform:'uppercase', color:'#94a3b8' }}>Operator</span>
                  <span style={{ display:'block', fontSize:11, fontWeight:700, color:'#0f172a' }}>{user.name || user.email}</span>
                </div>
                <span style={{ marginLeft:'auto', fontSize:9, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.1em', color: tierStyle.color }}>{tier}</span>
              </button>
            ) : (
              <button style={{ width:'100%', padding:'10px 0', marginBottom:12, background:'none', border:'none', borderBottom:'1px solid #f1f5f9', cursor:'pointer', fontSize:11, fontWeight:700, textAlign:'left', letterSpacing:'0.06em', textTransform:'uppercase', color:'#374151' }} onClick={() => go('auth')}>
                Sign In →
              </button>
            )}
            <button className="nav-drawer-cta" onClick={() => go('audit')}>
              ◆ Initiate Forensic Protocol
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
