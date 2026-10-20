import React from 'react';
import { Check, X, MessageCircle } from 'lucide-react';
import { translations } from '../translations';

export default function OrderSuccessModal({ lang, isOpen, onClose, orderDetails }) {
  if (!isOpen || !orderDetails) return null;

  const t = translations[lang].successModal;
  const isRtl = lang === 'ar';
  
  const phoneNumber = "1234567890";
  const waUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(`Hello, I want to ask about my order ${orderDetails.orderId}`)}`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-brand-dark/40 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      
      <div className="relative bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
        <button 
          onClick={onClose}
          className={`absolute top-6 ${isRtl ? 'left-6' : 'right-6'} text-gray-400 hover:text-gray-600 transition-colors`}
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 relative">
            <div className="absolute inset-0 bg-emerald-200 rounded-full animate-ping opacity-40"></div>
            <Check className="w-10 h-10 text-emerald-600 relative z-10" />
          </div>
          <h3 className="text-2xl font-serif font-bold text-brand-dark mb-3">
            {t.title}
          </h3>
          <p className="text-brand-muted text-sm leading-relaxed">
            {t.message}
          </p>
        </div>

        <div className="bg-brand-peach/30 rounded-2xl p-5 mb-8 border border-brand-pink/20">
          <h4 className="text-sm font-bold text-brand-dark mb-4 uppercase tracking-wider">{t.orderRecap}</h4>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-brand-muted">{t.package}</span>
              <span className="font-medium text-brand-dark">{orderDetails.bundleName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-muted">{t.city}</span>
              <span className="font-medium text-brand-dark">{orderDetails.city}</span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-brand-pink/30">
              <span className="text-brand-muted font-medium">{t.total}</span>
              <span className="font-black text-brand-dark px-2.5 py-0.5 rounded-full bg-[#FBC6E2] border border-[#F3B2D4]">{orderDetails.price}</span>
            </div>
          </div>
        </div>

        <a 
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 py-4 bg-green-500 text-white rounded-full font-medium hover:bg-green-600 transition-colors"
        >
          <MessageCircle className="w-5 h-5" />
          {t.supportBtn}
        </a>
      </div>
    </div>
  );
}
