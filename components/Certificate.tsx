
import React from 'react';
import { AuditReportData } from '../types';
import Logo from './Logo';

interface CertificateProps {
  data: AuditReportData;
}

const Certificate: React.FC<CertificateProps> = ({ data }) => {
  if (!data) return null;
  
  const url = data.overview?.websiteUrl || data.overview?.websiteName || data.overview?.url || "Verification Asset";
  const registryId = data.auditId || "VC-REG-PENDING";

  // Forensic Stamp Logic
  const ForensicStamp = () => {
    const stampColor = "#927021"; 
    
    return (
      <div className="relative w-52 h-52 select-none block">
        <svg 
          viewBox="0 0 200 200" 
          width="208"
          height="208"
          className="w-full h-full drop-shadow-xl"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <path id="topPath" d="M 25,100 A 75,75 0 1,1 175,100" fill="none" />
            <path id="bottomPath" d="M 25,100 A 75,75 0 0,0 175,100" fill="none" />
          </defs>
          <g transform="rotate(2, 100, 100)">
            <circle cx="100" cy="100" r="96" stroke={stampColor} strokeWidth="3" fill="none" />
            <circle cx="100" cy="100" r="91" stroke={stampColor} strokeWidth="0.8" fill="none" />
            <circle cx="100" cy="100" r="66" stroke={stampColor} strokeWidth="1.2" fill="none" strokeDasharray="3,2" strokeOpacity="0.4" />
            <circle cx="100" cy="100" r="63" stroke={stampColor} strokeWidth="0.5" fill="none" />
            <text fill={stampColor} style={{ fontSize: '8.5px', fontWeight: 900, fontFamily: 'sans-serif', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              <textPath href="#topPath" startOffset="50%" textAnchor="middle">
                VELACORE ANALYTICS • FORENSIC VERIFICATION
              </textPath>
            </text>
            <text fill={stampColor} style={{ fontSize: '7.8px', fontWeight: 900, fontFamily: 'sans-serif', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              <textPath href="#bottomPath" startOffset="50%" textAnchor="middle">
                SYSTEM SEALED • AI-GENERATED • TAMPER-RESISTANT
              </textPath>
            </text>
            <g transform="translate(100, 100)">
               <line x1="-38" y1="-2" x2="38" y2="-2" stroke={stampColor} strokeWidth="1" strokeOpacity="0.5" />
               <line x1="-38" y1="20" x2="38" y2="20" stroke={stampColor} strokeWidth="1" strokeOpacity="0.5" />
               <text textAnchor="middle" x="0" y="-12" style={{ fontSize: '14px', fontWeight: 950, letterSpacing: '0.08em', fontFamily: 'sans-serif' }} fill={stampColor}>
                 VERIFIED
               </text>
               <text textAnchor="middle" x="0" y="10" style={{ fontSize: '14px', fontWeight: 950, letterSpacing: '0.08em', fontFamily: 'sans-serif' }} fill={stampColor}>
                 AUDIT
               </text>
               <text textAnchor="middle" x="0" y="34" style={{ fontSize: '6px', fontWeight: 800, fontStyle: 'italic', fontFamily: 'sans-serif' }} fill={stampColor}>
                 Digitally Sealed Report
               </text>
            </g>
            <circle cx="45" cy="100" r="1.8" fill={stampColor} />
            <circle cx="155" cy="100" r="1.8" fill={stampColor} />
          </g>
        </svg>
      </div>
    );
  };

  // MANDATORY QR URL STRUCTURE
  const verifyUrl = `${window.location.origin}/?verify=${registryId}`;
  
  // ULTRA-HIGH RESOLUTION 1000x1000 QR for extreme sharpness in PDF
  const qrSource = `https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&data=${encodeURIComponent(verifyUrl)}&bgcolor=ffffff&color=000000&ecc=H&margin=4`;

  return (
    <div className="w-full flex justify-center bg-white py-4 sm:py-8 overflow-visible">
      <style>{`
        .velacore-cert-viewport {
          position: relative;
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: flex-start;
          --v-scale: 0.38;
          height: calc(1450px * var(--v-scale));
          overflow: visible;
        }

        @media (min-width: 400px) { .velacore-cert-viewport { --v-scale: 0.45; } }
        @media (min-width: 500px) { .velacore-cert-viewport { --v-scale: 0.58; } }
        @media (min-width: 640px) { .velacore-cert-viewport { --v-scale: 0.72; } }
        @media (min-width: 768px) { .velacore-cert-viewport { --v-scale: 0.88; } }
        @media (min-width: 1024px) { .velacore-cert-viewport { --v-scale: 1.0; } }

        .velacore-cert-internal-scaler {
          width: 800px;
          height: 1450px;
          transform: scale(var(--v-scale));
          transform-origin: top center;
          flex-shrink: 0;
          transition: transform 0.3s ease-out;
          box-shadow: 0 40px 80px -20px rgba(0,0,0,0.12);
        }

        .qr-render-sharp {
          image-rendering: -webkit-optimize-contrast;
          image-rendering: crisp-edges;
          image-rendering: pixelated;
        }
      `}</style>

      <div className="velacore-cert-viewport">
        <div className="velacore-cert-internal-scaler">
          <div 
            id="official-verification-certificate"
            className="relative w-[800px] h-[1450px] bg-[#FAF7ED] p-20 pb-64 text-center flex flex-col items-center box-border select-none border border-slate-200"
          >
            {/* Security Borders */}
            <div className="absolute inset-0 border-[20px] border-[#FAF7ED] z-30 pointer-events-none"></div>
            <div className="absolute inset-2 border border-[#D4AF37] border-opacity-30 z-20 pointer-events-none"></div>
            <div className="absolute inset-6 border-[3px] border-[#D4AF37] border-opacity-20 z-20 pointer-events-none"></div>
            <div className="absolute inset-[36px] border border-[#D4AF37] border-opacity-10 z-20 pointer-events-none"></div>
            <div className="absolute inset-[52px] border-[0.5px] border-[#D4AF37] border-opacity-40 z-20 pointer-events-none"></div>

            <div className="w-full flex flex-col items-center pt-8 mb-12 relative z-10">
              <div className="mb-14 flex justify-center">
                <Logo variant="formal" inverse={false} className="h-40" />
              </div>
              
              <div className="space-y-5">
                <h1 className="text-4xl font-bold text-[#0F172A] tracking-tight uppercase font-sans">
                  Official Verification Certificate
                </h1>
                <div className="flex items-center justify-center gap-6">
                  <div className="h-[1px] w-24 bg-[#D4AF37] bg-opacity-40"></div>
                  <p className="text-[10px] font-black text-[#927021] uppercase tracking-[0.6em]">
                    Audit Registry Protocol
                  </p>
                  <div className="h-[1px] w-24 bg-[#D4AF37] bg-opacity-40"></div>
                </div>
              </div>
            </div>

            <div className="w-full flex-1 flex flex-col items-center justify-between gap-12 relative z-10">
              <div className="w-full space-y-12">
                <div className="space-y-4">
                  <p className="text-[11px] font-black text-[#94A3B8] uppercase tracking-[0.5em]">Asset Under Evaluation</p>
                  <h2 className="text-4xl font-black text-[#0F172A] tracking-tighter break-all px-24 leading-tight">
                    {url}
                  </h2>
                </div>

                <div className="max-w-xl mx-auto border-y border-[#D4AF37] border-opacity-15 py-10 px-8">
                  <p className="text-[15px] text-[#334155] leading-relaxed font-medium">
                    This document serves as formal attestation that the digital asset identified above has completed a comprehensive forensic audit protocol. This certification verifies performance alignment with professional commercial standards as established by the VelaCore Analytics verification framework.
                  </p>
                </div>
              </div>

              <div className="w-[85%] flex items-stretch bg-[#FAF7ED] border border-[#D4AF37] border-opacity-30 rounded-[3rem] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.02)] min-h-[220px]">
                <div className="flex-1 flex flex-col items-center justify-center p-10 border-r border-[#D4AF37] border-opacity-20 bg-white bg-opacity-50">
                  <span className="text-[11px] font-black text-[#927021] uppercase tracking-widest mb-5">Evaluation Score</span>
                  <div className="relative">
                    <span className="text-7xl font-black text-[#0F172A] tracking-tighter leading-none">
                      {data.executiveSummary?.score ?? 0}%
                    </span>
                    <div className="absolute -bottom-2 left-0 w-full h-[3px] bg-[#D4AF37] bg-opacity-20 rounded-full"></div>
                  </div>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center p-10 bg-white bg-opacity-20">
                  <span className="text-[11px] font-black text-[#927021] uppercase tracking-widest mb-5">Market Verdict</span>
                  <span className="text-[28px] font-black text-[#0F172A] uppercase italic tracking-tighter text-center leading-[1.1] max-w-[220px]">
                    {data.executiveSummary?.verdict || "Evaluated"}
                  </span>
                </div>
              </div>

              <div className="w-full px-12 pt-16 mt-auto">
                <div className="w-full flex items-center justify-between border-t border-[#D4AF37] border-opacity-25 pt-12">
                  <div className="text-left space-y-8">
                    <div className="space-y-1.5">
                      <p className="text-[9px] font-black text-[#927021] uppercase tracking-widest">Protocol Registry ID</p>
                      <p className="font-mono text-sm font-bold text-[#0F172A] uppercase tracking-wider">{registryId}</p>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-[9px] font-black text-[#927021] uppercase tracking-widest">Issuance Timestamp</p>
                      <p className="text-sm font-bold text-[#0F172A] uppercase tracking-widest">{data.auditDate || new Date().toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-10 translate-y-2">
                    <div className="flex flex-col items-center">
                      <div className="text-[7px] font-black uppercase tracking-[0.3em] text-[#927021] mb-2">Live Verification</div>
                      {/* MANDATORY: HIGH CONTRAST QR CODE (1000x1000 for PDF precision) */}
                      <div className="w-24 h-24 p-0 border-[2px] border-slate-900 bg-white rounded-none flex items-center justify-center overflow-hidden shadow-lg ring-4 ring-slate-900/5">
                         <img src={qrSource} alt="Verification QR" className="w-full h-full p-1 qr-render-sharp" />
                      </div>
                      <span className="mt-2 text-[6px] font-black uppercase tracking-[0.2em] text-slate-400">Scan to verify audit authenticity</span>
                    </div>

                    <div className="relative flex flex-col items-center">
                      <ForensicStamp />
                      <div className="text-center mt-3">
                        <p className="text-[9px] font-black text-[#94A3B8] uppercase tracking-[0.4em] mb-0.5">Certification Authority</p>
                        <p className="text-xl font-black text-[#0F172A] italic tracking-tighter leading-none">VelaCore Analytics</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full mt-12 relative z-10 pb-12">
              <p className="text-[8px] text-[#94A3B8] font-bold uppercase tracking-[0.45em]">
                Proprietary Independent Audit Registry | Secure Document Hash: {data.verificationHash}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Certificate;
