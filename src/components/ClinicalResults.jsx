import React, { useState, useRef, useEffect } from 'react';
import { translations } from '../translations';
import beforeImg from '../assets/brows-before.jpg';
import afterImg from '../assets/brows-after.jpg';

export default function ClinicalResults({ lang }) {
  const t = translations[lang].results;
  const isRtl = lang === 'ar';
  
  const [sliderPosition, setSliderPosition] = useState(50);
  const sliderRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [sliderWidth, setSliderWidth] = useState(0);

  useEffect(() => {
    if (!sliderRef.current) return;
    const el = sliderRef.current;
    const update = () => setSliderWidth(el.clientWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const handleMove = (clientX) => {
    if (!sliderRef.current || !isDragging) return;
    const rect = sliderRef.current.getBoundingClientRect();
    let x = clientX - rect.left;
    if (isRtl) {
      // In RTL, the mouse position should be inverted relative to the slider
      x = rect.width - x;
    }
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percent);
  };

  const handleMouseUp = () => setIsDragging(false);

  return (
    <section id="results" className="py-12 sm:py-16 lg:py-20 bg-brand-peach/50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
          <div className="inline-flex items-center bg-white border border-brand-pink/40 text-brand-rose px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider mb-6 shadow-sm">
            {t.badge}
          </div>
          <h2 className="font-serif text-3xl md:text-5xl text-brand-dark leading-tight">
            {t.title}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-12 items-center">
          
          {/* Stats Column */}
          <div className={`space-y-3 sm:space-y-8 ${isRtl ? 'lg:pl-8' : 'lg:pr-8'}`}>
            {t.stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm border border-brand-pink/20 flex flex-row items-center gap-4 sm:gap-6 hover:shadow-md transition-shadow text-start">
                <div className="flex-shrink-0 w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-brand-bg flex items-center justify-center border-4 border-brand-pink/30 shadow-inner">
                  <span className="text-lg sm:text-3xl font-bold text-brand-rose">{stat.percentage}</span>
                </div>
                <div className="flex flex-col justify-center flex-1 py-1">
                  <p className="text-brand-dark font-medium leading-relaxed text-sm sm:text-lg">
                    {stat.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Before / After Visual */}
          <div className="flex flex-col select-none">
            <div 
              ref={sliderRef}
              className="relative rounded-3xl overflow-hidden bg-white shadow-2xl shadow-brand-pink/20 border-4 border-white aspect-[4/3] flex cursor-ew-resize"
              onMouseDown={(e) => { setIsDragging(true); handleMove(e.clientX); }}
              onMouseMove={(e) => handleMove(e.clientX)}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={(e) => { setIsDragging(true); handleMove(e.touches[0].clientX); }}
              onTouchMove={(e) => handleMove(e.touches[0].clientX)}
              onTouchEnd={handleMouseUp}
            >
              
              {/* Full Image (After) */}
              <div className="absolute inset-0 bg-brand-peach flex items-center justify-center">
                <img 
                  src={afterImg} 
                  alt={t.beforeAfter.after} 
                  className="w-full h-full object-cover pointer-events-none"
                />
              </div>
              <div className={`absolute top-4 ${isRtl ? 'left-4' : 'right-4'} bg-brand-rose text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-md pointer-events-none z-0`}>
                {t.beforeAfter.after}
              </div>

              {/* Cropped Image (Before) */}
              <div 
                className={`absolute inset-y-0 ${isRtl ? 'right-0' : 'left-0'} overflow-hidden z-10`}
                style={{ width: `${sliderPosition}%` }}
              >
                <div className={`absolute inset-y-0 ${isRtl ? 'right-0' : 'left-0'} flex items-center justify-center`} style={{ width: sliderWidth ? `${sliderWidth}px` : '100%' }}>
                  <img 
                    src={beforeImg} 
                    alt={t.beforeAfter.before} 
                    className="w-full h-full object-cover pointer-events-none"
                  />
                </div>
              </div>
              
              <div 
                className={`absolute top-4 ${isRtl ? 'right-4' : 'left-4'} bg-white/90 backdrop-blur-sm text-brand-dark px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm pointer-events-none z-20`}
                style={{ opacity: sliderPosition > 20 ? 1 : 0, transition: 'opacity 0.2s' }}
              >
                {t.beforeAfter.before}
              </div>

              {/* Center Divider UI */}
              <div 
                className={`absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_rgba(0,0,0,0.1)] z-30 flex items-center justify-center ${isRtl ? 'translate-x-1/2' : '-translate-x-1/2'}`}
                style={{ [isRtl ? 'right' : 'left']: `${sliderPosition}%` }}
              >
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg border border-brand-pink/30">
                  <div className="flex gap-0.5">
                    <div className="w-1 h-3 border-l-2 border-gray-300"></div>
                    <div className="w-1 h-3 border-r-2 border-gray-300"></div>
                  </div>
                </div>
              </div>
              
            </div>
            
            <p className="text-center text-brand-muted text-xs mt-6 px-4">
              {t.disclaimer}
            </p>
          </div>
          
        </div>
      </div>
    </section>
  );
}
