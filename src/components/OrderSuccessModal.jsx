import React from 'react';
import { Check, X, MessageCircle } from 'lucide-react';
import { translations } from '../translations';
import { WHATSAPP_PHONE, WHATSAPP_DISPLAY } from '../utils/whatsapp';

export default function OrderSuccessModal({ lang, isOpen, onClose, orderDetails }) {
  if (!isOpen || !orderDetails) return null;

  const t = translations[lang]?.successModal || translations.ar.successModal;
  const isRtl = lang === 'ar';
  
  const customMessage = lang === 'ar'
    ? `مرحباً فريق رغد كحيل 🌸\nأود متابعة طلبي رقم (${orderDetails.orderId || 'الجديد'}).\nالباقة: ${orderDetails.bundleName}\nالإجمالي: ${orderDetails.price}\nالمدينة: ${orderDetails.city || ''}\nشكراً لكم 💕`
    : lang === 'tr'
    ? `Merhaba Raghad Kahil 🌸\nSiparişim hakkında bilgi almak istiyorum (${orderDetails.orderId || 'Yeni'}).\nPaket: ${orderDetails.bundleName}\nToplam: ${orderDetails.price}\nŞehir: ${orderDetails.city || ''}\nTeşekkürler 💕`
    : `Hello Raghad Kahil 🌸\nI would like to inquire about my order (${orderDetails.orderId || 'New'}).\nBundle: ${orderDetails.bundleName}\nTotal: ${orderDetails.price}\nCity: ${orderDetails.city || ''}\nThank you 💕`;

  const waUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(customMessage)}`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-brand-dark/40 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      
      <div className="relative bg-white rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in duration-300 border border-[#F3B2D4]">
        <button 
          onClick={onClose}
          className={`absolute top-6 ${isRtl ? 'left-6' : 'right-6'} text-gray-400 hover:text-gray-600 transition-colors p-1 cursor-pointer`}
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 relative">
            <div className="absolute inset-0 bg-emerald-200 rounded-full animate-ping opacity-40"></div>
            <Check className="w-8 h-8 text-emerald-600 relative z-10" />
          </div>
          <h3 className="text-2xl font-serif font-bold text-brand-dark mb-2">
            {t.title}
          </h3>
          <p className="text-brand-muted text-xs sm:text-sm leading-relaxed">
            {t.message}
          </p>
        </div>

        <div className="bg-[#FFF5F9] rounded-2xl p-4 sm:p-5 mb-6 border border-[#F3B2D4]/50">
          <h4 className="text-xs font-bold text-brand-dark mb-3 uppercase tracking-wider">{t.orderRecap}</h4>
          <div className="space-y-2.5 text-xs sm:text-sm">
            <div className="flex justify-between">
              <span className="text-brand-muted">{t.package}</span>
              <span className="font-semibold text-brand-dark">{orderDetails.bundleName}</span>
            </div>
            {orderDetails.city && (
              <div className="flex justify-between">
                <span className="text-brand-muted">{t.city}</span>
                <span className="font-semibold text-brand-dark">{orderDetails.city}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-2.5 border-t border-[#F3B2D4]/40">
              <span className="text-brand-muted font-medium">{t.total}</span>
              <span className="font-black text-brand-dark px-2.5 py-0.5 rounded-full bg-[#FBC6E2] border border-[#F3B2D4]">{orderDetails.price}</span>
            </div>
          </div>
        </div>

        <a 
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-md shadow-emerald-600/25 cursor-pointer text-sm"
        >
          <MessageCircle className="w-5 h-5 fill-current" />
          <span>{t.supportBtn || 'تواصل معنا على واتساب'}</span>
          <span className="text-xs font-normal opacity-90 dir-ltr">({WHATSAPP_DISPLAY})</span>
        </a>
      </div>
    </div>
  );
}
