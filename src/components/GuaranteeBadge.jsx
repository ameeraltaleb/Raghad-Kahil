import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { translations } from '../translations';

export default function GuaranteeBadge({ lang, className = "" }) {
  const t = translations[lang].guarantee;
  
  return (
    <div className={`flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 rounded-xl bg-gradient-to-br from-amber-50 to-brand-peach/10 border border-amber-200/50 shadow-sm ${className}`}>
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-200 to-amber-400 flex items-center justify-center shrink-0 shadow-md">
        <ShieldCheck className="w-6 h-6 text-brand-dark" />
      </div>
      <div className="text-center sm:text-start">
        <h4 className="font-bold text-brand-dark text-base sm:text-lg mb-1">{t.title}</h4>
        <p className="text-xs sm:text-sm text-brand-muted leading-relaxed">
          {t.desc}
        </p>
      </div>
    </div>
  );
}
