
import React, { useState, useRef, useEffect } from 'react';
import Logo from './Logo';
import { View, User } from '../types';

interface Props {
  setView: (view: View) => void;
  activeView: View;
  user?: User | null;
}

const Navbar: React.FC<Props> = ({ setView, activeView, user }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const mainLinks = [
    { id: 'audit', label: 'Audit Engine' },
    { id: 'pricing', label: 'Pricing' },
    { id: 'vault', label: 'Vault' },
  ];

  const resourceLinks = [
    { id: 'docs', label: 'Framework & Docs', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253v13' },
    { id: 'standards', label: 'Forensic Standards', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    { id: 'branding', label: 'Identity Assets', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { id: 'privacy', label: 'Privacy Protocol', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
    { id: 'terms', label: 'Terms of Registry', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  ];

  const handleNavClick = (view: View) => {
    setView(view);
    setIsMenuOpen(false);
    setIsDropdownOpen(false);
  };

  return (
    <div className="sticky top-0 z-[60] w-full border-b border-slate-100 bg-white/95 backdrop-blur-xl">
      <nav className="w-full flex items-center justify-between px-6 md:px-12 py-1.5 md:py-2">
        <button 
          onClick={() => handleNavClick('home')} 
          className="hover:opacity-80 transition-opacity flex-shrink-0"
        >
          <Logo type="horizontal" inverse={false} className="h-12 sm:h-16 md:h-20 lg:h-22" />
        </button>
        
        <div className="hidden lg:flex items-center gap-10">
          {mainLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleNavClick(link.id as View)}
              className={`text-[9px] font-black uppercase tracking-[0.35em] transition-all duration-300 relative group whitespace-nowrap ${
                activeView === link.id ? 'text-primary' : 'text-slate-400 hover:text-primary'
              }`}
            >
              {link.label}
              <span className={`absolute -bottom-1 left-0 h-[2px] bg-accent transition-all duration-300 ${
                activeView === link.id ? 'w-full' : 'w-0 group-hover:w-full'
              }`} />
            </button>
          ))}

          <div 
            className="relative"
            onMouseEnter={() => setIsDropdownOpen(true)}
            onMouseLeave={() => setIsDropdownOpen(false)}
          >
            <button
              className={`text-[9px] font-black uppercase tracking-[0.35em] transition-all duration-300 flex items-center gap-2 ${
                resourceLinks.some(l => activeView === l.id) ? 'text-primary' : 'text-slate-400 hover:text-primary'
              }`}
            >
              Resources
              <svg className={`w-3 h-3 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <div 
              className={`absolute top-full -left-10 pt-4 transition-all duration-300 ${
                isDropdownOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'
              }`}
            >
              <div className="w-64 bg-white border border-slate-100 rounded-[2rem] shadow-[0_40px_80px_rgba(0,0,0,0.1)] p-4 overflow-hidden">
                <div className="space-y-1">
                  {resourceLinks.map((link) => (
                    <button
                      key={link.id}
                      onClick={() => handleNavClick(link.id as View)}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all group/item ${
                        activeView === link.id ? 'bg-slate-50 text-primary' : 'hover:bg-slate-50 text-slate-500 hover:text-primary'
                      }`}
                    >
                      <svg className="w-5 h-5 shrink-0 opacity-40 group-hover/item:opacity-100 group-hover/item:text-accent transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={link.icon} />
                      </svg>
                      <span className="text-[10px] font-black uppercase tracking-widest">{link.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => handleNavClick('audit')}
            className="hidden sm:block px-6 py-2.5 bg-primary text-white text-[9px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 shadow-sm rounded-xl"
          >
            Initiate Protocol
          </button>

          {user ? (
            <button 
              onClick={() => handleNavClick('profile')}
              className="flex items-center gap-3 pl-3 pr-1 py-1 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-slate-100 transition-all group"
            >
              <div className="hidden md:block text-right">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Operator</p>
                <p className="text-[10px] font-bold text-slate-900 truncate max-w-[80px]">{user.name}</p>
              </div>
              <div className="w-8 h-8 rounded-xl overflow-hidden border border-slate-200 shadow-sm group-hover:ring-2 group-hover:ring-accent/30 transition-all bg-slate-900 flex items-center justify-center">
                {user.avatar ? (
                   <img 
                    src={user.avatar} 
                    alt="Profile" 
                    className="w-full h-full object-cover" 
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      const parent = (e.target as HTMLImageElement).parentElement;
                      if (parent) parent.innerHTML = `<span class="text-[10px] font-black text-accent uppercase">${(user.name?.[0] || user.email?.[0]).toUpperCase()}</span>`;
                    }}
                  />
                ) : (
                  <span className="text-[10px] font-black text-accent uppercase">{(user.name?.[0] || user.email?.[0]).toUpperCase()}</span>
                )}
              </div>
            </button>
          ) : (
            <button 
              onClick={() => handleNavClick('auth')}
              className="px-6 py-2.5 bg-white border border-slate-200 text-slate-900 text-[9px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95 rounded-xl"
            >
              Sign In
            </button>
          )}

          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden w-10 h-10 flex flex-col items-center justify-center transition-all relative"
            aria-label="Toggle Menu"
          >
            <div className="relative w-6 h-5">
              <div className={`absolute left-0 w-6 h-[2.5px] bg-primary transition-all duration-300 rounded-full ${isMenuOpen ? 'top-1/2 -translate-y-1/2 rotate-45' : 'top-0'}`} />
              <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-6 h-[2.5px] bg-primary transition-all duration-300 rounded-full ${isMenuOpen ? 'opacity-0 scale-0' : 'opacity-100'}`} />
              <div className={`absolute left-0 w-6 h-[2.5px] bg-primary transition-all duration-300 rounded-full ${isMenuOpen ? 'top-1/2 -translate-y-1/2 -rotate-45' : 'bottom-0'}`} />
            </div>
          </button>
        </div>
      </nav>

      {isMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-b border-slate-100 shadow-2xl animate-in fade-in slide-in-from-top-4 flex flex-col p-6 space-y-2 max-h-[85vh] overflow-y-auto">
          {/* Main Navigation Section */}
          <div className="mb-4">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4 ml-4">Core Console</p>
            {mainLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id as View)}
                className={`w-full text-left py-4 px-5 text-[11px] font-black uppercase tracking-[0.2em] transition-all rounded-2xl mb-1 ${
                  activeView === link.id ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="h-px w-full bg-slate-100 my-4"></div>

          {/* Resources Section */}
          <div className="pb-6">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4 ml-4">Registry Intelligence</p>
            <div className="grid grid-cols-1 gap-2">
              {resourceLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id as View)}
                  className={`w-full flex items-center gap-5 py-4 px-5 rounded-2xl transition-all group ${
                    activeView === link.id ? 'bg-slate-50 text-primary border border-slate-100' : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <svg className={`w-5 h-5 shrink-0 ${activeView === link.id ? 'text-accent' : 'opacity-40 group-hover:opacity-100 group-hover:text-accent'} transition-all`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={link.icon} />
                  </svg>
                  <span className="text-[10px] font-black uppercase tracking-widest">{link.label}</span>
                </button>
              ))}
            </div>
          </div>
          
          <button 
            onClick={() => handleNavClick('audit')}
            className="w-full py-5 bg-accent text-primary text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl shadow-xl shadow-accent/20"
          >
            Initiate Forensic Protocol
          </button>
        </div>
      )}
    </div>
  );
};

export default Navbar;
