import React, { useEffect, useRef } from 'react';
import { X, Play, Sparkles } from 'lucide-react';
import hero2Img from '../assets/hero2.png';

export default function VideoModal({ isOpen, onClose, lang, videoSrc = '/promo.mp4' }) {
  const videoRef = useRef(null);
  const isRtl = lang === 'ar';

  const labels = {
    ar: { title: 'فيديو المنتج الحصري', brand: 'رغد كاحل', close: 'إغلاق' },
    tr: { title: 'Özel Ürün Videosu', brand: 'Raghad Kahil', close: 'Kapat' },
    en: { title: 'Exclusive Product Video', brand: 'Raghad Kahil', close: 'Close' }
  }[lang] || { title: 'Exclusive Product Video', brand: 'Raghad Kahil', close: 'Close' };

  // Play video on open, pause on close & reset
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // Autoplay with sound might be blocked by browser; mute and retry if needed
            if (videoRef.current) {
              videoRef.current.muted = true;
              videoRef.current.play();
            }
          });
        }
      }
    } else {
      document.body.style.overflow = '';
      if (videoRef.current) {
        videoRef.current.pause();
      }
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl animate-fade-in transition-all select-none"
      onClick={onClose}
    >
      {/* Modal Dialog Card */}
      <div 
        className="relative w-full max-w-lg sm:max-w-2xl bg-brand-dark/95 border border-white/20 rounded-2xl sm:rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col transform transition-transform duration-300 scale-100 animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 bg-brand-dark border-b border-white/10 z-10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-rose animate-pulse"></span>
            <span className="font-serif font-bold text-white text-sm sm:text-base tracking-wide">
              {labels.brand} • <span className="font-sans font-normal text-xs sm:text-sm text-brand-peach/90">{labels.title}</span>
            </span>
          </div>

          <button
            onClick={onClose}
            aria-label={labels.close}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-colors border border-white/20 hover:scale-105 active:scale-95"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Video Player Container */}
        <div className="relative w-full bg-black flex items-center justify-center aspect-[9/16] sm:aspect-video max-h-[75vh] overflow-hidden">
          <video
            ref={videoRef}
            controls
            playsInline
            preload="metadata"
            poster={hero2Img}
            className="w-full h-full object-contain bg-black"
          >
            {/* Primary video source */}
            <source src={videoSrc} type="video/mp4" />
            {/* Fallback demo video for testing if user hasn't copied promo.mp4 yet */}
            <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" type="video/mp4" />
            Your browser does not support HTML5 video.
          </video>
        </div>

        {/* Modal Footer Note */}
        <div className="px-4 py-2.5 bg-black/50 border-t border-white/10 flex items-center justify-between text-[11px] text-gray-400">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-brand-rose" />
            {isRtl ? 'اضغط خارج النافذة أو Esc للإغلاق' : 'Click outside or press Esc to close'}
          </span>
          <span className="text-gray-500">1080p HD</span>
        </div>
      </div>
    </div>
  );
}
