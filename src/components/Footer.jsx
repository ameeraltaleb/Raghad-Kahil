import React from 'react';
import { translations } from '../translations';
import { CreditCard, Banknote, Lock } from 'lucide-react';
import BrandLogo from './BrandLogo';

export default function Footer({ lang }) {
  const t = translations[lang].footer;
  
  return (
    <footer className="bg-brand-dark text-white py-8 sm:py-16 border-t border-brand-rose/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 sm:gap-12 mb-6 sm:mb-16">
          {/* Brand Col */}
          <div className="sm:col-span-5">
            <div className="mb-3 sm:mb-4">
              <BrandLogo isFooter={true} size="lg" />
            </div>
            <p className="text-gray-400 max-w-sm text-xs sm:text-sm leading-relaxed mb-4 sm:mb-8">
              {t.mission}
            </p>
          </div>
          
          {/* Quick Links Col */}
          <div className="sm:col-span-3">
            <h3 className="font-bold mb-3 sm:mb-6 text-brand-peach text-sm sm:text-base">{t.linksTitle}</h3>
            <ul className="space-y-2 sm:space-y-4 text-xs sm:text-sm text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">{t.privacy}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t.terms}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t.returns}</a></li>
            </ul>
          </div>
          
          {/* Payment Badges Col */}
          <div className="sm:col-span-4">
            <h3 className="font-bold mb-3 sm:mb-6 text-brand-peach text-sm sm:text-base">{t.securePayments}</h3>
            <div className="flex flex-wrap gap-2.5 sm:gap-3">
              <div className="w-11 h-7 sm:w-12 sm:h-8 bg-white/10 rounded flex items-center justify-center text-xs font-bold text-white/80">VISA</div>
              <div className="w-11 h-7 sm:w-12 sm:h-8 bg-white/10 rounded flex items-center justify-center text-xs font-bold text-white/80">MC</div>
              <div className="w-11 h-7 sm:w-12 sm:h-8 bg-white/10 rounded flex items-center justify-center text-xs font-bold text-white/80">TROY</div>
              <div className="w-11 h-7 sm:w-12 sm:h-8 bg-white/10 rounded flex items-center justify-center text-xs font-bold text-white/80">mada</div>
              <div className="w-11 h-7 sm:w-12 sm:h-8 bg-white/10 rounded flex items-center justify-center">
                <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-white/80" />
              </div>
              <div className="w-11 h-7 sm:w-12 sm:h-8 bg-white/10 rounded flex items-center justify-center">
                <Banknote className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400/80" />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 sm:pt-8 border-t border-white/10 text-center text-gray-500 text-xs sm:text-sm flex flex-col md:flex-row justify-between items-center gap-3">
          <p>{t.rights}</p>
          <a 
            href="#admin" 
            className="text-gray-600 hover:text-brand-peach/80 text-[11px] font-medium transition-colors flex items-center gap-1.5 py-1 px-2 rounded hover:bg-white/5"
            title="لوحة تحكم الإدارة"
          >
            <Lock className="w-3 h-3" />
            <span>لوحة الإدارة</span>
          </a>
        </div>
        
      </div>
    </footer>
  );
}
