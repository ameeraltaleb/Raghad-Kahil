import React from 'react';
import { Droplet, Sun, Flower, ShieldCheck } from 'lucide-react';
import { translations } from '../translations';

export default function KeyIngredients({ lang }) {
  const t = translations[lang].ingredients;

  const icons = [
    <Droplet className="w-6 h-6 text-orange-400" />,
    <Sun className="w-6 h-6 text-amber-500" />,
    <Flower className="w-6 h-6 text-brand-rose" />,
    <ShieldCheck className="w-6 h-6 text-stone-500" />
  ];

  const backgrounds = [
    'bg-[#FFF5F2] border-[#FDEEEB]', // Soft peach tint
    'bg-[#FFF9F0] border-[#FFF0D4]', // Soft warm tint
    'bg-[#FEF6F8] border-[#FBC6E2]', // Soft Baby Pink tint
    'bg-[#FAF8F8] border-[#F3EBEB]'  // Soft neutral warm tint
  ];

  const iconBackgrounds = [
    'bg-orange-100/50',
    'bg-amber-100/50',
    'bg-[#FBC6E2]/60',
    'bg-stone-200/50'
  ];

  return (
    <section id="ingredients" className="py-8 sm:py-16 lg:py-20 bg-brand-bg relative overflow-hidden">
      {/* Decorative Blob */}
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-brand-peach rounded-full blur-3xl -mr-32 opacity-50 pointer-events-none animate-blob"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-12">
          <h2 className="font-serif text-2xl sm:text-4xl text-brand-dark mb-3 sm:mb-6 leading-tight">
            {t.title}
          </h2>
          <p className="text-sm sm:text-lg text-brand-muted">
            {t.subtitle}
          </p>
        </div>

        {/* Ingredients Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {t.items.map((item, index) => (
            <div 
              key={index} 
              className={`group ${backgrounds[index]} border rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 lg:p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-xl hover:shadow-brand-pink/30 flex flex-col h-full overflow-hidden relative`}
            >
              {/* Soft hover glow inside card */}
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/40 transition-colors duration-500 pointer-events-none"></div>
              <div className="flex items-center justify-between mb-2.5 sm:mb-6">
                <div className={`w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl ${iconBackgrounds[index]} flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500`}>
                  {icons[index]}
                </div>
                <span className="text-[9px] sm:text-[10px] uppercase tracking-widest font-bold text-brand-muted bg-white/60 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full shadow-sm">
                  {item.tag}
                </span>
              </div>
              
              <h3 className="text-base sm:text-xl font-serif text-brand-dark mb-2 sm:mb-3">
                {item.name}
              </h3>
              
              <p className="text-sm text-brand-muted leading-relaxed mt-auto">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
