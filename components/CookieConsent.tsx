import React, { useState, useEffect } from 'react';

const COOKIE_KEY = 'velacore_cookie_consent';

export default function CookieConsent() {
  const [visible,  setVisible]  = useState(false);
  const [leaving,  setLeaving]  = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(COOKIE_KEY);
    if (!saved) {
      // Small delay — feels intentional
      const t = setTimeout(() => setVisible(true), 1800);
      return () => clearTimeout(t);
    }
  }, []);

  function dismiss(choice: 'all' | 'essential') {
    setLeaving(true);
    setTimeout(() => {
      localStorage.setItem(COOKIE_KEY, JSON.stringify({ choice, timestamp: Date.now() }));
      setVisible(false);
      setLeaving(false);
    }, 380);
  }

  if (!visible) return null;

  return (
    <>
      <style>{`
        .cc-root {
          position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
          z-index: 9999; width: calc(100vw - 48px); max-width: 680px;
          animation: ccSlideUp 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards;
        }
        .cc-root.leaving {
          animation: ccSlideDown 0.38s cubic-bezier(0.4,0,1,1) forwards;
        }
        @keyframes ccSlideUp {
          from { opacity: 0; transform: translateX(-50%) translateY(24px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes ccSlideDown {
          from { opacity: 1; transform: translateX(-50%) translateY(0); }
          to   { opacity: 0; transform: translateX(-50%) translateY(24px); }
        }

        .cc-card {
          background: rgba(255,255,255,0.96);
          backdrop-filter: blur(24px) saturate(180%);
          -webkit-backdrop-filter: blur(24px) saturate(180%);
          border: 1px solid rgba(15,23,42,0.08);
          border-radius: 20px;
          box-shadow:
            0 0 0 1px rgba(255,255,255,0.8) inset,
            0 8px 16px rgba(15,23,42,0.06),
            0 32px 64px rgba(15,23,42,0.1);
          overflow: hidden;
        }

        /* Top gold bar */
        .cc-top-bar {
          height: 3px;
          background: linear-gradient(90deg, #0f172a 0%, #d4a017 40%, #f59e0b 60%, #d4a017 80%, #0f172a 100%);
        }

        .cc-body { padding: 20px 24px 20px; }

        /* Header row */
        .cc-header {
          display: flex; align-items: flex-start; justify-content: space-between;
          gap: 16px; margin-bottom: 14px;
        }
        .cc-icon-wrap {
          width: 40px; height: 40px; border-radius: 12px; flex-shrink: 0;
          background: #0f172a;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 12px rgba(15,23,42,0.2);
        }
        .cc-title-group { flex: 1; }
        .cc-eyebrow {
          font-size: 8.5px; font-weight: 900; letter-spacing: 0.18em;
          text-transform: uppercase; color: #d4a017; margin-bottom: 3px;
        }
        .cc-title {
          font-size: 15px; font-weight: 800; color: #0f172a;
          letter-spacing: -0.2px; line-height: 1.2;
        }

        /* Description */
        .cc-desc {
          font-size: 13px; color: #64748b; line-height: 1.6;
          margin-bottom: 4px;
        }
        .cc-desc strong { color: #0f172a; font-weight: 700; }

        /* Expand toggle */
        .cc-expand-btn {
          background: none; border: none; padding: 0;
          font-size: 12px; font-weight: 700; color: #d4a017;
          display: flex; align-items: center; gap: 4px;
          margin-bottom: 16px; margin-top: 6px;
          transition: opacity 0.15s;
        }
        .cc-expand-btn:hover { opacity: 0.7; }
        .cc-expand-chevron { transition: transform 0.2s; display: inline-block; }
        .cc-expand-chevron.open { transform: rotate(180deg); }

        /* Expanded details */
        .cc-details {
          display: grid; grid-template-columns: 1fr 1fr 1fr;
          gap: 8px; margin-bottom: 16px;
          overflow: hidden;
          max-height: 0; transition: max-height 0.3s ease;
        }
        .cc-details.open { max-height: 200px; }
        .cc-detail-card {
          background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px;
          padding: 10px 12px;
        }
        .cc-detail-name {
          font-size: 10px; font-weight: 800; text-transform: uppercase;
          letter-spacing: 0.1em; color: #0f172a; margin-bottom: 3px;
          display: flex; align-items: center; gap: 5px;
        }
        .cc-detail-badge {
          font-size: 8px; padding: 1px 5px; border-radius: 3px;
          font-weight: 900; letter-spacing: 0.06em;
        }
        .cc-detail-badge.required { background: rgba(212,160,23,0.12); color: #b8860b; border: 1px solid rgba(212,160,23,0.25); }
        .cc-detail-badge.optional { background: rgba(100,116,139,0.08); color: #64748b; border: 1px solid rgba(100,116,139,0.15); }
        .cc-detail-desc { font-size: 10px; color: #94a3b8; line-height: 1.4; }

        /* Actions */
        .cc-actions {
          display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
        }
        .cc-btn-essential {
          flex: 1; min-width: 120px;
          padding: 10px 16px; border-radius: 10px;
          border: 1px solid rgba(15,23,42,0.12); background: none;
          font-size: 11px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase;
          color: #475569; transition: all 0.15s; cursor: pointer;
        }
        .cc-btn-essential:hover { border-color: #0f172a; color: #0f172a; background: rgba(15,23,42,0.03); }
        .cc-btn-all {
          flex: 2; min-width: 160px;
          padding: 10px 20px; border-radius: 10px;
          background: #0f172a; border: 1px solid #0f172a; color: #fff;
          font-size: 11px; font-weight: 900; letter-spacing: 0.1em; text-transform: uppercase;
          transition: all 0.18s; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 7px;
          box-shadow: 0 2px 8px rgba(15,23,42,0.2), inset 0 1px 0 rgba(255,255,255,0.08);
        }
        .cc-btn-all:hover {
          background: #1e293b;
          box-shadow: 0 4px 16px rgba(15,23,42,0.3), inset 0 1px 0 rgba(255,255,255,0.08);
          transform: translateY(-1px);
        }
        .cc-btn-gem { color: #d4a017; font-size: 9px; }

        /* Footer note */
        .cc-footer {
          padding: 10px 24px 14px;
          border-top: 1px solid rgba(15,23,42,0.05);
          display: flex; align-items: center; justify-content: space-between; gap: 12px;
          flex-wrap: wrap;
        }
        .cc-footer-text { font-size: 10px; color: #94a3b8; }
        .cc-footer-text a { color: #64748b; font-weight: 600; text-decoration: underline; text-underline-offset: 2px; cursor: pointer; }
        .cc-footer-text a:hover { color: #0f172a; }
        .cc-trust {
          display: flex; align-items: center; gap: 5px;
          font-size: 9px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase;
          color: #94a3b8;
        }
        .cc-trust-dot { width: 5px; height: 5px; border-radius: 50%; background: #22c55e; animation: ccPulse 2s infinite; }
        @keyframes ccPulse { 0%,100%{opacity:1} 50%{opacity:0.4} }

        @media (max-width: 520px) {
          .cc-root { bottom: 12px; width: calc(100vw - 24px); }
          .cc-body { padding: 16px 18px 16px; }
          .cc-footer { padding: 10px 18px 12px; }
          .cc-details { grid-template-columns: 1fr; }
          .cc-actions { flex-direction: column; }
          .cc-btn-essential, .cc-btn-all { flex: none; width: 100%; }
        }
      `}</style>

      <div className={`cc-root ${leaving ? 'leaving' : ''}`}>
        <div className="cc-card">
          <div className="cc-top-bar"/>

          <div className="cc-body">
            {/* Header */}
            <div className="cc-header">
              <div className="cc-icon-wrap">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d4a017" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  <path d="M9 12l2 2 4-4"/>
                </svg>
              </div>
              <div className="cc-title-group">
                <div className="cc-eyebrow">Data & Privacy Protocol</div>
                <div className="cc-title">Your data stays yours. We just need your permission.</div>
              </div>
            </div>

            {/* Description */}
            <p className="cc-desc">
              We use cookies to deliver <strong>forensic-grade audit results</strong>, remember your preferences, and improve our platform. No personal data is sold. Ever.
            </p>

            {/* Expand */}
            <button className="cc-expand-btn" onClick={() => setExpanded(!expanded)}>
              {expanded ? 'Hide' : 'See what we collect'}
              <span className={`cc-expand-chevron ${expanded ? 'open' : ''}`}>▾</span>
            </button>

            {/* Details */}
            <div className={`cc-details ${expanded ? 'open' : ''}`}>
              {[
                { name: 'Essential',  badge: 'required', desc: 'Auth sessions, security tokens, preferences.', required: true  },
                { name: 'Analytics',  badge: 'optional', desc: 'Page views, audit usage patterns (anonymized).', required: false },
                { name: 'Functional', badge: 'optional', desc: 'Saved reports, UI state, vault access.',          required: false },
              ].map(item => (
                <div className="cc-detail-card" key={item.name}>
                  <div className="cc-detail-name">
                    {item.name}
                    <span className={`cc-detail-badge ${item.required ? 'required' : 'optional'}`}>{item.badge}</span>
                  </div>
                  <div className="cc-detail-desc">{item.desc}</div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="cc-actions">
              <button className="cc-btn-essential" onClick={() => dismiss('essential')}>
                Essential Only
              </button>
              <button className="cc-btn-all" onClick={() => dismiss('all')}>
                <span className="cc-btn-gem">◆</span>
                Accept All & Continue
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="cc-footer">
            <div className="cc-footer-text">
              By continuing you agree to our{' '}
              <a onClick={() => { dismiss('essential'); }}>Privacy Policy</a>
              {' & '}
              <a onClick={() => { dismiss('essential'); }}>Cookie Policy</a>
            </div>
            <div className="cc-trust">
              <div className="cc-trust-dot"/>
              GDPR Compliant
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
