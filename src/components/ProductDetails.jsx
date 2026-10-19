import React from 'react';
import { translations } from '../translations';
import { Droplet, Leaf, Clock, Eye, Package, PenTool, BookOpen, Ban, CloudRain } from 'lucide-react';
import TiltCard from './TiltCard';
import browHeroImg from '../assets/hero1.png';

export default function ProductDetails({ lang }) {
  const t = translations[lang].productDetails;
  const isRtl = lang === 'ar';

  return (
    <section id="details" className="py-8 sm:py-16 lg:py-20 bg-white relative overflow-hidden border-y border-brand-pink/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-16">
          <div className="inline-flex items-center bg-[#F7D6DE] border border-[#edd0d7] text-brand-dark px-4 py-1.5 rounded-full text-xs font-bold tracking-wider mb-3 sm:mb-4 shadow-xs">
            {t.badge}
          </div>
          <h2 className="font-serif text-2xl sm:text-5xl text-brand-dark mb-3 sm:mb-6 leading-tight">
            {t.title}
          </h2>
          <p className="text-sm sm:text-lg text-brand-muted">
            {t.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-12 lg:gap-16 items-center mb-6 sm:mb-20">
          
          {/* Column 1: Visual Presentation */}
          <div className="relative pt-8 lg:pt-0">
            <TiltCard className="w-full aspect-square z-10">
              <div className="w-full h-full rounded-3xl overflow-hidden shadow-2xl shadow-brand-pink/20 border-4 border-white relative">
                <img src={browHeroImg} alt="Raghad Kahil Eyebrow Wax" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent to-brand-peach/40 mix-blend-overlay"></div>
              </div>
            </TiltCard>
            
            {/* Floating Badges */}
            <div className={`absolute top-4 ${isRtl ? '-right-2 lg:-right-8' : '-left-2 lg:-left-8'} z-20 bg-white/90 backdrop-blur-md px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-brand-pink/30 animate-float`}>
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                <Droplet className="w-4 h-4 text-blue-500" />
              </div>
              <span className="text-sm font-medium text-brand-dark max-w-[120px] leading-tight">{t.highlights.clear}</span>
            </div>

            <div className={`absolute bottom-10 ${isRtl ? '-right-2 lg:-right-6' : '-left-2 lg:-left-6'} z-20 bg-white/90 backdrop-blur-md px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-brand-pink/30 animate-float-delayed`}>
              <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                <Leaf className="w-4 h-4 text-green-500" />
              </div>
              <span className="text-sm font-medium text-brand-dark max-w-[120px] leading-tight">{t.highlights.vegan}</span>
            </div>

            <div className={`absolute top-1/2 -translate-y-1/2 ${isRtl ? '-left-2 lg:-left-8' : '-right-2 lg:-right-8'} z-20 bg-white/90 backdrop-blur-md px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-brand-pink/30 animate-float-fast`}>
              <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <span className="text-sm font-medium text-brand-dark max-w-[120px] leading-tight">{t.highlights.hold}</span>
            </div>

          </div>

          {/* Column 2: Specs Table */}
          <div className="flex flex-col">
            <h3 className="text-xl sm:text-2xl font-serif text-brand-dark mb-4 sm:mb-8 border-b border-brand-pink/30 pb-3 sm:pb-4">
              {t.specs.title}
            </h3>
            
            <div className="space-y-2 sm:space-y-4">
              {t.specs.items.map((item, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-6 p-2.5 sm:p-4 rounded-xl hover:bg-brand-peach/30 transition-colors">
                  <div className="sm:w-1/3 font-semibold text-brand-dark shrink-0">
                    {item.label}
                  </div>
                  <div className="sm:w-2/3 text-brand-muted leading-relaxed">
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Box Contents */}
        <div className="mb-12 sm:mb-16">
          <h3 className="text-2xl font-serif text-brand-dark text-center mb-6 sm:mb-10">{t.boxContents.title}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-brand-bg rounded-2xl p-6 border border-brand-pink/20 flex items-center gap-4 hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm text-brand-rose">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-brand-dark mb-1">{t.boxContents.items[0].title}</h4>
                <p className="text-sm text-brand-muted">{t.boxContents.items[0].desc}</p>
              </div>
            </div>
            
            <div className="bg-brand-bg rounded-2xl p-6 border border-brand-pink/20 flex items-center gap-4 hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm text-brand-rose">
                <PenTool className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-brand-dark mb-1">{t.boxContents.items[1].title}</h4>
                <p className="text-sm text-brand-muted">{t.boxContents.items[1].desc}</p>
              </div>
            </div>

            <div className="bg-brand-bg rounded-2xl p-6 border border-brand-pink/20 flex items-center gap-4 hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm text-brand-rose">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-brand-dark mb-1">{t.boxContents.items[2].title}</h4>
                <p className="text-sm text-brand-muted">{t.boxContents.items[2].desc}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Assurances Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 pt-6 sm:pt-12 border-t border-brand-pink/20">
          <div className="flex flex-col items-center text-center gap-3">
            <Ban className="w-8 h-8 text-brand-rose" />
            <span className="font-medium text-sm text-brand-dark">{t.assurances[0]}</span>
          </div>
          <div className="flex flex-col items-center text-center gap-3">
            <Ban className="w-8 h-8 text-brand-rose opacity-60" />
            <span className="font-medium text-sm text-brand-dark">{t.assurances[1]}</span>
          </div>
          <div className="flex flex-col items-center text-center gap-3">
            <Eye className="w-8 h-8 text-brand-rose" />
            <span className="font-medium text-sm text-brand-dark">{t.assurances[2]}</span>
          </div>
          <div className="flex flex-col items-center text-center gap-3">
            <CloudRain className="w-8 h-8 text-brand-rose" />
            <span className="font-medium text-sm text-brand-dark">{t.assurances[3]}</span>
          </div>
        </div>

      </div>
    </section>
  );
}
