import React, { useState, useEffect } from 'react';
import { CheckCircle2, X } from 'lucide-react';
import { translations } from '../translations';
import textureImg from '../assets/hero1.png';

export default function SocialProofPopup({ lang }) {
  const t = translations[lang].socialProof;
  const isRtl = lang === 'ar';
  
  const [isVisible, setIsVisible] = useState(false);
  const [currentBuyer, setCurrentBuyer] = useState(null);

  const buyers = {
    en: [
      { name: 'Sophie T.', loc: 'London 🇬🇧', time: '4' },
      { name: 'Emma W.', loc: 'Manchester 🇬🇧', time: '12' },
      { name: 'Chloe R.', loc: 'Dublin 🇮🇪', time: '2' }
    ],
    tr: [
      { name: 'Merve K.', loc: 'İstanbul 🇹🇷', time: '2' },
      { name: 'Ayşe Y.', loc: 'Ankara 🇹🇷', time: '5' },
      { name: 'Zeynep D.', loc: 'İzmir 🇹🇷', time: '14' }
    ],
    ar: [
      { name: 'سارة العتيبي', loc: 'الرياض 🇸🇦', time: '2' },
      { name: 'مريم خ.', loc: 'دبي 🇦🇪', time: '8' },
      { name: 'شهد الفهد', loc: 'جدة 🇸🇦', time: '1' }
    ]
  };

  useEffect(() => {
    // Show first popup after 10 seconds
    let timeoutId;
    
    const showNextPopup = () => {
      const list = buyers[lang] || buyers.en;
      const randomBuyer = list[Math.floor(Math.random() * list.length)];
      setCurrentBuyer(randomBuyer);
      setIsVisible(true);
      
      // Hide after 5 seconds
      setTimeout(() => {
        setIsVisible(false);
      }, 5000);
      
      // Schedule next one between 30 and 45 seconds
      const nextDelay = Math.floor(Math.random() * (45000 - 30000 + 1) + 30000);
      timeoutId = setTimeout(showNextPopup, nextDelay);
    };

    timeoutId = setTimeout(showNextPopup, 10000);

    return () => clearTimeout(timeoutId);
  }, [lang]);

  if (!currentBuyer) return null;

  return (
    <div 
      className={`fixed bottom-4 ${isRtl ? 'right-4' : 'left-4'} z-50 transition-all duration-500 ease-out transform ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'
      }`}
    >
      <div className="bg-white rounded-xl shadow-2xl border border-gray-100 p-3 pr-8 relative flex items-center gap-3 w-72 sm:w-80">
        <button 
          onClick={() => setIsVisible(false)}
          className={`absolute top-2 ${isRtl ? 'left-2' : 'right-2'} text-gray-400 hover:text-gray-600`}
        >
          <X className="w-4 h-4" />
        </button>
        
        <img src={textureImg} alt="Product" className="w-12 h-12 rounded-lg object-cover shadow-sm shrink-0" />
        
        <div className="flex-1">
          <div className="flex items-center gap-1 mb-0.5">
            <span className="font-bold text-sm text-brand-dark">{currentBuyer.name}</span>
            <span className="text-xs text-gray-500">({currentBuyer.loc})</span>
          </div>
          <p className="text-xs text-brand-dark/80 leading-tight mb-1">
            {t.justBought}
          </p>
          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center gap-1 text-[10px] text-green-600 font-semibold bg-green-50 px-1.5 py-0.5 rounded">
              <CheckCircle2 className="w-3 h-3" />
              {t.verify}
            </div>
            <span className="text-[10px] text-gray-400">{currentBuyer.time} {t.timeAgo}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
