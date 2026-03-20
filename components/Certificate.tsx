import React from 'react';
import { AuditReportData } from '../types';
import Logo from './Logo';

interface CertificateProps {
  data: AuditReportData;
}

const Certificate: React.FC<CertificateProps> = ({ data }) => {
  if (!data) return null;

  const url        = data.overview?.websiteUrl || data.overview?.websiteName || data.overview?.url || 'Verification Asset';
  const registryId = data.auditId || 'VC-REG-PENDING';

  const ForensicStamp = () => {
    const c = '#927021';
    return (
      <div className="relative w-52 h-52 select-none">
        <svg viewBox="0 0 200 200" width="208" height="208" className="w-full h-full drop-shadow-xl" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <path id="topPath"    d="M 25,100 A 75,75 0 1,1 175,100" fill="none"/>
            <path id="bottomPath" d="M 25,100 A 75,75 0 0,0 175,100" fill="none"/>
          </defs>
          <g transform="rotate(2, 100, 100)">
            <circle cx="100" cy="100" r="96" stroke={c} strokeWidth="3"   fill="none"/>
            <circle cx="100" cy="100" r="91" stroke={c} strokeWidth="0.8" fill="none"/>
            <circle cx="100" cy="100" r="66" stroke={c} strokeWidth="1.2" fill="none" strokeDasharray="3,2" strokeOpacity="0.4"/>
            <circle cx="100" cy="100" r="63" stroke={c} strokeWidth="0.5" fill="none"/>
            <text fill={c} style={{ fontSize:'8.5px', fontWeight:900, fontFamily:'sans-serif', letterSpacing:'0.12em' }}>
              <textPath href="#topPath"    startOffset="50%" textAnchor="middle">VELACORE ANALYTICS • FORENSIC VERIFICATION</textPath>
            </text>
            <text fill={c} style={{ fontSize:'7.8px', fontWeight:900, fontFamily:'sans-serif', letterSpacing:'0.08em' }}>
              <textPath href="#bottomPath" startOffset="50%" textAnchor="middle">SYSTEM SEALED • AI-GENERATED • TAMPER-RESISTANT</textPath>
            </text>
            <g transform="translate(100, 100)">
              <line x1="-38" y1="-2"  x2="38" y2="-2"  stroke={c} strokeWidth="1" strokeOpacity="0.5"/>
              <line x1="-38" y1="20"  x2="38" y2="20"  stroke={c} strokeWidth="1" strokeOpacity="0.5"/>
              <text textAnchor="middle" x="0" y="-12" style={{ fontSize:'14px', fontWeight:950, letterSpacing:'0.08em', fontFamily:'sans-serif' }} fill={c}>VERIFIED</text>
              <text textAnchor="middle" x="0" y="10"  style={{ fontSize:'14px', fontWeight:950, letterSpacing:'0.08em', fontFamily:'sans-serif' }} fill={c}>AUDIT</text>
              <text textAnchor="middle" x="0" y="34"  style={{ fontSize:'6px',  fontWeight:800, fontStyle:'italic',    fontFamily:'sans-serif' }} fill={c}>Digitally Sealed Report</text>
            </g>
            <circle cx="45"  cy="100" r="1.8" fill={c}/>
            <circle cx="155" cy="100" r="1.8" fill={c}/>
          </g>
        </svg>
      </div>
    );
  };

  const verifyUrl = `${window.location.origin}/?verify=${registryId}`;
  const qrSource  = `https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&data=${encodeURIComponent(verifyUrl)}&bgcolor=ffffff&color=000000&ecc=H&margin=4`;

  return (
    <div className="w-full flex justify-center bg-white py-4 sm:py-8 overflow-visible">
      <style>{`
        .vc-cert-vp {
          position: relative; width: 100%;
          display: flex; justify-content: center; align-items: flex-start;
          --vs: 0.38;
          height: calc(1540px * var(--vs));
          overflow: visible;
        }
        @media (min-width: 400px) { .vc-cert-vp { --vs: 0.45; } }
        @media (min-width: 500px) { .vc-cert-vp { --vs: 0.56; } }
        @media (min-width: 640px) { .vc-cert-vp { --vs: 0.70; } }
        @media (min-width: 768px) { .vc-cert-vp { --vs: 0.85; } }
        @media (min-width: 1024px){ .vc-cert-vp { --vs: 1.0;  } }

        .vc-cert-scaler {
          width: 800px; height: 1540px;
          transform: scale(var(--vs));
          transform-origin: top center;
          flex-shrink: 0;
          transition: transform 0.3s ease-out;
          box-shadow: 0 40px 80px -20px rgba(0,0,0,0.12);
        }
        .qr-sharp {
          image-rendering: -webkit-optimize-contrast;
          image-rendering: crisp-edges;
          image-rendering: pixelated;
        }
      `}</style>

      <div className="vc-cert-vp">
        <div className="vc-cert-scaler">
          <div
            id="official-verification-certificate"
            className="relative w-[800px] h-[1540px] bg-[#FAF7ED] p-20 pb-16 text-center flex flex-col items-center box-border select-none border border-slate-200"
          >
            {/* Security borders */}
            <div className="absolute inset-0        border-[20px] border-[#FAF7ED]              z-30 pointer-events-none"/>
            <div className="absolute inset-2        border border-[#D4AF37]/30                  z-20 pointer-events-none"/>
            <div className="absolute inset-6        border-[3px] border-[#D4AF37]/20            z-20 pointer-events-none"/>
            <div className="absolute inset-[36px]   border border-[#D4AF37]/10                  z-20 pointer-events-none"/>
            <div className="absolute inset-[52px]   border-[0.5px] border-[#D4AF37]/40          z-20 pointer-events-none"/>

            {/* ── Top: Logo + Title ── */}
            <div className="w-full flex flex-col items-center pt-8 mb-10 relative z-10">
              <div className="mb-12 flex justify-center">
                <Logo variant="formal" inverse={false} className="h-40"/>
              </div>
              <div className="space-y-5">
                <h1 className="text-4xl font-bold text-[#0F172A] tracking-tight uppercase font-sans">
                  Official Verification Certificate
                </h1>
                <div className="flex items-center justify-center gap-6">
                  <div className="h-px w-24 bg-[#D4AF37]/40"/>
                  <p className="text-[10px] font-black text-[#927021] uppercase tracking-[0.6em]">Audit Registry Protocol</p>
                  <div className="h-px w-24 bg-[#D4AF37]/40"/>
                </div>
              </div>
            </div>

            {/* ── Body ── */}
            <div className="w-full flex-1 flex flex-col items-center gap-10 relative z-10">

              {/* Asset name */}
              <div className="w-full space-y-4">
                <p className="text-[11px] font-black text-[#94A3B8] uppercase tracking-[0.5em]">Asset Under Evaluation</p>
                <h2 className="text-4xl font-black text-[#0F172A] tracking-tighter break-all px-16 leading-tight">{url}</h2>
              </div>

              {/* Attestation paragraph */}
              <div className="max-w-2xl w-full border-y border-[#D4AF37]/15 py-8 px-8">
                <p className="text-[15px] text-[#334155] leading-relaxed font-medium">
                  This document serves as formal attestation that the digital asset identified above has completed a comprehensive forensic audit protocol. This certification verifies performance alignment with professional commercial standards as established by the VelaCore Analytics verification framework.
                </p>
              </div>

              {/* Score + verdict — inline, no box */}
              <div className="flex items-center justify-center gap-16 py-6">
                <div className="text-center">
                  <p className="text-[10px] font-black text-[#927021] uppercase tracking-[0.5em] mb-2">Evaluation Score</p>
                  <span className="text-7xl font-black text-[#0F172A] tracking-tighter leading-none">
                    {data.executiveSummary?.score ?? 0}%
                  </span>
                </div>
                <div className="w-px h-20 bg-[#D4AF37]/30"/>
                <div className="text-center">
                  <p className="text-[10px] font-black text-[#927021] uppercase tracking-[0.5em] mb-2">Market Verdict</p>
                  <span className="text-[26px] font-black text-[#0F172A] uppercase italic tracking-tighter leading-tight max-w-[200px] block">
                    {data.executiveSummary?.verdict || 'Evaluated'}
                  </span>
                </div>
              </div>

              {/* Score breakdown rows */}
              {data.scoreBreakdown && data.scoreBreakdown.length > 0 && (
                <div className="w-[85%] border border-[#D4AF37]/15 rounded-[2rem] overflow-hidden">
                  <div className="bg-[#D4AF37]/08 px-8 py-4 border-b border-[#D4AF37]/15">
                    <p className="text-[9px] font-black text-[#927021] uppercase tracking-[0.4em]">Sectional Score Summary</p>
                  </div>
                  <div className="grid grid-cols-2 divide-x divide-y divide-[#D4AF37]/10">
                    {data.scoreBreakdown.slice(0, 6).map((cat, i) => (
                      <div key={i} className="px-6 py-4 flex items-center justify-between bg-white/30">
                        <span className="text-[10px] font-black text-[#334155] uppercase tracking-wide">{cat.label}</span>
                        <span className="text-[13px] font-black text-[#0F172A] tracking-tighter">{cat.score}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer: registry info + QR + stamp */}
              <div className="w-full px-10 mt-auto pt-8 border-t border-[#D4AF37]/25">
                <div className="flex items-end justify-between">

                  {/* Registry info */}
                  <div className="text-left space-y-6">
                    <div className="space-y-1.5">
                      <p className="text-[9px] font-black text-[#927021] uppercase tracking-widest">Protocol Registry ID</p>
                      <p className="font-mono text-sm font-bold text-[#0F172A] uppercase tracking-wider">{registryId}</p>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-[9px] font-black text-[#927021] uppercase tracking-widest">Issuance Timestamp</p>
                      <p className="text-sm font-bold text-[#0F172A] uppercase tracking-widest">
                        {data.auditDate || new Date().toLocaleDateString()}
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-[9px] font-black text-[#927021] uppercase tracking-widest">Engine Class</p>
                      <p className="text-sm font-bold text-[#0F172A] uppercase tracking-widest">{data.engineClass || 'Forensic v2.5'}</p>
                    </div>
                  </div>

                  {/* QR + Stamp */}
                  <div className="flex items-end gap-10">
                    <div className="flex flex-col items-center">
                      <div className="text-[7px] font-black uppercase tracking-[0.3em] text-[#927021] mb-2">Live Verification</div>
                      <div className="w-24 h-24 border-[2px] border-slate-900 bg-white flex items-center justify-center overflow-hidden shadow-lg ring-4 ring-slate-900/5">
                        <img src={qrSource} alt="Verification QR" className="w-full h-full p-1 qr-sharp"/>
                      </div>
                      <span className="mt-2 text-[6px] font-black uppercase tracking-[0.2em] text-slate-400">Scan to verify authenticity</span>
                    </div>

                    <div className="flex flex-col items-center">
                      <ForensicStamp/>
                      <div className="text-center mt-2">
                        <p className="text-[9px] font-black text-[#94A3B8] uppercase tracking-[0.4em] mb-0.5">Certification Authority</p>
                        <p className="text-xl font-black text-[#0F172A] italic tracking-tighter leading-none">VelaCore Analytics</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hash footer */}
              <div className="w-full relative z-10 pt-4">
                <p className="text-[8px] text-[#94A3B8] font-bold uppercase tracking-[0.45em] break-all">
                  Proprietary Independent Audit Registry | Secure Document Hash: {data.verificationHash}
                </p>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Certificate;
