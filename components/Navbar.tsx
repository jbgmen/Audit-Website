import React, { useState, useEffect, useRef } from 'react';
import { View, User } from '../types';

interface NavbarProps {
  user: User | null;
  setView: (view: View) => void;
  activeView: View;
}

const RESOURCES_ITEMS = [
  { label: 'Documentation',   icon: '📄', desc: 'Integration guides & API docs',  view: 'docs'      as View },
  { label: 'Standards',       icon: '⚖️',  desc: 'Audit methodology & criteria',  view: 'standards' as View },
  { label: 'Branding Kit',    icon: '🎨', desc: 'Assets, logos & guidelines',     view: 'branding'  as View },
  { label: 'Verification',    icon: '🔍', desc: 'Verify an audit certificate',    view: 'verify'    as View },
];

export default function Navbar({ user, setView, activeView }: NavbarProps) {
  const [scrolled,       setScrolled]       = useState(false);
  const [resourcesOpen,  setResourcesOpen]  = useState(false);
  const [mobileOpen,     setMobileOpen]     = useState(false);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 });
  const navRef      = useRef<HTMLDivElement>(null);
  const resourceRef = useRef<HTMLDivElement>(null);

  // Scroll blur effect
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close resources dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (resourceRef.current && !resourceRef.current.contains(e.target as Node)) {
        setResourcesOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Magnetic hover indicator for nav links
  function handleNavHover(e: React.MouseEvent<HTMLButtonElement>) {
    const el   = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const nav  = navRef.current;
    if (!nav) return;
    const navRect = nav.getBoundingClientRect();
    setIndicatorStyle({
      left:    rect.left - navRect.left,
      width:   rect.width,
      opacity: 1,
    });
  }
  function handleNavLeave() {
    setIndicatorStyle(s => ({ ...s, opacity: 0 }));
  }

  const navLinks = [
    { label: 'Audit Engine', view: 'audit'   as View },
    { label: 'Pricing',      view: 'pricing' as View },
    { label: 'Vault',        view: 'vault'   as View },
  ];

  const tier        = user?.tier || 'Free';
  const tierColors: Record<string, string> = {
    Free:   '#6b7280',
    Basic:  '#3b82f6',
    Pro:    '#8b5cf6',
    Agency: '#d4a017',
  };

  return (
    <>
      <style>{`
        .vc-navbar {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          transition: all 0.3s ease;
        }
        .vc-navbar.scrolled {
          background: rgba(255,255,255,0.92);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          box-shadow: 0 1px 0 rgba(0,0,0,0.08), 0 4px 24px rgba(0,0,0,0.06);
        }
        .vc-navbar.top {
          background: rgba(255,255,255,0.95);
          border-bottom: 1px solid rgba(0,0,0,0.06);
        }
        .vc-inner {
          max-width: 1280px; margin: 0 auto;
          padding: 0 24px;
          height: 68px;
          display: flex; align-items: center; justify-content: space-between;
          gap: 32px;
        }

        /* Logo */
        .vc-logo {
          display: flex; align-items: center; gap: 10px;
          cursor: pointer; text-decoration: none; flex-shrink: 0;
          transition: opacity 0.2s;
        }
        .vc-logo:hover { opacity: 0.85; }
        .vc-logo-mark {
          width: 36px; height: 36px; position: relative;
        }
        .vc-logo-mark svg { width: 100%; height: 100%; }
        .vc-logo-text { display: flex; flex-direction: column; line-height: 1; }
        .vc-logo-name {
          font-family: 'Georgia', 'Times New Roman', serif;
          font-size: 17px; font-weight: 700; letter-spacing: -0.2px;
          color: #0f172a;
        }
        .vc-logo-sub {
          font-size: 9px; font-weight: 700; letter-spacing: 0.25em;
          color: #d4a017; text-transform: uppercase; margin-top: 1px;
        }

        /* Status pill */
        .vc-status {
          display: flex; align-items: center; gap: 6px;
          padding: 4px 10px; border-radius: 20px;
          background: rgba(212,160,23,0.08); border: 1px solid rgba(212,160,23,0.2);
          font-size: 10px; font-weight: 700; color: #b8860b;
          letter-spacing: 0.06em; text-transform: uppercase;
          flex-shrink: 0;
        }
        .vc-status-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #22c55e;
          box-shadow: 0 0 0 2px rgba(34,197,94,0.25);
          animation: vcPulse 2s infinite;
        }
        @keyframes vcPulse {
          0%, 100% { box-shadow: 0 0 0 2px rgba(34,197,94,0.25); }
          50%       { box-shadow: 0 0 0 5px rgba(34,197,94,0.1); }
        }

        /* Nav links */
        .vc-nav { display: flex; align-items: center; position: relative; }
        .vc-nav-indicator {
          position: absolute; bottom: -2px; height: 2px;
          background: #d4a017; border-radius: 2px;
          transition: all 0.25s cubic-bezier(0.4,0,0.2,1);
          pointer-events: none;
        }
        .vc-nav-btn {
          background: none; border: none; cursor: pointer;
          padding: 8px 14px; border-radius: 8px;
          font-size: 12px; font-weight: 600; letter-spacing: 0.06em;
          text-transform: uppercase; color: #374151;
          transition: color 0.2s;
          white-space: nowrap;
        }
        .vc-nav-btn:hover { color: #0f172a; }
        .vc-nav-btn.active { color: #0f172a; }

        /* Resources dropdown */
        .vc-resources { position: relative; }
        .vc-resources-btn {
          display: flex; align-items: center; gap: 5px;
          background: none; border: none; cursor: pointer;
          padding: 8px 14px; border-radius: 8px;
          font-size: 12px; font-weight: 600; letter-spacing: 0.06em;
          text-transform: uppercase; color: #374151;
          transition: color 0.2s;
        }
        .vc-resources-btn:hover { color: #0f172a; }
        .vc-chevron {
          width: 14px; height: 14px;
          transition: transform 0.25s ease;
        }
        .vc-chevron.open { transform: rotate(180deg); }
        .vc-dropdown {
          position: absolute; top: calc(100% + 12px); right: 0;
          width: 280px;
          background: #fff;
          border: 1px solid rgba(0,0,0,0.08);
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06);
          padding: 8px;
          opacity: 0; visibility: hidden; transform: translateY(-8px);
          transition: all 0.22s cubic-bezier(0.4,0,0.2,1);
          z-index: 200;
        }
        .vc-dropdown.open {
          opacity: 1; visibility: visible; transform: translateY(0);
        }
        .vc-dropdown-item {
          display: flex; align-items: center; gap: 12px;
          padding: 11px 14px; border-radius: 10px;
          cursor: pointer; transition: background 0.15s;
          border: none; background: none; width: 100%; text-align: left;
        }
        .vc-dropdown-item:hover { background: #f9fafb; }
        .vc-dropdown-icon {
          width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
          background: #f3f4f6; display: flex; align-items: center; justify-content: center;
          font-size: 16px;
        }
        .vc-dropdown-label {
          font-size: 13px; font-weight: 700; color: #0f172a; margin-bottom: 2px;
        }
        .vc-dropdown-desc {
          font-size: 11px; color: #9ca3af;
        }
        .vc-dropdown-divider {
          height: 1px; background: #f3f4f6; margin: 6px 8px;
        }

        /* Right actions */
        .vc-actions { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }

        /* Tier badge */
        .vc-tier {
          display: flex; align-items: center; gap: 6px;
          padding: 5px 10px; border-radius: 20px;
          font-size: 10px; font-weight: 800; letter-spacing: 0.06em;
          text-transform: uppercase; border: 1px solid; cursor: pointer;
          transition: opacity 0.2s;
        }
        .vc-tier:hover { opacity: 0.8; }

        /* Avatar */
        .vc-avatar {
          width: 34px; height: 34px; border-radius: 50%;
          background: #0f172a; color: #d4a017;
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; font-weight: 800; cursor: pointer;
          border: 2px solid rgba(212,160,23,0.3);
          transition: border-color 0.2s;
          overflow: hidden;
        }
        .vc-avatar:hover { border-color: #d4a017; }
        .vc-avatar img { width: 100%; height: 100%; object-fit: cover; }

        /* Sign in */
        .vc-signin {
          background: none; border: 1px solid rgba(0,0,0,0.15);
          border-radius: 8px; padding: 8px 16px; cursor: pointer;
          font-size: 12px; font-weight: 700; letter-spacing: 0.04em;
          color: #374151; transition: all 0.2s;
        }
        .vc-signin:hover { border-color: #0f172a; color: #0f172a; background: #f9fafb; }

        /* CTA button */
        .vc-cta {
          display: flex; align-items: center; gap: 8px;
          background: #0f172a; color: #fff;
          border: none; border-radius: 9px; padding: 9px 20px;
          font-size: 12px; font-weight: 800; letter-spacing: 0.08em;
          text-transform: uppercase; cursor: pointer;
          transition: all 0.2s; white-space: nowrap;
          box-shadow: 0 2px 8px rgba(15,23,42,0.25);
        }
        .vc-cta:hover {
          background: #1e293b;
          box-shadow: 0 4px 16px rgba(15,23,42,0.35);
          transform: translateY(-1px);
        }
        .vc-cta:active { transform: none; }
        .vc-cta-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #d4a017;
        }

        /* Protocol tag on CTA */
        .vc-cta-tag {
          font-size: 9px; background: rgba(212,160,23,0.2);
          color: #d4a017; border-radius: 4px; padding: 1px 5px;
          letter-spacing: 0.08em; font-weight: 800;
        }

        /* Mobile hamburger */
        .vc-hamburger {
          display: none; flex-direction: column; gap: 5px;
          background: none; border: none; cursor: pointer; padding: 8px;
        }
        .vc-hamburger span {
          display: block; width: 22px; height: 2px;
          background: #0f172a; border-radius: 2px;
          transition: all 0.25s;
        }
        .vc-hamburger.open span:nth-child(1) { transform: rotate(45deg) translate(5px, 5px); }
        .vc-hamburger.open span:nth-child(2) { opacity: 0; }
        .vc-hamburger.open span:nth-child(3) { transform: rotate(-45deg) translate(5px, -5px); }

        /* Mobile drawer */
        .vc-mobile-drawer {
          display: none; position: fixed; top: 68px; left: 0; right: 0; bottom: 0;
          background: #fff; z-index: 99; padding: 24px;
          flex-direction: column; gap: 8px;
          border-top: 1px solid rgba(0,0,0,0.06);
          overflow-y: auto;
        }
        .vc-mobile-drawer.open { display: flex; }
        .vc-mobile-link {
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 16px; border-radius: 12px;
          font-size: 15px; font-weight: 700; color: #0f172a;
          cursor: pointer; transition: background 0.15s;
          background: none; border: none; width: 100%; text-align: left;
        }
        .vc-mobile-link:hover { background: #f9fafb; }
        .vc-mobile-link.active { background: rgba(212,160,23,0.08); color: #b8860b; }
        .vc-mobile-divider { height: 1px; background: #f3f4f6; margin: 8px 0; }
        .vc-mobile-cta {
          margin-top: 8px; background: #0f172a; color: #fff;
          border: none; border-radius: 12px; padding: 16px;
          font-size: 14px; font-weight: 800; letter-spacing: 0.06em;
          text-transform: uppercase; cursor: pointer; width: 100%;
          transition: background 0.2s;
        }
        .vc-mobile-cta:hover { background: #1e293b; }

        @media (max-width: 900px) {
          .vc-nav, .vc-status, .vc-resources,
          .vc-signin, .vc-cta { display: none !important; }
          .vc-hamburger { display: flex !important; }
        }
        @media (max-width: 640px) {
          .vc-inner { padding: 0 16px; }
        }
      `}</style>

      <nav className={`vc-navbar ${scrolled ? 'scrolled' : 'top'}`}>
        <div className="vc-inner">

          {/* Logo */}
          <button className="vc-logo" onClick={() => setView('home')} style={{ background: 'none', border: 'none', padding: 0 }}>
            <div className="vc-logo-mark">
              <svg viewBox="0 0 36 36" fill="none">
                <polygon points="18,2 34,10 34,26 18,34 2,26 2,10" fill="#0f172a" />
                <polygon points="18,7 29,13 29,25 18,31 7,25 7,13" fill="none" stroke="#d4a017" strokeWidth="1.5" />
                <path d="M13 18l4 4 6-7" stroke="#d4a017" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="vc-logo-text">
              <span className="vc-logo-name">VelaCore</span>
              <span className="vc-logo-sub">Analytics</span>
            </div>
          </button>

          {/* Center — status pill + nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flex: 1, justifyContent: 'center' }}>
            <div className="vc-status">
              <div className="vc-status-dot" />
              PROTOCOL v2.5 ACTIVE
            </div>

            <div className="vc-nav" ref={navRef} onMouseLeave={handleNavLeave}>
              <div className="vc-nav-indicator" style={{ left: indicatorStyle.left, width: indicatorStyle.width, opacity: indicatorStyle.opacity }} />
              {navLinks.map(link => (
                <button
                  key={link.view}
                  className={`vc-nav-btn ${activeView === link.view ? 'active' : ''}`}
                  onClick={() => setView(link.view)}
                  onMouseEnter={handleNavHover}
                >
                  {link.label}
                </button>
              ))}

              {/* Resources dropdown */}
              <div className="vc-resources" ref={resourceRef}>
                <button
                  className="vc-resources-btn"
                  onClick={() => setResourcesOpen(!resourcesOpen)}
                  onMouseEnter={handleNavHover}
                >
                  Resources
                  <svg className={`vc-chevron ${resourcesOpen ? 'open' : ''}`} viewBox="0 0 14 14" fill="none">
                    <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>

                <div className={`vc-dropdown ${resourcesOpen ? 'open' : ''}`}>
                  {RESOURCES_ITEMS.slice(0, 2).map(item => (
                    <button key={item.view} className="vc-dropdown-item"
                      onClick={() => { setView(item.view); setResourcesOpen(false); }}>
                      <div className="vc-dropdown-icon">{item.icon}</div>
                      <div>
                        <div className="vc-dropdown-label">{item.label}</div>
                        <div className="vc-dropdown-desc">{item.desc}</div>
                      </div>
                    </button>
                  ))}
                  <div className="vc-dropdown-divider" />
                  {RESOURCES_ITEMS.slice(2).map(item => (
                    <button key={item.view} className="vc-dropdown-item"
                      onClick={() => { setView(item.view); setResourcesOpen(false); }}>
                      <div className="vc-dropdown-icon">{item.icon}</div>
                      <div>
                        <div className="vc-dropdown-label">{item.label}</div>
                        <div className="vc-dropdown-desc">{item.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right actions */}
          <div className="vc-actions">
            {user ? (
              <>
                {/* Tier badge */}
                <button
                  className="vc-tier"
                  onClick={() => setView('pricing')}
                  style={{ color: tierColors[tier], borderColor: tierColors[tier] + '40', background: tierColors[tier] + '12' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: tierColors[tier], display: 'inline-block' }} />
                  {tier}
                </button>

                {/* Avatar */}
                <button className="vc-avatar" onClick={() => setView('profile')} title={user.name || user.email}>
                  {user.avatar
                    ? <img src={user.avatar} alt={user.name} />
                    : (user.name?.[0] || user.email[0]).toUpperCase()
                  }
                </button>
              </>
            ) : (
              <>
                <button className="vc-signin" onClick={() => setView('auth')}>Sign In</button>
              </>
            )}

            <button className="vc-cta" onClick={() => setView('audit')}>
              <div className="vc-cta-dot" />
              Initiate Protocol
              <span className="vc-cta-tag">FREE</span>
            </button>
          </div>

          {/* Mobile hamburger */}
          <button className={`vc-hamburger ${mobileOpen ? 'open' : ''}`} onClick={() => setMobileOpen(!mobileOpen)}>
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      <div className={`vc-mobile-drawer ${mobileOpen ? 'open' : ''}`}>
        {navLinks.map(link => (
          <button key={link.view} className={`vc-mobile-link ${activeView === link.view ? 'active' : ''}`}
            onClick={() => { setView(link.view); setMobileOpen(false); }}>
            {link.label}
            <span style={{ fontSize: 12, color: '#9ca3af' }}>→</span>
          </button>
        ))}
        {RESOURCES_ITEMS.map(item => (
          <button key={item.view} className="vc-mobile-link"
            onClick={() => { setView(item.view); setMobileOpen(false); }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {item.icon} {item.label}
            </span>
            <span style={{ fontSize: 12, color: '#9ca3af' }}>→</span>
          </button>
        ))}
        <div className="vc-mobile-divider" />
        {user ? (
          <button className="vc-mobile-link" onClick={() => { setView('profile'); setMobileOpen(false); }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              👤 {user.name || user.email}
            </span>
          </button>
        ) : (
          <button className="vc-mobile-link" onClick={() => { setView('auth'); setMobileOpen(false); }}>
            Sign In →
          </button>
        )}
        <button className="vc-mobile-cta" onClick={() => { setView('audit'); setMobileOpen(false); }}>
          ◆ Initiate Protocol — Free
        </button>
      </div>

      {/* Spacer */}
      <div style={{ height: 68 }} />
    </>
  );
}
