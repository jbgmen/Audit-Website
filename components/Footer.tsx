
import React from 'react';
import Logo from './Logo';
import { View } from '../types';

interface Props {
  setView: (view: View) => void;
}

const Footer: React.FC<Props> = ({ setView }) => {
  return (
    <footer className="bg-[#020617] text-white pt-32 pb-16 px-8 md:px-20 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-24">
          {/* Brand Identity Section */}
          <div className="lg:col-span-5 space-y-10">
            <Logo inverse={true} type="horizontal" className="h-14 md:h-16" />
            <p className="text-slate-400 font-body font-bold text-lg leading-relaxed max-w-md italic opacity-80">
              "The definitive standard for performance verification. VelaCore Analytics provides the essential truth behind digital infrastructure efficiency."
            </p>
          </div>

          {/* Navigation Columns */}
          <div className="lg:col-span-3">
            <h4 className="text-accent font-black uppercase tracking-[0.5em] text-[11px] mb-10">Protocol</h4>
            <ul className="space-y-6">
              {[
                { label: 'Audit Engine', view: 'audit' },
                { label: 'Framework', view: 'docs' },
                { label: 'Licensing', view: 'pricing' }
              ].map((item) => (
                <li key={item.label}>
                  <button 
                    onClick={() => setView(item.view as View)}
                    className="text-forensicWhite/70 hover:text-accent font-heading font-black uppercase tracking-wider text-sm transition-all duration-300"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-4">
            <h4 className="text-accent font-black uppercase tracking-[0.5em] text-[11px] mb-10">Legal & Governance</h4>
            <ul className="space-y-6">
              {[
                { label: 'Professional Standards', view: 'standards' },
                { label: 'Privacy Policy', view: 'privacy' },
                { label: 'Terms of Registry', view: 'terms' }
              ].map((item) => (
                <li key={item.label}>
                  <button 
                    onClick={() => setView(item.view as View)}
                    className="text-forensicWhite/70 hover:text-accent font-heading font-black uppercase tracking-wider text-sm transition-all duration-300"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* System Status Line */}
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
            © 2026 VELACORE ANALYTICS . REGISTRY NO. VC-8829-X
          </div>
          
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[#00FF94] rounded-full shadow-[0_0_10px_#00FF94]"></span>
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400">Systems Nominal</span>
          </div>

          <div className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 flex items-center gap-4">
            <span className="w-px h-3 bg-white/10 hidden md:block"></span>
            Global Headquarters
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
