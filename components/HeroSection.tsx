import React, { useEffect, useRef, useState } from 'react';
import { View } from '../types';

interface HeroProps {
  setView: (view: View) => void;
}

// Animated number counter
function Counter({ target, suffix = '', duration = 2000 }: { target: number, suffix?: string, duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const start = performance.now();
        const animate = (now: number) => {
          const progress = Math.min((now - start) / duration, 1);
          const ease = 1 - Math.pow(1 - progress, 3);
          setCount(Math.floor(ease * target));
          if (progress < 1) requestAnimationFrame(animate);
          else setCount(target);
        };
        requestAnimationFrame(animate);
      }
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}

const STATS = [
  { value: 12400, suffix: '+', label: 'Audits Completed'    },
  { value: 94,    suffix: '%', label: 'Client Satisfaction' },
  { value: 3,     suffix: 'x', label: 'Avg. Score Lift'     },
  { value: 180,   suffix: '+', label: 'Industries Covered'  },
];

const TRUST_ITEMS = [
  { label: 'SEO Architecture',    score: 94 },
  { label: 'Conversion Systems',  score: 87 },
  { label: 'Trust Signals',       score: 91 },
  { label: 'Performance Index',   score: 96 },
];

export default function HeroSection({ setView }: HeroProps) {
  const [activeItem, setActiveItem] = useState(0);
  const [visible,    setVisible]    = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveItem(i => (i + 1) % TRUST_ITEMS.length);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <style>{`
        .hero-root {
          min-height: 100vh;
          background: #fafaf8;
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        /* Subtle grid background */
        .hero-grid {
          position: absolute; inset: 0; pointer-events: none;
          background-image:
            linear-gradient(rgba(15,23,42,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(15,23,42,0.04) 1px, transparent 1px);
          background-size: 64px 64px;
          mask-image: radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 100%);
        }

        /* Gold accent lines */
        .hero-accent-line {
          position: absolute; pointer-events: none;
        }
        .hero-accent-line-1 {
          top: 0; left: 50%; transform: translateX(-50%);
          width: 1px; height: 120px;
          background: linear-gradient(to bottom, #d4a017, transparent);
        }
        .hero-accent-line-2 {
          top: 140px; left: 50%; transform: translateX(-50%);
          width: 600px; height: 1px;
          background: linear-gradient(to right, transparent, rgba(212,160,23,0.3), transparent);
        }

        .hero-inner {
          max-width: 1280px; margin: 0 auto; padding: 0 24px;
          flex: 1; display: flex; align-items: center;
          padding-top: 80px; padding-bottom: 80px;
          gap: 80px;
        }

        /* Left column */
        .hero-left {
          flex: 1; max-width: 620px;
        }
        .hero-badge {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 6px 14px; border-radius: 4px;
          background: #0f172a; color: #d4a017;
          font-size: 10px; font-weight: 800; letter-spacing: 0.15em;
          text-transform: uppercase;
          margin-bottom: 32px;
          opacity: 0; transform: translateY(12px);
          transition: all 0.5s cubic-bezier(0.4,0,0.2,1);
        }
        .hero-badge.visible { opacity: 1; transform: none; }
        .hero-badge-dot {
          width: 6px; height: 6px; border-radius: 50%; background: #22c55e;
          animation: vcPulse 2s infinite;
        }

        .hero-headline {
          font-family: 'Georgia', 'Times New Roman', serif;
          line-height: 1.06; letter-spacing: -1.5px;
          color: #0f172a; margin: 0 0 24px;
          opacity: 0; transform: translateY(20px);
          transition: all 0.6s 0.1s cubic-bezier(0.4,0,0.2,1);
        }
        .hero-headline.visible { opacity: 1; transform: none; }
        .hero-headline-size { font-size: clamp(48px, 6vw, 80px); font-weight: 700; }
        .hero-headline em {
          font-style: italic; color: #d4a017; display: block;
        }

        .hero-sub {
          font-size: clamp(16px, 1.8vw, 18px); color: #475569;
          line-height: 1.7; margin: 0 0 40px; max-width: 480px;
          font-weight: 400;
          opacity: 0; transform: translateY(16px);
          transition: all 0.6s 0.2s cubic-bezier(0.4,0,0.2,1);
        }
        .hero-sub.visible { opacity: 1; transform: none; }

        /* CTA group */
        .hero-cta-group {
          display: flex; align-items: center; gap: 16px; flex-wrap: wrap;
          margin-bottom: 56px;
          opacity: 0; transform: translateY(12px);
          transition: all 0.6s 0.3s cubic-bezier(0.4,0,0.2,1);
        }
        .hero-cta-group.visible { opacity: 1; transform: none; }

        .hero-cta-primary {
          display: flex; align-items: center; gap: 10px;
          background: #0f172a; color: #fff;
          border: none; border-radius: 6px;
          padding: 15px 28px;
          font-size: 13px; font-weight: 800; letter-spacing: 0.08em;
          text-transform: uppercase; cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 20px rgba(15,23,42,0.3);
        }
        .hero-cta-primary:hover {
          background: #1e293b;
          box-shadow: 0 8px 32px rgba(15,23,42,0.4);
          transform: translateY(-2px);
        }
        .hero-cta-arrow {
          display: flex; align-items: center; justify-content: center;
          width: 22px; height: 22px; border-radius: 50%;
          background: rgba(212,160,23,0.25);
          font-size: 12px; transition: transform 0.2s;
        }
        .hero-cta-primary:hover .hero-cta-arrow { transform: translateX(3px); }

        .hero-cta-secondary {
          display: flex; align-items: center; gap: 8px;
          background: none; border: 1.5px solid rgba(15,23,42,0.15);
          border-radius: 6px; padding: 14px 24px;
          font-size: 13px; font-weight: 700; letter-spacing: 0.04em;
          color: #374151; cursor: pointer; transition: all 0.2s;
        }
        .hero-cta-secondary:hover {
          border-color: #0f172a; color: #0f172a; background: #f9fafb;
        }

        .hero-proof {
          font-size: 12px; color: #9ca3af; font-weight: 500;
          display: flex; align-items: center; gap: 6px;
        }
        .hero-proof strong { color: #22c55e; }

        /* Stats row */
        .hero-stats {
          display: grid; grid-template-columns: repeat(4, 1fr);
          gap: 1px; background: rgba(0,0,0,0.08);
          border: 1px solid rgba(0,0,0,0.08); border-radius: 12px;
          overflow: hidden;
          opacity: 0; transform: translateY(12px);
          transition: all 0.6s 0.4s cubic-bezier(0.4,0,0.2,1);
        }
        .hero-stats.visible { opacity: 1; transform: none; }
        .hero-stat {
          padding: 20px; background: #fff; text-align: center;
        }
        .hero-stat-num {
          font-family: 'Georgia', serif;
          font-size: 28px; font-weight: 700; color: #0f172a;
          letter-spacing: -0.5px; line-height: 1; display: block;
          margin-bottom: 4px;
        }
        .hero-stat-num em { font-style: normal; color: #d4a017; }
        .hero-stat-label {
          font-size: 10px; font-weight: 700; letter-spacing: 0.08em;
          text-transform: uppercase; color: #9ca3af;
        }

        /* Right column — audit card */
        .hero-right {
          flex-shrink: 0; width: 400px;
          opacity: 0; transform: translateX(24px) rotate(1deg);
          transition: all 0.8s 0.2s cubic-bezier(0.4,0,0.2,1);
        }
        .hero-right.visible { opacity: 1; transform: none; }

        .hero-card {
          background: #fff;
          border: 1px solid rgba(0,0,0,0.08);
          border-radius: 20px;
          box-shadow: 0 24px 80px rgba(15,23,42,0.12), 0 4px 16px rgba(15,23,42,0.06);
          overflow: hidden;
        }

        /* Card header */
        .hero-card-header {
          background: #0f172a;
          padding: 20px 22px;
          display: flex; align-items: center; justify-content: space-between;
        }
        .hero-card-id {
          font-size: 10px; color: rgba(255,255,255,0.4);
          letter-spacing: 0.1em; font-weight: 700;
        }
        .hero-card-status {
          display: flex; align-items: center; gap: 6px;
          font-size: 10px; color: #22c55e; font-weight: 700;
          letter-spacing: 0.06em;
        }
        .hero-card-status-dot {
          width: 6px; height: 6px; border-radius: 50%; background: #22c55e;
          animation: vcPulse 2s infinite;
        }

        /* Score ring */
        .hero-score-ring {
          display: flex; align-items: center; justify-content: center;
          padding: 32px 24px 24px;
          background: #0f172a;
        }
        .hero-ring-wrap {
          position: relative; display: flex; align-items: center; justify-content: center;
        }
        .hero-ring-svg { transform: rotate(-90deg); }
        .hero-ring-bg { fill: none; stroke: rgba(255,255,255,0.08); }
        .hero-ring-fill {
          fill: none; stroke: #d4a017; stroke-linecap: round;
          stroke-dasharray: 408; stroke-dashoffset: 61;
          filter: drop-shadow(0 0 8px rgba(212,160,23,0.6));
          transition: stroke-dashoffset 1.5s 0.5s cubic-bezier(0.4,0,0.2,1);
        }
        .hero-ring-center {
          position: absolute; text-align: center;
        }
        .hero-ring-score {
          font-family: 'Georgia', serif;
          font-size: 48px; font-weight: 700; color: #fff;
          line-height: 1; display: block; letter-spacing: -2px;
        }
        .hero-ring-label {
          font-size: 10px; color: rgba(255,255,255,0.4);
          letter-spacing: 0.12em; text-transform: uppercase; font-weight: 700;
        }
        .hero-ring-verdict {
          font-size: 11px; color: #d4a017; font-weight: 800;
          letter-spacing: 0.1em; text-transform: uppercase;
          margin-top: 6px; display: block;
        }

        /* Card body */
        .hero-card-body { padding: 20px 22px; }
        .hero-card-title {
          font-size: 11px; font-weight: 800; letter-spacing: 0.12em;
          text-transform: uppercase; color: #9ca3af; margin-bottom: 14px;
        }
        .hero-item {
          display: flex; align-items: center; gap: 12px;
          padding: 10px 0;
          border-bottom: 1px solid #f3f4f6;
          cursor: default;
        }
        .hero-item:last-child { border-bottom: none; }
        .hero-item-label {
          font-size: 13px; font-weight: 600; color: #374151; flex: 1;
        }
        .hero-item-bar { flex: 1; height: 4px; background: #f3f4f6; border-radius: 2px; overflow: hidden; }
        .hero-item-fill {
          height: 100%; border-radius: 2px;
          background: linear-gradient(to right, #d4a017, #f59e0b);
          transition: width 1s cubic-bezier(0.4,0,0.2,1);
        }
        .hero-item-fill.active {
          background: linear-gradient(to right, #0f172a, #334155);
        }
        .hero-item-score {
          font-size: 13px; font-weight: 800; color: #0f172a;
          font-family: 'Georgia', serif; width: 32px; text-align: right;
        }

        /* Card footer */
        .hero-card-footer {
          padding: 14px 22px;
          background: rgba(212,160,23,0.06);
          border-top: 1px solid rgba(212,160,23,0.15);
          display: flex; align-items: center; justify-content: space-between;
        }
        .hero-card-footer-text {
          font-size: 11px; font-weight: 700; color: #b8860b;
          letter-spacing: 0.06em; text-transform: uppercase;
        }
        .hero-cert-badge {
          display: flex; align-items: center; gap: 5px;
          font-size: 10px; font-weight: 800; color: #b8860b;
          background: rgba(212,160,23,0.12);
          border: 1px solid rgba(212,160,23,0.25);
          border-radius: 4px; padding: 4px 8px;
          letter-spacing: 0.06em;
        }

        /* Floating decorative cards */
        .hero-float-card {
          position: absolute;
          background: #fff;
          border: 1px solid rgba(0,0,0,0.08);
          border-radius: 12px;
          padding: 12px 16px;
          box-shadow: 0 8px 32px rgba(15,23,42,0.1);
          pointer-events: none;
          animation: vcFloat 4s ease-in-out infinite;
        }
        .hero-float-card-1 {
          top: 15%; right: -20px;
          animation-delay: 0s;
        }
        .hero-float-card-2 {
          bottom: 20%; right: -30px;
          animation-delay: 2s;
        }
        @keyframes vcFloat {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-8px); }
        }
        .hero-float-label {
          font-size: 10px; font-weight: 700; letter-spacing: 0.08em;
          text-transform: uppercase; color: #9ca3af; margin-bottom: 4px;
        }
        .hero-float-value {
          font-size: 16px; font-weight: 800; color: #0f172a;
          font-family: 'Georgia', serif;
        }
        .hero-float-change {
          font-size: 11px; font-weight: 700; color: #22c55e;
        }

        @media (max-width: 1024px) {
          .hero-right { width: 340px; }
          .hero-inner { gap: 48px; }
        }
        @media (max-width: 900px) {
          .hero-inner { flex-direction: column; padding-top: 48px; padding-bottom: 48px; gap: 40px; }
          .hero-right { width: 100%; max-width: 420px; transform: none !important; }
          .hero-stats { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 480px) {
          .hero-stats { grid-template-columns: repeat(2, 1fr); }
          .hero-cta-group { flex-direction: column; align-items: flex-start; }
          .hero-cta-primary, .hero-cta-secondary { width: 100%; justify-content: center; }
        }
      `}</style>

      <section className="hero-root">
        <div className="hero-grid" />
        <div className="hero-accent-line hero-accent-line-1" />
        <div className="hero-accent-line hero-accent-line-2" />

        <div className="hero-inner">
          {/* ── Left ── */}
          <div className="hero-left">

            <div className={`hero-badge ${visible ? 'visible' : ''}`}>
              <div className="hero-badge-dot" />
              Proprietary Forensic Protocol v2.5
            </div>

            <h1 className={`hero-headline hero-headline-size ${visible ? 'visible' : ''}`}>
              Independent<br />
              Quality<br />
              <em>Auditing.</em>
            </h1>

            <p className={`hero-sub ${visible ? 'visible' : ''}`}>
              Uncover the digital anomalies silently destroying your revenue.
              Our forensic architecture scan delivers <strong>boardroom-ready intelligence</strong> in 60 seconds.
            </p>

            <div className={`hero-cta-group ${visible ? 'visible' : ''}`}>
              <button className="hero-cta-primary" onClick={() => setView('audit')}>
                Run Free Audit
                <span className="hero-cta-arrow">→</span>
              </button>
              <button className="hero-cta-secondary" onClick={() => setView('pricing')}>
                View Plans
              </button>
              <span className="hero-proof">
                <strong>✓ No credit card</strong> · Results in 60s
              </span>
            </div>

            <div className={`hero-stats ${visible ? 'visible' : ''}`}>
              {STATS.map((s, i) => (
                <div className="hero-stat" key={i}>
                  <span className="hero-stat-num">
                    <Counter target={s.value} suffix="" />
                    <em>{s.suffix}</em>
                  </span>
                  <span className="hero-stat-label">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right — Audit Card ── */}
          <div className={`hero-right ${visible ? 'visible' : ''}`}>
            <div style={{ position: 'relative' }}>
              {/* Floating card 1 */}
              <div className="hero-float-card hero-float-card-1">
                <div className="hero-float-label">Organic Traffic</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <div className="hero-float-value">+34%</div>
                  <div className="hero-float-change">↑ post-audit</div>
                </div>
              </div>

              {/* Floating card 2 */}
              <div className="hero-float-card hero-float-card-2">
                <div className="hero-float-label">Conversion Rate</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <div className="hero-float-value">+2.8x</div>
                  <div className="hero-float-change">↑ avg lift</div>
                </div>
              </div>

              <div className="hero-card">
                {/* Header */}
                <div className="hero-card-header">
                  <div>
                    <div className="hero-card-id">CASE ID: #772-B</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: 700, marginTop: 4 }}>
                      velacore.analytics
                    </div>
                  </div>
                  <div className="hero-card-status">
                    <div className="hero-card-status-dot" />
                    LIVE
                  </div>
                </div>

                {/* Score ring */}
                <div className="hero-score-ring">
                  <div className="hero-ring-wrap">
                    <svg className="hero-ring-svg" width="160" height="160" viewBox="0 0 160 160">
                      <circle className="hero-ring-bg"  cx="80" cy="80" r="65" strokeWidth="8" />
                      <circle className="hero-ring-fill" cx="80" cy="80" r="65" strokeWidth="8" />
                    </svg>
                    <div className="hero-ring-center">
                      <span className="hero-ring-score">92</span>
                      <span className="hero-ring-label">Trust Index</span>
                      <span className="hero-ring-verdict">Elite Tier</span>
                    </div>
                  </div>
                </div>

                {/* Breakdown */}
                <div className="hero-card-body">
                  <div className="hero-card-title">Score Breakdown</div>
                  {TRUST_ITEMS.map((item, i) => (
                    <div className="hero-item" key={i}>
                      <span className="hero-item-label">{item.label}</span>
                      <div className="hero-item-bar">
                        <div
                          className={`hero-item-fill ${activeItem === i ? 'active' : ''}`}
                          style={{ width: visible ? item.score + '%' : '0%' }}
                        />
                      </div>
                      <span className="hero-item-score">{item.score}</span>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="hero-card-footer">
                  <span className="hero-card-footer-text">Forensic Grade Certification</span>
                  <div className="hero-cert-badge">
                    ◆ CERTIFIED
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
