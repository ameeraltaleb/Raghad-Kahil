import React, { useState, useEffect } from 'react';
import { ArrowRight, ArrowLeft, ArrowDown, Play, Leaf, ShieldCheck, Heart, Star } from 'lucide-react';
import { translations } from '../translations';
import hero1Img from '../assets/hero1.png';
import hero2Img from '../assets/hero2.png';
import hero3Img from '../assets/hero3.jpg';

export default function HeroSection({ lang, onWatchVideo }) {
  const t = translations[lang];
  const isRtl = lang === 'ar';
  
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  const images = [hero1Img, hero2Img, hero3Img];
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImgIndex((prev) => (prev + 1) % images.length);
    }, 5500); // 5.5s per slide for smooth slow zoom-out
    return () => clearInterval(interval);
  }, [images.length]);

  const scrollToCheckout = () => {
    document.getElementById('bundles')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-[88vh] sm:min-h-[95vh] flex flex-col justify-between overflow-hidden pt-14 sm:pt-20">
      
      {/* Background Image Carousel with Slow Zoom-Out */}
      {images.map((img, idx) => (
        <div 
          key={idx}
          className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out overflow-hidden ${
            idx === currentImgIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <img 
            src={img} 
            alt={`Raghad Kahil Banner ${idx}`} 
            className={`w-full h-full object-cover object-center ${
              idx === currentImgIndex ? 'hero-slow-zoom-out' : 'scale-115'
            }`} 
          />
        </div>
      ))}

      {/* Elegant Balanced Dark Overlay for Crystal-Clear Text & Deep Colors */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/30 to-black/55 z-10 pointer-events-none"></div>

      {/* Centered Content */}
      <div className="relative z-20 max-w-5xl mx-auto px-4 sm:px-6 flex-1 flex flex-col justify-center items-center py-6 sm:py-16 w-full text-center">
        
        <div className="flex flex-col sm:flex-row items-center gap-2.5 sm:gap-3 mb-4 sm:mb-8">
          <div className="inline-flex items-center bg-black/30 backdrop-blur-md border border-white/30 text-white px-4 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs font-bold tracking-widest uppercase shadow-md">
            {t.hero.badge}
          </div>
          {t.hero.pamperBadge && (
            <div className="inline-flex items-center bg-[#FBC6E2]/35 backdrop-blur-md border border-[#FBC6E2]/90 text-white px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-bold shadow-md animate-float">
              {t.hero.pamperBadge}
            </div>
          )}
        </div>
        
        <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-7xl tracking-tight text-white leading-tight mb-3 sm:mb-8 [text-shadow:_0_3px_16px_rgba(0,0,0,0.85)]">
          {t.hero.headline}
        </h1>
        
        <p className="text-base sm:text-xl lg:text-2xl text-white leading-relaxed mb-6 sm:mb-12 max-w-3xl [text-shadow:_0_2px_12px_rgba(0,0,0,0.85)] font-medium">
          {t.hero.subtitle}
        </p>
        
        <div className="flex flex-row items-center justify-center gap-3 sm:gap-5 mb-6 sm:mb-16 w-full sm:w-auto">
          <button 
            onClick={scrollToCheckout}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 sm:gap-3 bg-[#FBC6E2] text-brand-dark px-4 py-3 sm:px-10 sm:py-5 rounded-full font-black text-sm sm:text-xl hover:bg-[#f8b0d8] transition-all hover:scale-105 shadow-xl shadow-[#FBC6E2]/50 border-2 border-[#F3B2D4] animate-pulse-glow whitespace-nowrap"
          >
            {t.cta.orderNow}
            <ArrowIcon className="w-4 h-4 sm:w-6 sm:h-6" />
          </button>
          
          <button 
            type="button"
            id="btn-watch-video"
            aria-label={t.cta.watchVideo}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (onWatchVideo) onWatchVideo();
            }}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 sm:gap-3 text-white px-4 py-3 sm:px-10 sm:py-5 rounded-full font-bold text-sm sm:text-xl hover:bg-white/15 transition-all border-2 border-white/50 backdrop-blur-sm whitespace-nowrap cursor-pointer hover:scale-105 active:scale-95 shadow-lg relative z-30"
          >
            <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current pointer-events-none" />
            <span className="pointer-events-none">{t.cta.watchVideo}</span>
          </button>
        </div>

        {/* Read More Link */}
        <div className="pt-4 sm:pt-8 border-t border-white/20 w-full max-w-2xl mx-auto flex justify-center">
          <button 
            onClick={() => document.getElementById('details')?.scrollIntoView({ behavior: 'smooth' })}
            className="flex items-center gap-2 text-white/80 hover:text-white text-xs sm:text-sm font-medium tracking-widest uppercase transition-colors group"
          >
            <span>{t.cta.readMore}</span>
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border border-white/30 flex items-center justify-center group-hover:border-white transition-colors">
              <ArrowDown className="w-3 h-3 transform group-hover:translate-y-0.5 transition-transform" />
            </div>
          </button>
        </div>
      </div>
      
      {/* Bottom Stats Ribbon */}
      <div className="relative z-20 w-full bg-brand-dark/70 backdrop-blur-xl border-t border-white/10 py-2.5 sm:py-4 mt-4 sm:mt-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-row flex-wrap justify-center items-center gap-x-6 gap-y-2 sm:gap-12">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex text-amber-400">
              <Star className="w-5 h-5 fill-current" />
              <Star className="w-5 h-5 fill-current" />
              <Star className="w-5 h-5 fill-current" />
              <Star className="w-5 h-5 fill-current" />
              <Star className="w-5 h-5 fill-current" />
            </div>
            <span className="font-semibold text-white">{t.stats.rating}</span>
          </div>
          <div className="hidden sm:block w-1.5 h-1.5 rounded-full bg-white/30"></div>
          <div className="flex items-center gap-3">
            <span className="text-brand-peach text-xl">💖</span>
            <span className="font-semibold text-white">{t.stats.customers}</span>
          </div>
        </div>
      </div>

      {/* Scoped CSS for Slow Cinematic Zoom-Out */}
      <style>{`
        @keyframes heroSlowZoomOut {
          0% {
            transform: scale(1.15);
          }
          100% {
            transform: scale(1.0);
          }
        }

        .hero-slow-zoom-out {
          animation: heroSlowZoomOut 5.5s cubic-bezier(0.25, 1, 0.45, 1) forwards;
          will-change: transform;
        }
      `}</style>
    </section>
  );
}
