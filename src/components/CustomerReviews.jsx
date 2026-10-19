import React from 'react';
import { Star, CheckCircle2, Quote } from 'lucide-react';
import { translations } from '../translations';

export default function CustomerReviews({ lang }) {
  const t = translations[lang].reviews;
  const isRtl = lang === 'ar';

  return (
    <section id="reviews" className="py-8 sm:py-16 lg:py-20 bg-brand-bg relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-12">
          <div className="inline-flex items-center bg-[#FBC6E2] border border-[#F3B2D4] text-brand-dark px-4 py-1.5 rounded-full text-xs font-bold tracking-wider mb-3 sm:mb-6 shadow-xs">
            {t.badge}
          </div>
          <h2 className="font-serif text-2xl sm:text-5xl text-brand-dark mb-3 sm:mb-6 leading-tight">
            {t.title}
          </h2>
          <div className="flex items-center justify-center gap-2">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />)}
            </div>
            <span className="font-bold text-base sm:text-lg text-brand-dark">4.9/5</span>
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
          {t.items.map((review, index) => (
            <div key={index} className="bg-white rounded-2xl p-4 sm:p-8 shadow-sm border border-brand-pink/30 relative group hover:shadow-md transition-shadow flex flex-col h-full">
              <Quote className={`absolute top-4 sm:top-6 ${isRtl ? 'left-4 sm:left-6' : 'right-4 sm:right-6'} w-6 h-6 sm:w-8 sm:h-8 text-brand-peach/80 group-hover:text-brand-pink/60 transition-colors`} />
              
              <div className="flex text-yellow-400 mb-3 sm:mb-6 relative z-10">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />)}
              </div>
              
              <p className="text-brand-dark leading-relaxed mb-4 sm:mb-8 italic relative z-10 flex-1 text-sm sm:text-base">
                "{review.text}"
              </p>
              
              <div className="flex items-center gap-4 mt-auto">
                <div className="w-12 h-12 bg-brand-peach rounded-full flex items-center justify-center font-serif text-brand-rose font-bold text-xl">
                  {review.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-brand-dark text-sm">{review.name}</h4>
                  <div className="flex items-center gap-1.5 text-xs text-brand-muted mt-0.5">
                    <span>{review.location}</span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full mx-1"></span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span className="text-emerald-600 font-medium">{t.verified}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
