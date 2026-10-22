import React from 'react';
import { X, CheckCircle } from 'lucide-react';
import { translations } from '../translations';
import TiltCard from './TiltCard';
import { hero2 as textureImg } from '../config/media';

export default function ProblemSolution({ lang }) {
  const t = translations[lang].problemSolution;

  return (
    <section id="benefits" className="py-8 sm:py-16 lg:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-12">
          <div className="inline-flex items-center bg-[#FBC6E2] text-brand-dark px-4 py-1.5 rounded-full text-xs font-bold tracking-wider mb-3 sm:mb-4 border border-[#F3B2D4] shadow-xs">
            {t.badge}
          </div>
          <h2 className="font-serif text-2xl sm:text-4xl text-brand-dark leading-tight">
            {t.title}
          </h2>
        </div>

        {/* Comparison Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-10 items-stretch max-w-5xl mx-auto">
          
          {/* Common Struggles Card */}
          <div className="bg-gray-50 rounded-2xl sm:rounded-3xl p-4 sm:p-8 lg:p-10 border border-gray-100 flex flex-col">
            <h3 className="text-lg sm:text-xl font-medium text-gray-500 mb-4 sm:mb-8 pb-3 sm:pb-4 border-b border-gray-200">
              {t.common.title}
            </h3>
            <ul className="space-y-3.5 sm:space-y-6 flex-1">
              {t.common.points.map((point, index) => (
                <li key={index} className="flex items-start gap-3 sm:gap-4">
                  <div className="mt-0.5 shrink-0 bg-red-100/50 p-1 rounded-full">
                    <X className="w-4 h-4 text-red-400" />
                  </div>
                  <span className="text-gray-600 leading-relaxed text-sm sm:text-base">{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Glowora Solution Card */}
          <TiltCard className="h-full">
            <div className="bg-brand-bg rounded-2xl sm:rounded-3xl ring-2 ring-[#FBC6E2] shadow-2xl shadow-[#FBC6E2]/25 flex flex-col relative overflow-hidden h-full group">
              
              {/* Texture Image Header */}
              <div className="h-32 sm:h-40 w-full relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-brand-bg z-10"></div>
                <img src={textureImg} alt="Serum Texture" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              </div>
              
              <div className="relative z-10 flex flex-col flex-1 p-4 sm:p-8 lg:p-10 pt-2">
                <div className="flex items-center justify-between mb-4 sm:mb-8 pb-3 sm:pb-4 border-b border-[#FBC6E2]/40">
                  <h3 className="text-xl sm:text-2xl font-serif text-brand-dark">
                    {t.glowora.title}
                  </h3>
                  <span className="bg-[#FBC6E2] text-brand-dark text-[11px] sm:text-xs px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full font-bold shadow-md border border-[#F3B2D4]">
                    {t.glowora.badge}
                  </span>
                </div>
                
                <ul className="space-y-3.5 sm:space-y-6 flex-1">
                  {t.glowora.points.map((point, index) => (
                    <li key={index} className="flex items-start gap-3 sm:gap-4">
                      <div className="mt-0.5 shrink-0 w-6 h-6 rounded-full bg-[#FBC6E2] flex items-center justify-center border border-[#F3B2D4]">
                        <CheckCircle className="w-4 h-4 text-brand-dark" />
                      </div>
                      <span className="text-brand-dark font-medium leading-relaxed text-sm sm:text-base">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </TiltCard>

        </div>
      </div>
    </section>
  );
}
