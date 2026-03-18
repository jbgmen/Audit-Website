import React from 'react';
import { View } from '../types';
import HeroSection from '../components/HeroSection.tsx';

interface Props {
  setView: (view: View) => void;
}

const Landing: React.FC<Props> = ({ setView }) => {
  return (
    <>
      {/* New Hero — replaces old hero section */}
      <HeroSection setView={setView} />

      {/* Secondary Branding Strip */}
      <section className="bg-slate-50 border-y border-slateBorder py-12 md:py-20 relative z-10 mb-10 md:mb-20">
        <div className="container mx-auto px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 items-center opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
            <span className="font-heading font-black text-xl md:text-3xl text-center">AUDIT_PRO</span>
            <span className="font-heading font-black text-xl md:text-3xl text-center">VERIFY.IO</span>
            <span className="font-heading font-black text-xl md:text-3xl text-center">TRUST_NET</span>
            <span className="font-heading font-black text-xl md:text-3xl text-center">CORE_QUAL</span>
          </div>
        </div>
      </section>
    </>
  );
};

export default Landing;
