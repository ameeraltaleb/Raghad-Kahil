import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Volume2, VolumeX, Play, Pause, Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';
import hero2Img from '../assets/hero2.png';

export default function VideoModal({ isOpen, onClose, lang, videoSrc = '/promo.mp4' }) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showPlayPulse, setShowPlayPulse] = useState(false);

  const isRtl = lang === 'ar';
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  const ctaLabels = {
    ar: { order: 'اطلبي الآن واحصلي على الخصم ✨', pause: 'إيقاف مؤقت', play: 'تشغيل', swipeClose: 'اسحبي أو اضغطي خارجاً للإغلاق' },
    tr: { order: 'Hemen İndirimli Sipariş Ver ✨', pause: 'Duraklat', play: 'Oynat', swipeClose: 'Kapatmak için dışarı dokunun' },
    en: { order: 'Order Now with Special Offer ✨', pause: 'Pause', play: 'Play', swipeClose: 'Tap outside to close' }
  }[lang] || { order: 'Order Now with Special Offer ✨', pause: 'Pause', play: 'Play', swipeClose: 'Tap outside to close' };

  // Handle Playback, Sound & Cleanup
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setIsPlaying(true);
      setProgress(0);

      const timer = setTimeout(() => {
        if (videoRef.current) {
          try {
            if (videoRef.current.readyState > 0) {
              videoRef.current.currentTime = 0;
            }
          } catch (e) {}
          
          videoRef.current.muted = false;
          setIsMuted(false);

          const playPromise = videoRef.current.play();
          if (playPromise !== undefined) {
            playPromise.catch(() => {
              // If browser restricts unmuted autoplay, smoothly mute and play
              if (videoRef.current) {
                videoRef.current.muted = true;
                setIsMuted(true);
                videoRef.current.play().catch(() => {});
              }
            });
          }
        }
      }, 120);

      return () => clearTimeout(timer);
    } else {
      document.body.style.overflow = '';
      if (videoRef.current) {
        try {
          videoRef.current.pause();
        } catch (e) {}
      }
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Track Video Progress for Instagram-style Top Bar
  const handleTimeUpdate = () => {
    if (videoRef.current && videoRef.current.duration) {
      const current = videoRef.current.currentTime;
      const total = videoRef.current.duration;
      setProgress((current / total) * 100);
    }
  };

  // Toggle Play / Pause on video tap
  const togglePlayPause = (e) => {
    e.stopPropagation();
    if (!videoRef.current) return;

    if (videoRef.current.paused) {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }

    setShowPlayPulse(true);
    setTimeout(() => setShowPlayPulse(false), 700);
  };

  // Toggle Mute / Unmute
  const toggleMute = (e) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    const nextMuted = !videoRef.current.muted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  // Close and Scroll to Checkout
  const handleOrderClick = (e) => {
    e.stopPropagation();
    onClose();
    setTimeout(() => {
      document.getElementById('bundles')?.scrollIntoView({ behavior: 'smooth' });
    }, 150);
  };

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

  const modalContent = (
    <div 
      id="raghad-reels-modal"
      className="fixed inset-0 z-[999999] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-2xl transition-all select-none animate-fade-in"
      onClick={onClose}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Feminine Glowing Outline Container */}
      <div 
        className="relative w-full max-w-[430px] sm:w-[390px] h-[88vh] sm:h-[82vh] max-h-[820px] p-[2.5px] rounded-t-[2.5rem] sm:rounded-[2.8rem] bg-gradient-to-b from-[#FBC6E2] via-[#FCE3F0] to-[#B85C66]/60 shadow-[0_20px_80px_rgba(251,198,226,0.5),0_15px_45px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden transform transition-all duration-300 animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
        onContextMenu={(e) => e.preventDefault()}
      >
        {/* Inner Card Screen */}
        <div className="relative w-full h-full bg-black rounded-t-[2.35rem] sm:rounded-[2.65rem] overflow-hidden flex flex-col">

          {/* Instagram / Reels Top Progress Bar */}
          <div className="absolute top-2.5 inset-x-3.5 z-40 flex items-center gap-1 pointer-events-none">
            <div className="flex-1 h-1 bg-white/25 rounded-full overflow-hidden backdrop-blur-sm">
              <div 
                className="h-full bg-gradient-to-r from-[#FBC6E2] to-white rounded-full transition-all duration-100 ease-linear shadow-[0_0_8px_#FBC6E2]"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Minimalist Floating Controls (Sound & Close Only - Clean & No Clutter) */}
          <div className="absolute top-5 inset-x-3.5 z-40 flex items-center justify-between pointer-events-auto">
            {/* Sound Toggle Button */}
            <button
              type="button"
              onClick={toggleMute}
              aria-label={isMuted ? 'Unmute' : 'Mute'}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/45 hover:bg-black/70 backdrop-blur-md text-white border border-[#FBC6E2]/40 flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-md"
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-red-300" />
              ) : (
                <Volume2 className="w-4 h-4 text-[#FBC6E2]" />
              )}
            </button>

            {/* Mobile Pull Indicator (Center) */}
            <div className="sm:hidden w-10 h-1 bg-white/40 rounded-full -mt-2"></div>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/45 hover:bg-black/70 backdrop-blur-md text-white border border-[#FBC6E2]/40 flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-md"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Video Player Area */}
          <div 
            className="relative flex-1 w-full h-full cursor-pointer flex items-center justify-center bg-black overflow-hidden"
            onClick={togglePlayPause}
            onContextMenu={(e) => e.preventDefault()}
          >
            <video
              ref={videoRef}
              src={videoSrc}
              autoPlay
              loop
              playsInline
              preload="auto"
              poster={hero2Img}
              onTimeUpdate={handleTimeUpdate}
              controls={false}
              controlsList="nodownload nofullscreen noplaybackrate"
              disablePictureInPicture
              onContextMenu={(e) => e.preventDefault()}
              className="w-full h-full object-cover object-center select-none pointer-events-none"
            >
              Your browser does not support HTML5 video.
            </video>

            {/* Subtle Gradient Shadow at bottom for high-contrast CTA */}
            <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black/90 via-black/45 to-transparent pointer-events-none z-10"></div>

            {/* Play / Pause Animated Indicator Icon on Tap */}
            {(showPlayPulse || !isPlaying) && (
              <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-black/55 backdrop-blur-md border border-[#FBC6E2]/60 text-white flex items-center justify-center shadow-[0_0_30px_rgba(251,198,226,0.4)] animate-scale">
                  {!isPlaying ? (
                    <Play className="w-8 h-8 sm:w-10 sm:h-10 text-[#FBC6E2] fill-current translate-x-0.5" />
                  ) : (
                    <Pause className="w-8 h-8 sm:w-10 sm:h-10 text-[#FBC6E2] fill-current" />
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Floating Luxury Order CTA Directly Inside Video */}
          <div className="absolute bottom-4 sm:bottom-5 inset-x-4 z-30 flex flex-col items-center gap-2 pointer-events-auto">
            <button
              type="button"
              onClick={handleOrderClick}
              className="w-full py-3.5 sm:py-4 px-5 rounded-full bg-[#FBC6E2] text-brand-dark font-black text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-2xl shadow-[#FBC6E2]/60 hover:bg-[#f8b0d8] hover:scale-102 active:scale-98 transition-all border-2 border-[#F3B2D4] animate-pulse-glow"
            >
              <Sparkles className="w-4 h-4 text-brand-dark animate-sparkle" />
              <span>{ctaLabels.order}</span>
              <ArrowIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <span className="text-[11px] text-white/70 tracking-wide">
              {ctaLabels.swipeClose}
            </span>
          </div>

        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
}
