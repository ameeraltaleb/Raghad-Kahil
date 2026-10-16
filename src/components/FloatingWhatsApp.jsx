import React from 'react';
import { translations } from '../translations';
import { MessageCircle } from 'lucide-react';

export default function FloatingWhatsApp({ lang }) {
  const t = translations[lang].whatsapp;
  const isRtl = lang === 'ar';
  
  const phoneNumber = "1234567890"; // Placeholder for actual number
  const waUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(t.message)}`;

  return (
    <a 
      href={waUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`fixed bottom-24 sm:bottom-6 ${isRtl ? 'left-4 sm:left-6' : 'right-4 sm:right-6'} z-50 group flex items-center gap-3`}
      aria-label="WhatsApp Chat"
    >
      <div className={`absolute top-1/2 -translate-y-1/2 ${isRtl ? 'left-full ml-3' : 'right-full mr-3'} whitespace-nowrap bg-white text-gray-800 text-xs font-medium px-3 py-1.5 rounded-lg shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-300`}>
        {t.tooltip}
        {/* Tooltip Arrow */}
        <div className={`absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-white rotate-45 ${isRtl ? '-left-1' : '-right-1'}`}></div>
      </div>
      
      <div className="relative flex h-14 w-14">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-50"></span>
        <div className="relative inline-flex rounded-full h-14 w-14 bg-green-500 items-center justify-center text-white shadow-lg shadow-green-500/30 group-hover:bg-green-600 group-hover:scale-110 transition-all duration-300">
          <MessageCircle className="w-7 h-7" />
        </div>
      </div>
    </a>
  );
}
