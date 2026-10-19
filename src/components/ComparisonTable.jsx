import React from 'react';
import { translations } from '../translations';
import { Check, X, Clock, Sparkles, Leaf, Feather, Droplets } from 'lucide-react';

// One icon per comparison row (same order as translations rows)
const ROW_ICONS = [Clock, Sparkles, Leaf, Feather, Droplets];

export default function ComparisonTable({ lang }) {
  const t = translations[lang].comparison;
  const shop = translations[lang].shop;
  const isRtl = lang === 'ar';
  const gloworaLabel = t.glowora.replace('✨', '').trim();
  const traditionalLabel = t.traditional.replace('❌', '').trim();
  const lastIdx = t.rows.length - 1;

  return (
    <section className="w-full max-w-6xl mx-auto py-14 sm:py-20 px-4 sm:px-6 relative isolate overflow-hidden">
      {/* Soft decorative background */}
      <div className="absolute inset-0 bg-gradient-to-b from-brand-peach/30 via-brand-bg/40 to-transparent rounded-[3rem] pointer-events-none -z-10"></div>
      <div className="absolute -top-10 start-1/2 w-72 h-72 bg-brand-pink/20 rounded-full blur-3xl pointer-events-none -z-10"></div>

      {/* Heading */}
      <div className="text-center mb-10 sm:mb-14">
        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F7D6DE] border border-[#edd0d7] text-brand-dark text-xs font-bold mb-4 shadow-xs ${isRtl ? '' : 'uppercase tracking-widest'}`}>
          <Sparkles className="w-3.5 h-3.5 text-brand-rose" />
          {shop.differenceBadge}
        </div>
        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-brand-dark leading-tight">{t.title}</h2>
        <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-gradient-to-r from-brand-pink to-brand-rose"></div>
      </div>

      {/* ================= Desktop / Tablet ================= */}
      <div className="hidden md:block max-w-5xl mx-auto">
        <div className="grid grid-cols-[1fr_1.25fr_1fr] bg-white/90 backdrop-blur rounded-[2rem] shadow-[0_20px_60px_-20px_rgba(61,27,34,0.18)] border border-brand-peach px-4 lg:px-6 pb-4">
          {/* Header row */}
          <div className={`flex items-end px-5 pb-6 pt-10 text-sm font-bold text-brand-muted ${isRtl ? '' : 'uppercase tracking-widest'}`}>
            {t.features}
          </div>
          <div className="relative -mt-6 rounded-t-[1.75rem] bg-gradient-to-b from-brand-rose to-[#c96d78] text-white flex flex-col items-center justify-end px-5 pb-6 pt-10 shadow-[0_-10px_30px_-10px_rgba(184,92,102,0.5)]">
            <span className="absolute -top-3 inset-x-0 mx-auto w-max px-3 py-1 rounded-full bg-brand-dark text-white text-[11px] font-bold tracking-wide shadow-md">
              ★ {shop.bestChoice}
            </span>
            <span className="font-serif text-2xl lg:text-3xl font-bold text-center">{gloworaLabel}</span>
          </div>
          <div className="flex items-end justify-center px-5 pb-6 pt-10 text-lg font-bold text-gray-400 text-center">
            {traditionalLabel}
          </div>

          {/* Body rows */}
          {t.rows.map((row, idx) => {
            const Icon = ROW_ICONS[idx] || Sparkles;
            const isLast = idx === lastIdx;
            const divider = !isLast ? 'border-b border-gray-100' : '';
            return (
              <React.Fragment key={idx}>
                <div className={`group flex items-center gap-4 px-5 py-6 ${divider}`}>
                  <span className="shrink-0 w-11 h-11 rounded-2xl bg-brand-peach text-brand-rose flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                    <Icon className="w-5 h-5" />
                  </span>
                  <span className="font-bold text-brand-dark text-base lg:text-lg">{row.f}</span>
                </div>

                <div className={`flex items-center gap-3 px-6 py-6 bg-gradient-to-b from-[#c96d78] to-brand-rose text-white ${!isLast ? 'border-b border-white/15' : 'rounded-b-[1.75rem] -mb-8 pb-10 shadow-[0_20px_40px_-15px_rgba(184,92,102,0.6)]'}`}>
                  <span className="shrink-0 w-8 h-8 rounded-full bg-white text-brand-rose flex items-center justify-center shadow-md">
                    <Check className="w-4 h-4" strokeWidth={3} />
                  </span>
                  <span className="font-semibold leading-snug text-[15px] lg:text-base">{row.g}</span>
                </div>

                <div className={`flex items-center gap-3 px-6 py-6 ${divider}`}>
                  <span className="shrink-0 w-8 h-8 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center">
                    <X className="w-4 h-4" strokeWidth={3} />
                  </span>
                  <span className="text-gray-500 leading-snug text-sm lg:text-[15px]">{row.t}</span>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* ================= Mobile ================= */}
      <div className="md:hidden">
        {/* Legend */}
        <div className="flex items-center justify-center gap-3 mb-6 text-xs font-bold">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-rose text-white shadow-md">
            <Check className="w-3.5 h-3.5" strokeWidth={3} /> {gloworaLabel}
          </span>
          <span className="text-gray-300">VS</span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 text-gray-500">
            <X className="w-3.5 h-3.5" strokeWidth={3} /> {traditionalLabel}
          </span>
        </div>

        <div className="space-y-4">
          {t.rows.map((row, idx) => {
            const Icon = ROW_ICONS[idx] || Sparkles;
            return (
              <div key={idx} className="bg-white rounded-3xl p-4 shadow-[0_10px_30px_-12px_rgba(61,27,34,0.15)] border border-brand-peach">
                {/* Feature title */}
                <div className="flex items-center gap-3 mb-3">
                  <span className="shrink-0 w-10 h-10 rounded-2xl bg-brand-peach text-brand-rose flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </span>
                  <h3 className="font-bold text-brand-dark text-base">{row.f}</h3>
                </div>

                {/* Glowora */}
                <div className="flex items-start gap-3 rounded-2xl bg-gradient-to-br from-brand-rose to-[#c96d78] text-white p-3.5 shadow-[0_8px_20px_-8px_rgba(184,92,102,0.6)]">
                  <span className="shrink-0 mt-0.5 w-6 h-6 rounded-full bg-white text-brand-rose flex items-center justify-center">
                    <Check className="w-3.5 h-3.5" strokeWidth={3} />
                  </span>
                  <span className="text-sm font-semibold leading-relaxed">{row.g}</span>
                </div>

                {/* Traditional */}
                <div className="flex items-start gap-3 rounded-2xl bg-gray-50 p-3.5 mt-2">
                  <span className="shrink-0 mt-0.5 w-6 h-6 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center">
                    <X className="w-3.5 h-3.5" strokeWidth={3} />
                  </span>
                  <span className="text-sm text-gray-500 leading-relaxed">{row.t}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
