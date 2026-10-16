import React, { useState, useEffect } from 'react';
import { translations } from '../translations';
import { ShoppingBag } from 'lucide-react';
import heroImg from '../assets/hero1.png';
import { calculatePricing, currencies } from '../data/checkoutData';

export default function StickyAddToCart({ lang, currency = 'USD' }) {
  const t = translations[lang].stickyBar;
  const shop = translations[lang].shop;
  const cur = currencies.find(c => c.code === currency) || currencies[0];
  const unitPrice = calculatePricing(1, cur.code).finalTotal;
  
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show when scrolled down 600px, hide otherwise
      setIsVisible(window.scrollY > 600);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToCheckout = () => {
    document.getElementById('bundles')?.scrollIntoView({ behavior: 'smooth' });
  };

  if (!isVisible) return null;

  return (
    <div className={`fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-md border-t border-brand-pink/30 shadow-[0_-10px_40px_rgba(0,0,0,0.08)] z-40 transform transition-transform duration-500 translate-y-0 sm:hidden`}>
      <div className="flex items-center justify-between p-3 px-5 gap-4">
        
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <img src={heroImg} alt="Raghad Kahil" className="w-10 h-10 rounded-full object-cover shadow-sm border border-brand-pink/20" />
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-sm text-brand-dark truncate">{shop.productName}</span>
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-brand-muted">{shop.priceLabel}:</span>
              <span className="font-bold text-xs text-brand-rose" dir="ltr">{cur.format(unitPrice)}</span>
            </div>
          </div>
        </div>

        <button 
          onClick={scrollToCheckout}
          className="flex items-center justify-center gap-2 bg-brand-rose text-white px-5 py-2.5 rounded-full font-bold text-sm shadow-md animate-pulse-glow flex-shrink-0"
        >
          <ShoppingBag className="w-4 h-4" />
          {t.buyNow}
        </button>

      </div>
    </div>
  );
}
