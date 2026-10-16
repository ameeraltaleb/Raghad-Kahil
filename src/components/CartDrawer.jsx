import React from 'react';
import { translations } from '../translations';
import { calculatePricing, currencies } from '../data/checkoutData';
import { X, ShoppingBag, Gift, ArrowRight, ArrowLeft } from 'lucide-react';
import browTextureImg from '../assets/hero1.png';

export default function CartDrawer({ lang, isOpen, onClose, quantity, currency, onProceed }) {
  const t = translations[lang].pricing;
  const shop = translations[lang].shop;
  const isRtl = lang === 'ar';
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  const currentCurrency = currencies.find(c => c.code === currency) || currencies[0];
  const pricing = calculatePricing(quantity, currency);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-brand-dark/40 backdrop-blur-sm z-[100]"
        onClick={onClose}
      ></div>

      {/* Drawer */}
      <div className={`fixed top-0 bottom-0 ${isRtl ? 'left-0' : 'right-0'} w-full sm:w-[400px] bg-white z-[110] shadow-2xl flex flex-col animate-fade-in`}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-brand-pink/30">
          <h2 className="text-xl font-serif font-bold text-brand-dark flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-brand-rose" />
            {t.cartTitle}
          </h2>
          <button onClick={onClose} className="p-2 text-brand-muted hover:text-brand-rose bg-brand-bg rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          
          {/* Product Item */}
          <div className="flex gap-4 mb-8">
            <div className="w-20 h-20 rounded-xl bg-brand-peach/30 border border-brand-pink/30 overflow-hidden shrink-0">
              <img src={browTextureImg} alt={shop.productName} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 flex flex-col justify-center">
              <h3 className="font-bold text-brand-dark">{shop.productName}</h3>
              <p className="text-sm text-brand-muted mb-2">{quantity} {t.units}</p>
              <div className="font-bold text-brand-rose" dir="ltr">
                {currentCurrency.format(pricing.originalTotal)}
              </div>
            </div>
          </div>

          {/* Pricing Details */}
          <div className="space-y-4 bg-brand-bg p-5 rounded-2xl border border-brand-pink/30">
            <div className="flex justify-between text-sm text-brand-muted">
              <span>{t.itemPrice}</span>
              <span dir="ltr">{currentCurrency.format(pricing.originalTotal / quantity)}</span>
            </div>
            
            {pricing.discountRate > 0 && (
              <div className="flex justify-between text-sm font-bold text-brand-rose">
                <span>{t.discount}</span>
                <span dir="ltr">-{currentCurrency.format(pricing.discountAmount)}</span>
              </div>
            )}
            
            <div className="flex justify-between text-lg font-bold text-brand-dark pt-4 border-t border-brand-pink/30">
              <span>{t.total}</span>
              <span dir="ltr">{currentCurrency.format(pricing.finalTotal)}</span>
            </div>
          </div>

          {/* Gifts */}
          {pricing.freeGifts.length > 0 && (
            <div className="mt-6">
              <p className="text-xs font-bold text-brand-muted uppercase tracking-widest mb-3">Included Gifts</p>
              <div className="space-y-2">
                {pricing.freeGifts.map((gift, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm text-brand-dark font-medium bg-brand-peach/40 p-3 rounded-xl border border-brand-pink/30">
                    <Gift className="w-4 h-4 text-brand-rose shrink-0" />
                    <span>{gift}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-brand-pink/30 bg-white">
          <button 
            onClick={onProceed}
            className="w-full py-4 text-lg font-bold rounded-2xl bg-brand-rose text-white hover:bg-[#a64e58] shadow-lg shadow-brand-rose/20 transition-all flex items-center justify-center gap-2"
          >
            {t.proceedToCheckout}
            <ArrowIcon className="w-5 h-5" />
          </button>
        </div>

      </div>
    </>
  );
}
