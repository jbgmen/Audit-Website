import React from 'react';

interface BrandingProps { onBack: () => void; }

const Branding: React.FC<BrandingProps> = ({ onBack }) => {
  const baseUrl = "https://raw.githubusercontent.com/Jhanzeb-ali/Latest-Portfolio/8a6be08459a1d10d7f2ceebeb9505804565a1549/Images";

  const downloadAsset = async (url: string, fileName: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl; a.download = `${fileName}.png`;
      document.body.appendChild(a); a.click();
      document.body.removeChild(a); window.URL.revokeObjectURL(blobUrl);
    } catch (err) { console.error("VelaCore Asset Download Failed:", err); }
  };

  const assets = [
    { title: 'Primary Stacked (Dark)',   img: `${baseUrl}/logo-dark-vertical.png`,   name: 'VelaCore_Primary_Dark',      dark: true,  isLarge: true  },
    { title: 'Primary Stacked (Light)',  img: `${baseUrl}/logo-light-vertical.png`,  name: 'VelaCore_Primary_Light',     dark: false, isLarge: true  },
    { title: 'Formal Signature',         img: `${baseUrl}/logo-dark-vertical.png`,   name: 'VelaCore_Formal_Signature',  dark: true,  isLarge: true  },
    { title: 'Horizontal Signature',     img: `${baseUrl}/logo-dark-horizental.png`, name: 'VelaCore_Horizontal_Navy',   dark: true,  isLarge: false },
    { title: 'Core Symbol (Dark)',       img: `${baseUrl}/logo-dark.png`,            name: 'VelaCore_Icon_Dark',         dark: true,  isSquare: true },
    { title: 'Core Symbol (Light)',      img: `${baseUrl}/logo-light.png`,           name: 'VelaCore_Icon_Light',        dark: false, isSquare: true },
  ];

  const downloadAll = () => assets.forEach((a, i) => setTimeout(() => downloadAsset(a.img, a.name), i * 300));

  const AssetCard = ({ title, imgUrl, name, dark = false, isLarge = false, isSquare = false }: any) => (
    <div className={`p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] border flex flex-col items-center gap-5 sm:gap-8 group transition-all duration-500 hover:-translate-y-1 ${dark ? 'bg-[#0F172A] border-slate-800 text-white shadow-2xl shadow-slate-900/40' : 'bg-white border-slate-100 text-slate-900 shadow-xl shadow-slate-200/50'}`}>
      <div className={`text-[9px] sm:text-[10px] font-black uppercase tracking-[0.25em] sm:tracking-[0.3em] transition-opacity ${dark ? 'text-slate-500 group-hover:text-slate-300' : 'text-slate-400 group-hover:text-slate-600'}`}>
        {title}
      </div>
      <div className="flex-1 flex items-center justify-center min-h-[140px] sm:min-h-[200px] md:min-h-[220px] w-full transform group-hover:scale-105 transition-transform duration-700 ease-out">
        <img src={imgUrl} alt={title} className={`object-contain transition-all ${isLarge ? 'h-24 sm:h-32 md:h-40' : isSquare ? 'h-20 sm:h-28 md:h-36' : 'h-12 sm:h-16 md:h-20'}`}/>
      </div>
      <button onClick={() => downloadAsset(imgUrl, name)}
        className={`w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${dark ? 'bg-white/5 hover:bg-white/10 text-white border border-white/10' : 'bg-slate-50 hover:bg-slate-100 text-slate-900 border border-slate-200'}`}>
        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
        Download PNG
      </button>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto py-10 sm:py-16 md:py-24 px-4 sm:px-6 animate-in fade-in slide-in-from-bottom-6 duration-700">

      {/* Header */}
      <div className="text-center space-y-4 sm:space-y-6 mb-12 sm:mb-16 md:mb-20">
        <button onClick={onBack} className="flex items-center justify-center gap-2 text-[10px] sm:text-[10px] font-black uppercase tracking-[0.35em] sm:tracking-[0.4em] text-slate-400 hover:text-primary mx-auto transition-all group mb-2">
          <span className="group-hover:-translate-x-1 transition-transform inline-block">←</span> Return to Command
        </button>
        <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[#D4AF37] text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] sm:tracking-[0.4em]">
          Identity Registry
        </div>
        <h1 className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-black text-[#0F172A] tracking-tighter leading-none">
          Brand Assets &<br/> <span className="text-slate-300 italic">Visual Identity.</span>
        </h1>
        <p className="text-sm sm:text-lg md:text-2xl text-slate-400 max-w-3xl mx-auto font-medium leading-relaxed">
          High-fidelity signatures and symbols for the VelaCore Analytics ecosystem. Professional assets for marketing, press, and internal infrastructure.
        </p>
        <button onClick={downloadAll}
          className="mt-6 sm:mt-10 md:mt-12 bg-[#0F172A] text-white px-7 sm:px-10 py-4 sm:py-5 rounded-[1.5rem] sm:rounded-[2rem] text-[10px] sm:text-sm font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] hover:bg-slate-800 transition-all shadow-2xl flex items-center gap-3 sm:gap-4 mx-auto hover:-translate-y-1 active:translate-y-0 w-fit">
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
          Download Entire Portfolio
        </button>
      </div>

      {/* Asset grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8 md:gap-12">
        {assets.map((asset, i) => (
          <AssetCard key={i} title={asset.title} imgUrl={asset.img} name={asset.name} dark={asset.dark} isLarge={asset.isLarge} isSquare={(asset as any).isSquare}/>
        ))}
      </div>

      {/* Typography section */}
      <div className="mt-16 sm:mt-24 md:mt-32 p-6 sm:p-12 md:p-24 bg-slate-50 rounded-2xl sm:rounded-[3rem] border border-slate-100 flex flex-col md:flex-row items-start md:items-center gap-8 sm:gap-12 md:gap-24 lg:gap-32">
        <div className="space-y-5 sm:space-y-8 flex-1">
          <h2 className="text-xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight uppercase">Typography & Casing</h2>
          <p className="text-slate-500 text-sm sm:text-base md:text-lg leading-relaxed font-medium">
            The brand name is strictly camel-cased as <span className="text-slate-950 font-black">VelaCore</span>. The secondary descriptor is <span className="text-slate-950 font-black italic">Analytics</span>.
          </p>
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white font-black text-[9px] sm:text-[10px] shrink-0">✓</div>
              <span className="text-lg sm:text-xl font-black tracking-tight">VelaCore Analytics</span>
            </div>
            <div className="flex items-center gap-3 sm:gap-4 opacity-30">
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-rose-500 flex items-center justify-center text-white font-black text-[9px] sm:text-[10px] shrink-0">✕</div>
              <span className="text-lg sm:text-xl font-medium line-through">VELACORE</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:gap-6 w-full md:w-auto">
          {[
            { bg: 'bg-[#0F172A]', label: 'Brand Navy' },
            { bg: 'bg-[#D4AF37]', label: 'Heritage Gold' },
          ].map((color, i) => (
            <div key={i} className={`w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-2xl sm:rounded-3xl ${color.bg} shadow-xl flex flex-col items-center justify-center p-3 sm:p-4`}>
              <div className="w-full h-0.5 sm:h-1 bg-white/20 mb-auto rounded-full"/>
              <div className="w-full h-0.5 sm:h-1 bg-white/10 mb-1.5 sm:mb-2 rounded-full"/>
              <span className="text-white text-[7px] sm:text-[8px] font-black uppercase tracking-widest mt-auto text-center leading-tight">{color.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Branding;
