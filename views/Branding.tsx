
import React from 'react';

interface BrandingProps {
  onBack: () => void;
}

const Branding: React.FC<BrandingProps> = ({ onBack }) => {
  const baseUrl = "https://raw.githubusercontent.com/Jhanzeb-ali/Latest-Portfolio/8a6be08459a1d10d7f2ceebeb9505804565a1549/Images";

  const downloadAsset = async (url: string, fileName: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const downloadLink = document.createElement('a');
      downloadLink.href = blobUrl;
      downloadLink.download = `${fileName}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("VelaCore Asset Download Failed:", err);
    }
  };

  const assets = [
    { 
      title: "Primary Stacked (Dark)", 
      img: `${baseUrl}/logo-dark-vertical.png`, 
      name: "VelaCore_Primary_Dark", 
      dark: true, 
      isLarge: true 
    },
    { 
      title: "Primary Stacked (Light)", 
      img: `${baseUrl}/logo-light-vertical.png`, 
      name: "VelaCore_Primary_Light", 
      dark: false, 
      isLarge: true 
    },
    { 
      title: "Formal Signature", 
      img: `${baseUrl}/logo-dark-vertical.png`, 
      name: "VelaCore_Formal_Signature", 
      dark: true, 
      isLarge: true 
    },
    { 
      title: "Horizontal Signature", 
      img: `${baseUrl}/logo-dark-horizental.png`, 
      name: "VelaCore_Horizontal_Navy", 
      dark: true, 
      isLarge: false 
    },
    { 
      title: "Core Symbol (Dark)", 
      img: `${baseUrl}/logo-dark.png`, 
      name: "VelaCore_Icon_Dark", 
      dark: true, 
      isSquare: true 
    },
    { 
      title: "Core Symbol (Light)", 
      img: `${baseUrl}/logo-light.png`, 
      name: "VelaCore_Icon_Light", 
      dark: false, 
      isSquare: true 
    }
  ];

  const downloadAll = () => {
    assets.forEach((asset, index) => {
      setTimeout(() => downloadAsset(asset.img, asset.name), index * 300);
    });
  };

  const AssetCard = ({ title, imgUrl, name, dark = false, isLarge = false, isSquare = false }: any) => (
    <div className={`p-8 rounded-[2.5rem] border flex flex-col items-center gap-8 group transition-all duration-500 ${dark ? 'bg-[#0F172A] border-slate-800 text-white shadow-2xl shadow-slate-900/40' : 'bg-white border-slate-100 text-slate-900 shadow-xl shadow-slate-200/50'}`}>
      <div className={`text-[10px] font-black uppercase tracking-[0.3em] transition-opacity ${dark ? 'text-slate-500 group-hover:text-slate-300' : 'text-slate-400 group-hover:text-slate-600'}`}>
        {title}
      </div>
      <div className="flex-1 flex items-center justify-center min-h-[220px] w-full transform group-hover:scale-105 transition-transform duration-700 ease-out">
        <img 
          src={imgUrl} 
          alt={title} 
          className={`object-contain transition-all ${
            isLarge ? 'h-32 md:h-40' : 
            isSquare ? 'h-28 md:h-36' : 
            'h-16 md:h-20'
          }`}
        />
      </div>
      <button 
        onClick={() => downloadAsset(imgUrl, name)}
        className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${dark ? 'bg-white/5 hover:bg-white/10 text-white border border-white/10' : 'bg-slate-50 hover:bg-slate-100 text-slate-900 border border-slate-200'}`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
        Download PNG
      </button>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto py-12 md:py-24 px-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="text-center space-y-6 mb-20">
        <button 
          onClick={onBack} 
          className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 hover:text-primary mb-8 mx-auto block transition-all"
        >
          ← Return to Command
        </button>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.4em] mb-4">
          Identity Registry
        </div>
        <h1 className="text-4xl sm:text-6xl md:text-8xl font-black text-[#0F172A] tracking-tighter leading-none">
          Brand Assets & <br /> <span className="text-slate-300 italic">Visual Identity.</span>
        </h1>
        <p className="text-lg sm:text-2xl text-slate-400 max-w-3xl mx-auto font-medium leading-relaxed">
          High-fidelity signatures and symbols for the VelaCore Analytics ecosystem. Professional assets for marketing, press, and internal infrastructure.
        </p>
        <button 
          onClick={downloadAll}
          className="mt-12 bg-[#0F172A] text-white px-10 py-5 rounded-[2rem] text-sm font-black uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-2xl flex items-center gap-4 mx-auto hover:-translate-y-1 active:translate-y-0"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
          Download Entire Portfolio
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
        {assets.map((asset, index) => (
          <AssetCard 
            key={index}
            title={asset.title}
            imgUrl={asset.img}
            name={asset.name}
            dark={asset.dark}
            isLarge={asset.isLarge}
            isSquare={asset.isSquare}
          />
        ))}
      </div>

      <div className="mt-32 p-12 md:p-24 bg-slate-50 rounded-[3rem] border border-slate-100 flex flex-col md:flex-row items-center gap-16 md:gap-32">
        <div className="space-y-8 flex-1">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight uppercase">Typography & Casing</h2>
          <p className="text-slate-500 text-lg leading-relaxed font-medium">
            The brand name is strictly camel-cased as <span className="text-slate-950 font-black">VelaCore</span>. The secondary descriptor is <span className="text-slate-950 font-black italic">Analytics</span>.
          </p>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white font-black text-[10px]">✓</div>
              <span className="text-xl font-black tracking-tight">VelaCore Analytics</span>
            </div>
            <div className="flex items-center gap-4 opacity-30">
              <div className="w-6 h-6 rounded-full bg-rose-500 flex items-center justify-center text-white font-black text-[10px]">✕</div>
              <span className="text-xl font-medium line-through">VELACORE</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-6 w-full md:w-auto">
          <div className="w-32 h-32 rounded-3xl bg-[#0F172A] shadow-xl flex flex-col items-center justify-center p-4">
            <div className="w-full h-1 bg-white/20 mb-auto"></div>
            <div className="w-full h-1 bg-white/10 mb-2"></div>
            <span className="text-white text-[8px] font-black uppercase tracking-widest mt-auto">Brand Navy</span>
          </div>
          <div className="w-32 h-32 rounded-3xl bg-[#D4AF37] shadow-xl flex flex-col items-center justify-center p-4">
            <div className="w-full h-1 bg-white/20 mb-auto"></div>
            <div className="w-full h-1 bg-white/10 mb-2"></div>
            <span className="text-white text-[8px] font-black uppercase tracking-widest mt-auto">Heritage Gold</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Branding;
