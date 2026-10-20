import React, { useState, useEffect } from 'react';
import logoImg from '../assets/logo.png';
import { Sparkles } from 'lucide-react';

export default function ElegantPreloader({ lang, onStartReveal }) {
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);

  const triggerReveal = () => {
    if (isFading) return;
    setIsFading(true);
    if (onStartReveal) onStartReveal();
  };

  useEffect(() => {
    // 2 seconds of signature intro animation, then start gentle luxury dissolve
    const fadeTimer = setTimeout(() => {
      triggerReveal();
    }, 2000);

    // Completely remove from DOM after gentle 1000ms dissolve
    const removeTimer = setTimeout(() => {
      setIsVisible(false);
    }, 3000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div 
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center select-none cursor-pointer overflow-hidden ${
        isFading 
          ? 'opacity-0 pointer-events-none' 
          : 'opacity-100'
      }`}
      style={{
        backgroundColor: isFading ? 'rgba(251, 198, 226, 0)' : '#FBC6E2',
        transition: 'background-color 1000ms cubic-bezier(0.16, 1, 0.3, 1), opacity 950ms cubic-bezier(0.16, 1, 0.3, 1)'
      }}
      onClick={triggerReveal}
    >
      {/* Ambient Silk Luxury Glow in the background */}
      <div className={`absolute inset-0 pointer-events-none flex items-center justify-center transition-opacity duration-700 ${isFading ? 'opacity-0' : 'opacity-100'}`}>
        <div className="w-[520px] h-[520px] bg-gradient-to-tr from-[#F8B0D7]/70 via-[#FDF0F6]/50 to-white/60 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute w-[320px] h-[320px] bg-white/60 rounded-full blur-2xl"></div>
      </div>

      {/* Floating Micro Stardust Particles */}
      <div className={`absolute inset-0 pointer-events-none overflow-hidden transition-opacity duration-500 ${isFading ? 'opacity-0' : 'opacity-100'}`}>
        <div className="absolute top-[25%] left-[20%] w-1.5 h-1.5 bg-amber-400/80 rounded-full blur-[0.5px] animate-float-particle-1"></div>
        <div className="absolute top-[35%] right-[22%] w-2 h-2 bg-[#D94B7E]/60 rounded-full blur-[0.5px] animate-float-particle-2"></div>
        <div className="absolute bottom-[30%] left-[28%] w-1 h-1 bg-amber-500/80 rounded-full animate-float-particle-3"></div>
        <div className="absolute bottom-[35%] right-[30%] w-2 h-2 bg-white/90 rounded-full animate-float-particle-1"></div>
      </div>

      {/* Center Content with gentle upward float and dissolve */}
      <div 
        className="relative z-10 flex flex-col items-center justify-center px-4 w-full max-w-sm sm:max-w-md"
        style={{
          transform: isFading ? 'translateY(-14px) scale(0.96)' : 'translateY(0) scale(1)',
          opacity: isFading ? 0 : 1,
          transition: 'transform 750ms cubic-bezier(0.16, 1, 0.3, 1), opacity 650ms ease-out'
        }}
      >
        
        {/* Animated Drawing Canvas */}
        <div className="relative w-full aspect-[672/362] max-w-[340px] sm:max-w-[420px] flex items-center justify-center drop-shadow-sm">
          
          <svg
            viewBox="0 0 672 362"
            className="w-full h-full overflow-visible"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Handwriting Drawing Mask */}
              <mask id="signatureDrawMask">
                {/* 1. Draw Raghad: 0s -> 0.70s */}
                <path
                  d="M 20 150 Q 140 105 260 145 Q 380 160 520 140"
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth="135"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="thrill-draw-raghad"
                />

                {/* 2. Draw Crown directly on top of 'd': 0.65s -> 1.15s */}
                <path
                  d="M 515 130 Q 550 50 585 45 Q 615 45 645 80"
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth="115"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="thrill-draw-crown"
                />

                {/* 3. Draw Kahil: 0.85s -> 1.45s */}
                <path
                  d="M 300 240 Q 390 230 460 250 Q 490 260 525 260"
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth="115"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="thrill-draw-kahil"
                />
              </mask>

              {/* Gold Glint Filter */}
              <filter id="goldenAuraGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Faint watermark outline (paper sketch preview) */}
            <image
              href={logoImg}
              width="672"
              height="362"
              opacity="0.08"
            />

            {/* Inked Real Logo Revealed by the Handwriting Mask */}
            <image
              href={logoImg}
              width="672"
              height="362"
              mask="url(#signatureDrawMask)"
              className="thrill-logo-image"
            />

            {/* Golden Sheen Shimmer Wave that sweeps across the whole logo once completed (1.5s -> 1.95s) */}
            <g className="thrill-sheen-sweep" mask="url(#signatureDrawMask)">
              <rect x="0" y="0" width="120" height="362" fill="url(#shimmerSheenGrad)" />
            </g>

            <defs>
              <linearGradient id="shimmerSheenGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
                <stop offset="50%" stopColor="#FDE68A" stopOpacity="0.75" />
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* 1. Sparkle Pen Nib that leads the 'Raghad' stroke (0s -> 0.70s) */}
            <g className="thrill-pen-sparkle-raghad">
              <circle cx="0" cy="0" r="4.5" fill="#F59E0B" filter="url(#goldenAuraGlow)" />
              <circle cx="0" cy="0" r="2" fill="#FFFFFF" />
            </g>

            {/* 2. Sparkle Star on Crown Peak at completion (1.05s) */}
            <g className="thrill-glint-crown">
              <path
                d="M 605 35 Q 608 43 616 43 Q 608 43 605 51 Q 602 43 594 43 Q 602 43 605 35 Z"
                fill="#F59E0B"
                filter="url(#goldenAuraGlow)"
              />
            </g>

            {/* 3. Final Signature Flourish Sparkle (1.45s) */}
            <g className="thrill-glint-flourish">
              <path
                d="M 522 265 Q 525 272 532 272 Q 525 272 522 279 Q 519 272 512 272 Q 519 272 522 265 Z"
                fill="#E11D48"
                filter="url(#goldenAuraGlow)"
              />
            </g>
          </svg>

        </div>

        {/* Thrilling Tagline with Luxury Hairline Accents */}
        <div className="flex items-center gap-3 mt-3 overflow-hidden">
          <div className="w-8 sm:w-16 h-[1.5px] bg-gradient-to-r from-transparent via-[#F3B2D4] to-brand-dark/50 animate-line-expand-thrill"></div>
          <p className="text-xs sm:text-sm tracking-[0.2em] text-brand-dark font-serif font-bold uppercase text-center animate-fade-thrill-sub">
            {lang === 'ar' ? 'الفخامة الهادئة • سر الحواجب المرفوعة' : lang === 'tr' ? 'Sade Lüks • Kusursuz Kaş Deneyimi' : 'Quiet Luxury • Effortless Brow Lift'}
          </p>
          <div className="w-8 sm:w-16 h-[1.5px] bg-gradient-to-l from-transparent via-[#F3B2D4] to-brand-dark/50 animate-line-expand-thrill"></div>
        </div>

      </div>

      {/* Thrilling Minimalist 2-Second Golden Progress Bar at the very bottom */}
      <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#F3B2D4]/60">
        <div className="h-full bg-gradient-to-r from-brand-dark via-amber-400 to-brand-dark animate-loading-bar-2s"></div>
      </div>

      {/* Scoped CSS for 2-Second Thrilling Animation Sequence */}
      <style>{`
        /* 1. Draw 'Raghad' (0s -> 0.70s) */
        .thrill-draw-raghad {
          stroke-dasharray: 600;
          stroke-dashoffset: 600;
          animation: drawRaghad 0.70s cubic-bezier(0.25, 1, 0.45, 1) forwards;
        }

        @keyframes drawRaghad {
          0% { stroke-dashoffset: 600; }
          100% { stroke-dashoffset: 0; }
        }

        /* Pen Nib Leading Sparkle for Raghad */
        .thrill-pen-sparkle-raghad {
          animation: penRideRaghad 0.70s cubic-bezier(0.25, 1, 0.45, 1) forwards;
        }

        @keyframes penRideRaghad {
          0% {
            transform: translate(25px, 150px) scale(0);
            opacity: 0;
          }
          10% {
            transform: translate(80px, 130px) scale(1.3);
            opacity: 1;
          }
          50% {
            transform: translate(280px, 145px) scale(1);
            opacity: 1;
          }
          85% {
            transform: translate(460px, 150px) scale(1.1);
            opacity: 1;
          }
          100% {
            transform: translate(520px, 140px) scale(0);
            opacity: 0;
          }
        }

        /* 2. Draw Crown directly on 'd' (0.65s -> 1.15s) */
        .thrill-draw-crown {
          stroke-dasharray: 250;
          stroke-dashoffset: 250;
          animation: drawCrown 0.50s cubic-bezier(0.3, 1, 0.5, 1) 0.65s forwards;
        }

        @keyframes drawCrown {
          0% { stroke-dashoffset: 250; }
          100% { stroke-dashoffset: 0; }
        }

        /* Crown Sparkle (Pops at 1.10s) */
        .thrill-glint-crown {
          transform-origin: 605px 43px;
          animation: popThrillGlint 0.40s ease-out 1.08s both;
        }

        /* 3. Draw 'Kahil' (0.85s -> 1.45s) */
        .thrill-draw-kahil {
          stroke-dasharray: 320;
          stroke-dashoffset: 320;
          animation: drawKahil 0.60s cubic-bezier(0.25, 1, 0.45, 1) 0.85s forwards;
        }

        @keyframes drawKahil {
          0% { stroke-dashoffset: 320; }
          100% { stroke-dashoffset: 0; }
        }

        /* Kahil Finish Flourish Sparkle (Pops at 1.45s) */
        .thrill-glint-flourish {
          transform-origin: 522px 272px;
          animation: popThrillGlint 0.45s ease-out 1.42s both;
        }

        @keyframes popThrillGlint {
          0% {
            transform: scale(0) rotate(-60deg);
            opacity: 0;
          }
          50% {
            transform: scale(1.6) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: scale(1) rotate(20deg);
            opacity: 0.95;
          }
        }

        /* Golden Sheen Sweep that travels across the whole logo once drawn (1.50s -> 1.95s) */
        .thrill-sheen-sweep {
          animation: sheenSweep 0.50s ease-in-out 1.50s both;
        }

        @keyframes sheenSweep {
          0% {
            transform: translateX(-150px) skewX(-20deg);
            opacity: 0;
          }
          30% {
            opacity: 1;
          }
          100% {
            transform: translateX(750px) skewX(-20deg);
            opacity: 0;
          }
        }

        /* Subtitle Fade & Slide in (1.20s -> 1.70s) */
        .animate-fade-thrill-sub {
          animation: fadeThrillSub 0.55s ease-out 1.20s both;
        }

        @keyframes fadeThrillSub {
          0% {
            opacity: 0;
            transform: translateY(8px);
            letter-spacing: 0.1em;
          }
          100% {
            opacity: 1;
            transform: translateY(0);
            letter-spacing: 0.2em;
          }
        }

        /* Expanding luxury lines */
        .animate-line-expand-thrill {
          animation: lineExpandThrill 0.60s ease-out 1.15s both;
        }

        @keyframes lineExpandThrill {
          0% { transform: scaleX(0); }
          100% { transform: scaleX(1); }
        }

        /* 2-Second Linear Loading Bar */
        .animate-loading-bar-2s {
          animation: loadingBar2s 2.0s cubic-bezier(0.1, 0.8, 0.2, 1) forwards;
        }

        @keyframes loadingBar2s {
          0% { width: 0%; }
          60% { width: 75%; }
          100% { width: 100%; }
        }

        /* Ambient floating particles */
        @keyframes floatPart1 {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.4; }
          50% { transform: translateY(-20px) scale(1.3); opacity: 0.9; }
        }
        @keyframes floatPart2 {
          0%, 100% { transform: translateY(0) scale(1.2); opacity: 0.3; }
          50% { transform: translateY(-15px) scale(0.8); opacity: 0.8; }
        }
        @keyframes floatPart3 {
          0%, 100% { transform: translateY(0); opacity: 0.5; }
          50% { transform: translateY(-25px); opacity: 0.9; }
        }

        .animate-float-particle-1 { animation: floatPart1 4s ease-in-out infinite; }
        .animate-float-particle-2 { animation: floatPart2 5s ease-in-out infinite 1s; }
        .animate-float-particle-3 { animation: floatPart3 3.5s ease-in-out infinite 0.5s; }
        .animate-pulse-slow { animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
      `}</style>
    </div>
  );
}
