import React, { useState, useEffect } from 'react';
import { Clock, AlertCircle } from 'lucide-react';
import { translations } from '../translations';

export function UrgencyBar({ lang }) {
  const t = translations[lang].urgency;
  
  // Calculate a mock end time (e.g. 2 hours 45 mins from now)
  const [timeLeft, setTimeLeft] = useState({ h: 2, m: 45, s: 18 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { h, m, s } = prev;
        if (s > 0) {
          s--;
        } else {
          s = 59;
          if (m > 0) {
            m--;
          } else {
            m = 59;
            if (h > 0) h--;
          }
        }
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-[#FBC6E2] text-brand-dark text-xs sm:text-sm font-bold py-2.5 px-4 flex flex-col sm:flex-row items-center justify-center gap-2 z-50 relative border-b border-[#F3B2D4] shadow-xs">
      <span className="flex items-center gap-2">
        <Clock className="w-4 h-4 text-brand-dark animate-pulse" />
        {t.banner}
      </span>
      <div className="flex items-center gap-1 font-black">
        <span className="bg-white/90 border border-[#F3B2D4] text-brand-dark px-2 py-0.5 rounded shadow-2xs">{String(timeLeft.h).padStart(2, '0')}{t.hours}</span>
        <span>:</span>
        <span className="bg-white/90 border border-[#F3B2D4] text-brand-dark px-2 py-0.5 rounded shadow-2xs">{String(timeLeft.m).padStart(2, '0')}{t.mins}</span>
        <span>:</span>
        <span className="bg-white/90 border border-[#F3B2D4] text-brand-dark px-2 py-0.5 rounded shadow-2xs">{String(timeLeft.s).padStart(2, '0')}{t.secs}</span>
      </div>
    </div>
  );
}

export function StockScarcityBadge({ lang }) {
  const t = translations[lang].urgency;
  return (
    <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-2 rounded-lg border border-red-100 animate-pulse-slow">
      <div className="relative flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
      </div>
      <span className="font-semibold text-sm">{t.stock}</span>
    </div>
  );
}
