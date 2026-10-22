import React, { useState, useEffect } from 'react';
import { translations } from '../translations';
import { Heart } from 'lucide-react';
import { hero1 as textureImg } from '../config/media';

export default function SocialProofToast({ lang }) {
  const shop = translations[lang]?.shop;
  const tFallback = translations[lang]?.socialProofToast;
  const isRtl = lang === 'ar';

  const buyersList = shop?.toast?.buyers || [
    { name: 'Sarah', city: 'Riyadh', item: 'ordered 2 jars' }
  ];
  const agoLabel = shop?.toast?.ago || 'min ago';

  const [isVisible, setIsVisible] = useState(false);
  const [buyerIndex, setBuyerIndex] = useState(0);

  useEffect(() => {
    // Show first toast after 8 seconds (less intrusive on page load)
    const initialTimer = setTimeout(() => {
      setIsVisible(true);
      // Hide after 4.5 seconds
      setTimeout(() => setIsVisible(false), 4500);
    }, 8000);

    // Then cycle every 35 seconds with random or rotating buyers
    const interval = setInterval(() => {
      setBuyerIndex((prev) => (prev + 1) % buyersList.length);
      setIsVisible(true);
      setTimeout(() => setIsVisible(false), 4500);
    }, 35000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [buyersList.length]);

  const currentBuyer = buyersList[buyerIndex] || buyersList[0];

  return (
    <div
      className={`fixed bottom-24 sm:bottom-8 ${isRtl ? 'right-4 sm:right-8' : 'left-4 sm:left-8'} z-40 transition-all duration-700 ease-in-out transform ${
        isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 opacity-0 scale-95 pointer-events-none'
      }`}
    >
      <div className="bg-white/95 backdrop-blur-md rounded-2xl p-3 pr-4 shadow-xl border border-brand-pink/30 flex items-center gap-3 animate-float max-w-xs cursor-default">
        <div className="relative shrink-0">
          <img src={textureImg} alt="Raghad Kahil" className="w-11 h-11 rounded-full object-cover shadow-sm border border-brand-peach" />
          <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-xs">
            <Heart className="w-3.5 h-3.5 text-brand-rose fill-current" />
          </div>
        </div>
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-brand-muted uppercase tracking-wider">
            <span>{currentBuyer.city}</span>
            <span>•</span>
            <span>{agoLabel}</span>
          </div>
          <span className="text-xs font-bold text-brand-dark leading-snug truncate">
            {currentBuyer.name}: <span className="font-normal text-brand-rose">{currentBuyer.item}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
