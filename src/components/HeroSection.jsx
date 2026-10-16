import React, { useState, useEffect } from 'react';
import { ArrowRight, ArrowLeft, ArrowDown, Play, Leaf, ShieldCheck, Heart, Star } from 'lucide-react';
import { translations } from '../translations';
import hero1Img from '../assets/hero1.png';
import hero2Img from '../assets/hero2.png';
import hero3Img from '../assets/hero3.jpg';

export default function HeroSection({ lang }) {
  const t = translations[lang];
  const isRtl = lang === 'ar';
  
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  const images = [hero1Img, hero2Img, hero3Img];
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImgIndex((prev) => (prev + 1) % images.length);
    }, 4000); // Crossfade every 4 seconds
    return () => clearInterval(interval);
  }, [images.length]);

  const scrollToCheckout = () => {
    document.getElementById('bundles')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-[95vh] flex flex-col justify-between overflow-hidden pt-16 sm:pt-20">
      
      {/* Background Image Carousel */}
      {images.map((img, idx) => (
        <div 
          key={idx}
          className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
            idx === currentImgIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <img src={img} alt={`Raghad Kahil Banner ${idx}`} className="w-full h-full object-cover object-center" />
        </div>
      ))}

      {/* Dark Gradient Overlay for Text Clarity */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] z-10"></div>

      {/* Feminine Ambient Blobs */}
      <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-brand-rose/40 rounded-full blur-[100px] animate-blob"></div>
        <div className="absolute top-1/3 -right-20 w-[30rem] h-[30rem] bg-brand-pink/30 rounded-full blur-[120px] animate-blob" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Centered Content */}
      <div className="relative z-20 max-w-5xl mx-auto px-4 sm:px-6 flex-1 flex flex-col justify-center items-center py-10 sm:py-16 w-full text-center">
        
        <div className="flex flex-col sm:flex-row items-center gap-3 mb-8">
          <div className="inline-flex items-center bg-white/10 backdrop-blur-md border border-white/20 text-white px-5 py-2 rounded-full text-xs font-bold tracking-widest uppercase shadow-sm">
            {t.hero.badge}
          </div>
          {t.hero.pamperBadge && (
            <div className="inline-flex items-center bg-brand-rose/20 backdrop-blur-md border border-brand-pink/30 text-brand-peach px-4 py-2 rounded-full text-xs font-bold shadow-sm animate-float">
              {t.hero.pamperBadge}
            </div>
          )}
        </div>
        
        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-tight text-white leading-tight mb-6 sm:mb-8 drop-shadow-2xl">
          {t.hero.headline}
        </h1>
        
        <p className="text-lg sm:text-xl lg:text-2xl text-white/90 leading-relaxed mb-10 sm:mb-12 max-w-3xl drop-shadow-md font-medium">
          {t.hero.subtitle}
        </p>
        
        <div className="flex flex-row items-center justify-center gap-3 sm:gap-5 mb-12 sm:mb-16 w-full sm:w-auto">
          <button 
            onClick={scrollToCheckout}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 sm:gap-3 bg-brand-rose text-white px-4 py-3 sm:px-10 sm:py-5 rounded-full font-bold text-sm sm:text-xl hover:bg-[#a64e58] transition-all hover:scale-105 shadow-xl shadow-brand-rose/40 animate-pulse-glow whitespace-nowrap"
          >
            {t.cta.orderNow}
            <ArrowIcon className="w-4 h-4 sm:w-6 sm:h-6" />
          </button>
          
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 sm:gap-3 text-white px-4 py-3 sm:px-10 sm:py-5 rounded-full font-bold text-sm sm:text-xl hover:bg-white/10 transition-all border-2 border-white/50 backdrop-blur-sm whitespace-nowrap">
            <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
            {t.cta.watchVideo}
          </button>
        </div>

        {/* Read More Link */}
        <div className="pt-6 sm:pt-8 border-t border-white/20 w-full max-w-2xl mx-auto flex justify-center">
          <button 
            onClick={() => document.getElementById('details')?.scrollIntoView({ behavior: 'smooth' })}
            className="flex items-center gap-2 text-white/80 hover:text-white text-sm font-medium tracking-widest uppercase transition-colors group"
          >
            <span>{t.cta.readMore}</span>
            <div className="w-6 h-6 rounded-full border border-white/30 flex items-center justify-center group-hover:border-white transition-colors">
              <ArrowDown className="w-3 h-3 transform group-hover:translate-y-0.5 transition-transform" />
            </div>
          </button>
        </div>
      </div>
      
      {/* Bottom Stats Ribbon */}
      <div className="relative z-20 w-full bg-brand-dark/70 backdrop-blur-xl border-t border-white/10 py-3 sm:py-4 mt-8 sm:mt-0">
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

    </section>
  );
}
