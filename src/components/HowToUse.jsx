import React from 'react';
import { Sparkles, Pipette, Smile } from 'lucide-react';
import { translations } from '../translations';
import TiltCard from './TiltCard';
import { hero3 as lifestyleImg } from '../config/media';

export default function HowToUse({ lang }) {
  const t = translations[lang].howToUse;
  const isRtl = lang === 'ar';
  
  const icons = [
    <Sparkles className="w-5 h-5 text-brand-dark" />,
    <Pipette className="w-5 h-5 text-brand-dark" />,
    <Smile className="w-5 h-5 text-brand-dark" />
  ];

  return (
    <section className="py-8 sm:py-16 lg:py-20 bg-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-brand-peach/30 to-transparent pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-12 lg:gap-16 items-center">
          
          <div>
            <div className={`mb-5 sm:mb-12 ${isRtl ? 'text-right' : 'text-left'}`}>
              <h2 className="font-serif text-2xl sm:text-5xl text-brand-dark mb-2 sm:mb-4 leading-tight">
                {t.title}
              </h2>
              <p className="text-sm sm:text-lg text-brand-muted">
                {t.subtitle}
              </p>
            </div>

            <div className="space-y-4 sm:space-y-8">
              {t.steps.map((step, index) => (
                <div key={index} className="flex gap-4 sm:gap-6 items-start group">
                  <div className="shrink-0 flex flex-col items-center">
                    <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-[#FBC6E2] text-brand-dark flex items-center justify-center border-3 sm:border-4 border-white shadow-md group-hover:scale-110 transition-transform duration-300">
                      {icons[index]}
                    </div>
                    {index !== 2 && <div className="w-0.5 h-8 sm:h-12 bg-[#FBC6E2] mt-2"></div>}
                  </div>
                  <div className="pt-1 sm:pt-2">
                    <h3 className="text-lg sm:text-xl font-serif font-medium text-brand-dark mb-1 sm:mb-2">
                      {step.title}
                    </h3>
                    <p className="text-brand-muted leading-relaxed text-xs sm:text-base">
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <TiltCard className="w-full aspect-[4/5] lg:aspect-square z-10">
              <img src={lifestyleImg} alt="Lifestyle application" className="w-full h-full object-cover rounded-[3rem] shadow-2xl shadow-brand-pink/30 border-8 border-white" />
              
              {/* Floating element for extra 3D depth */}
              <div 
                className={`absolute -bottom-6 ${isRtl ? '-right-6' : '-left-6'} bg-white p-5 rounded-2xl shadow-xl flex items-center gap-4 animate-float`} 
                style={{ transform: 'translateZ(50px)' }}
              >
                <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center shrink-0">
                  <Sparkles className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <p className="font-bold text-brand-dark text-sm">{isRtl ? 'إشراقة مرئية' : 'Visible Glow'}</p>
                  <p className="text-xs text-brand-muted">{isRtl ? 'خلال ١٤ يوماً' : 'Within 14 Days'}</p>
                </div>
              </div>
            </TiltCard>
          </div>
          
        </div>
      </div>
    </section>
  );
}
