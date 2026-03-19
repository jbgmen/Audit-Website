import React, { useEffect, useState } from 'react';

interface Props {
  message?: string;
}

const SCAN_STEPS = [
  'Initializing forensic protocol...',
  'Crawling architecture layers...',
  'Analyzing conversion signals...',
  'Cross-referencing industry data...',
  'Generating intelligence report...',
];

export default function Loader({ message }: Props) {
  const [step,     setStep]     = useState(0);
  const [progress, setProgress] = useState(0);
  const [dots,     setDots]     = useState('');

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setStep(s => (s + 1) % SCAN_STEPS.length);
    }, 1400);
    return () => clearInterval(stepInterval);
  }, []);

  useEffect(() => {
    const prog = setInterval(() => {
      setProgress(p => {
        if (p >= 94) return 94; // never reach 100 until actual done
        return p + Math.random() * 3;
      });
    }, 200);
    return () => clearInterval(prog);
  }, []);

  useEffect(() => {
    const dot = setInterval(() => {
      setDots(d => d.length >= 3 ? '' : d + '.');
    }, 400);
    return () => clearInterval(dot);
  }, []);

  return (
    <>
      <style>{`
        .ld-root {
          position: fixed; inset: 0; z-index: 9000;
          background: #fafaf8;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 0;
        }

        /* Subtle grid */
        .ld-grid {
          position: absolute; inset: 0; pointer-events: none;
          background-image:
            linear-gradient(rgba(15,23,42,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(15,23,42,0.03) 1px, transparent 1px);
          background-size: 48px 48px;
        }

        /* Corner decorations */
        .ld-corner {
          position: absolute; width: 40px; height: 40px;
          opacity: 0.4;
        }
        .ld-corner-tl { top: 40px; left: 40px; border-top: 2px solid #0f172a; border-left: 2px solid #0f172a; border-radius: 2px 0 0 0; }
        .ld-corner-tr { top: 40px; right: 40px; border-top: 2px solid #0f172a; border-right: 2px solid #0f172a; border-radius: 0 2px 0 0; }
        .ld-corner-bl { bottom: 40px; left: 40px; border-bottom: 2px solid #0f172a; border-left: 2px solid #0f172a; border-radius: 0 0 0 2px; }
        .ld-corner-br { bottom: 40px; right: 40px; border-bottom: 2px solid #0f172a; border-right: 2px solid #0f172a; border-radius: 0 0 2px 0; }

        /* Scanning line */
        .ld-scan-line {
          position: absolute; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(212,160,23,0.6), transparent);
          animation: ldScan 3s ease-in-out infinite;
        }
        @keyframes ldScan {
          0%   { top: 20%; opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { top: 80%; opacity: 0; }
        }

        .ld-content {
          position: relative; z-index: 1;
          display: flex; flex-direction: column; align-items: center;
          gap: 0; text-align: center; width: 100%; max-width: 440px; padding: 0 24px;
        }

        /* Case ID */
        .ld-case {
          font-size: 9px; font-weight: 900; letter-spacing: 0.2em; text-transform: uppercase;
          color: #94a3b8; margin-bottom: 32px;
          display: flex; align-items: center; gap: 8px;
        }
        .ld-case-dot { width: 5px; height: 5px; border-radius: 50%; background: #22c55e; animation: ldPulse 1.5s infinite; }
        @keyframes ldPulse { 0%,100%{opacity:1} 50%{opacity:0.2} }

        /* Main shield icon */
        .ld-icon {
          width: 80px; height: 80px; margin-bottom: 28px; position: relative;
        }
        .ld-icon-ring {
          position: absolute; inset: 0;
          border: 2px solid transparent;
          border-top-color: #d4a017;
          border-right-color: rgba(212,160,23,0.3);
          border-radius: 50%;
          animation: ldSpin 1.2s linear infinite;
        }
        .ld-icon-ring-2 {
          position: absolute; inset: 8px;
          border: 1.5px solid transparent;
          border-bottom-color: #0f172a;
          border-left-color: rgba(15,23,42,0.2);
          border-radius: 50%;
          animation: ldSpin 2s linear infinite reverse;
        }
        @keyframes ldSpin { to { transform: rotate(360deg); } }
        .ld-icon-center {
          position: absolute; inset: 0;
          display: flex; align-items: center; justify-content: center;
        }

        /* Headline */
        .ld-title {
          font-family: Georgia, 'Times New Roman', serif;
          font-size: 22px; font-weight: 700; color: #0f172a;
          letter-spacing: -0.3px; line-height: 1.2; margin-bottom: 8px;
        }

        /* Step message */
        .ld-step {
          font-size: 12px; color: #64748b; font-weight: 500;
          height: 18px; margin-bottom: 32px;
          transition: opacity 0.3s;
        }

        /* Progress bar */
        .ld-progress-wrap {
          width: 100%; height: 2px; background: rgba(15,23,42,0.08);
          border-radius: 999px; overflow: hidden; margin-bottom: 14px;
        }
        .ld-progress-fill {
          height: 100%; border-radius: 999px;
          background: linear-gradient(90deg, #0f172a, #d4a017);
          transition: width 0.4s cubic-bezier(0.4,0,0.2,1);
          box-shadow: 0 0 8px rgba(212,160,23,0.5);
        }

        /* Progress label */
        .ld-progress-label {
          display: flex; justify-content: space-between; align-items: center;
          width: 100%;
        }
        .ld-progress-pct {
          font-size: 10px; font-weight: 900; color: #0f172a;
          font-family: monospace; letter-spacing: 0.05em;
        }
        .ld-progress-status {
          font-size: 9px; font-weight: 800; letter-spacing: 0.14em; text-transform: uppercase;
          color: #94a3b8;
        }

        /* Dots row */
        .ld-dots-row {
          display: flex; align-items: center; gap: 6px; margin-top: 28px;
        }
        .ld-dot {
          width: 4px; height: 4px; border-radius: 50%; background: #e2e8f0;
          transition: all 0.2s;
        }
        .ld-dot.active { background: #d4a017; transform: scale(1.4); }
      `}</style>

      <div className="ld-root">
        <div className="ld-grid"/>
        <div className="ld-scan-line"/>

        {/* Corners */}
        <div className="ld-corner ld-corner-tl"/>
        <div className="ld-corner ld-corner-tr"/>
        <div className="ld-corner ld-corner-bl"/>
        <div className="ld-corner ld-corner-br"/>

        <div className="ld-content">
          {/* Case ID */}
          <div className="ld-case">
            <div className="ld-case-dot"/>
            <span>FORENSIC SCAN IN PROGRESS</span>
          </div>

          {/* Spinning rings + icon */}
          <div className="ld-icon">
            <div className="ld-icon-ring"/>
            <div className="ld-icon-ring-2"/>
            <div className="ld-icon-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <path d="M9 12l2 2 4-4" stroke="#d4a017" strokeWidth="2"/>
              </svg>
            </div>
          </div>

          {/* Title */}
          <div className="ld-title">
            {message || 'Analyzing Target'}
          </div>

          {/* Step text */}
          <div className="ld-step">
            {SCAN_STEPS[step]}{dots}
          </div>

          {/* Progress */}
          <div className="ld-progress-wrap">
            <div className="ld-progress-fill" style={{ width: `${progress}%` }}/>
          </div>

          <div className="ld-progress-label">
            <span className="ld-progress-pct">{Math.floor(progress)}%</span>
            <span className="ld-progress-status">Protocol v2.5 Active</span>
          </div>

          {/* Step indicators */}
          <div className="ld-dots-row">
            {SCAN_STEPS.map((_, i) => (
              <div key={i} className={`ld-dot ${step === i ? 'active' : ''}`}/>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
