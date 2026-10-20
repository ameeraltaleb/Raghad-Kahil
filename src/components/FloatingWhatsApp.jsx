import React from 'react';
import { translations } from '../translations';
import { MessageCircle, Sparkles } from 'lucide-react';
import { WHATSAPP_PHONE, WHATSAPP_DISPLAY } from '../utils/whatsapp';

export default function FloatingWhatsApp({ lang }) {
  const t = translations[lang]?.whatsapp || translations.ar.whatsapp;
  const isRtl = lang === 'ar';
  
  const defaultText = lang === 'ar' 
    ? 'مرحباً رغد كحيل 🌸 أود الاستفسار وطلب جل وواكس الحواجب.' 
    : lang === 'tr' 
    ? 'Merhaba Raghad Kahil 🌸 Kaş Jeli hakkında bilgi ve sipariş vermek istiyorum.'
    : 'Hello Raghad Kahil 🌸 I would like to inquire about the Eyebrow Wax & Styling Gel.';

  const waUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(t.message || defaultText)}`;

  return (
    <a 
      href={waUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`fixed bottom-20 sm:bottom-6 ${isRtl ? 'left-4 sm:left-6' : 'right-4 sm:right-6'} z-50 group flex items-center gap-3`}
      aria-label="WhatsApp Order & Support"
    >
      {/* Tooltip */}
      <div className={`absolute top-1/2 -translate-y-1/2 ${isRtl ? 'left-full ml-3' : 'right-full mr-3'} whitespace-nowrap bg-white text-[#3D1B22] text-xs font-bold px-3.5 py-2 rounded-xl shadow-lg border border-[#F3B2D4] opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-300 flex items-center gap-2`}>
        <Sparkles className="w-3.5 h-3.5 text-brand-dark" />
        <span>{t.tooltip}</span>
        <span className="text-[10px] text-brand-muted dir-ltr">({WHATSAPP_DISPLAY})</span>
        {/* Tooltip Arrow */}
        <div className={`absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-white border-b border-r border-[#F3B2D4] rotate-45 ${isRtl ? '-left-1' : '-right-1'}`}></div>
      </div>
      
      {/* Button & Ring */}
      <div className="relative flex h-14 w-14">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60"></span>
        <div className="relative inline-flex rounded-full h-14 w-14 bg-gradient-to-tr from-emerald-600 to-emerald-400 items-center justify-center text-white shadow-xl shadow-emerald-500/30 group-hover:scale-110 transition-all duration-300 border-2 border-white">
          <MessageCircle className="w-7 h-7 fill-current" />
        </div>
      </div>
    </a>
  );
}
