import React, { useState, useEffect } from 'react';

interface LogoProps {
  className?: string;
  inverse?: boolean; // Set to true for Dark Backgrounds
  variant?: 'default' | 'formal';
  type?: 'square' | 'vertical' | 'horizontal';
  id?: string;
  forceVector?: boolean; // New: Forces instant SVG rendering
}

const Logo: React.FC<LogoProps> = ({ 
  className = "h-12", 
  inverse = false, 
  variant = 'default',
  type,
  id,
  forceVector = false
}) => {
  const logoType = type || (variant === 'formal' ? 'vertical' : 'horizontal');
  const theme = inverse ? 'dark' : 'light';
  
  const textColor = inverse ? '#FDFDFD' : '#0F172A';
  const accentColor = '#D4AF37';

  const baseUrl = "https://raw.githubusercontent.com/Jhanzeb-ali/Latest-Portfolio/8a6be08459a1d10d7f2ceebeb9505804565a1549/Images";
  
  const logoMap: Record<string, Record<string, string>> = {
    dark: {
      horizontal: `${baseUrl}/logo-dark-horizental.png`,
      vertical: `${baseUrl}/logo-dark-vertical.png`,
      square: `${baseUrl}/logo-dark.png`,
    },
    light: {
      horizontal: `${baseUrl}/logo-light-horizental.png`,
      vertical: `${baseUrl}/logo-light-vertical.png`,
      square: `${baseUrl}/logo-light.png`,
    }
  };

  const [useFallback, setUseFallback] = useState(forceVector);
  const targetUrl = logoMap[theme][logoType];

  useEffect(() => {
    if (forceVector) setUseFallback(true);
  }, [forceVector]);

  const renderVectorFallback = () => {
    if (logoType === 'square') {
      return (
        <svg id={id} viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="100" height="100" rx="24" fill={textColor} />
          {/* Refined Forensic 'V' Symbol Fallback */}
          <path d="M25 35L50 70L75 35" stroke={accentColor} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M50 50L60 35" stroke={accentColor} strokeWidth="6" strokeLinecap="round" className="opacity-40" />
        </svg>
      );
    }

    if (logoType === 'vertical') {
      return (
        <div id={id} className={`flex flex-col items-center gap-2 ${className}`}>
          <svg viewBox="0 0 100 100" className="w-12 h-12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="100" height="100" rx="20" fill={textColor} />
            <path d="M30 35L50 65L70 35" stroke={accentColor} strokeWidth="10" strokeLinecap="square" />
          </svg>
          <div className="flex flex-col items-center">
             <span style={{ color: textColor }} className="font-heading font-black italic text-xl leading-none tracking-tighter">VELACORE</span>
             <span style={{ color: accentColor }} className="font-heading font-black text-[10px] tracking-[0.4em] uppercase">ANALYTICS</span>
          </div>
        </div>
      );
    }

    return (
      <div id={id} className={`flex items-center gap-3 ${className}`}>
        <svg viewBox="0 0 100 100" className="h-full aspect-square" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="100" height="100" rx="20" fill={textColor} />
          <path d="M32 35L50 65L68 35" stroke={accentColor} strokeWidth="12" strokeLinecap="square" />
        </svg>
        <div className="flex flex-col justify-center">
          <div className="flex items-baseline">
            <span style={{ color: textColor }} className="font-heading font-black italic text-lg leading-none tracking-tighter">VELACORE</span>
            <span style={{ color: accentColor }} className="font-heading font-black italic text-lg leading-none tracking-tighter ml-1">ANALYTICS</span>
          </div>
          <span style={{ color: textColor, opacity: 0.4 }} className="text-[7px] font-black tracking-[0.5em] uppercase mt-0.5">Forensic Authority</span>
        </div>
      </div>
    );
  };

  if (useFallback) {
    return renderVectorFallback();
  }

  return (
    <img 
      src={targetUrl} 
      alt="VelaCore Analytics" 
      className={`block object-contain transition-opacity duration-300 ${className}`}
      loading="eager"
      onError={() => setUseFallback(true)}
    />
  );
};

export default Logo;