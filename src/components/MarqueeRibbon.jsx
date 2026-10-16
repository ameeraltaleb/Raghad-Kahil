import React from 'react';
import { translations } from '../translations';
import { Sparkles, Heart } from 'lucide-react';

export default function MarqueeRibbon({ lang }) {
  const isRtl = lang === 'ar';
  const textItems = lang === 'ar' ? [
    'نباتي 100%', 'بدون قشور بيضاء', 'تثبيت 24 ساعة', 'مقاوم للتعرق', 'لمسة لامينيشن', 'مغذٍ ومكثف'
  ] : lang === 'tr' ? [
    '%100 Vegan', 'Beyaz Kalıntı Yok', '24 Saat Tutuş', 'Suya Dayanıklı', 'Laminasyon Etkisi', 'Besleyici'
  ] : [
    '100% Vegan', 'No White Flakes', '24H Hold', 'Sweatproof', 'Lamination Effect', 'Nourishing'
  ];

  // Duplicate items for seamless infinite scroll
  const items = [...textItems, ...textItems, ...textItems, ...textItems];

  return (
    <div dir="ltr" className="w-full bg-brand-rose text-brand-peach py-3 overflow-hidden relative border-y border-brand-pink/30 flex items-center shadow-inner z-20">
      <div className={`flex whitespace-nowrap ${isRtl ? 'animate-marquee-rtl' : 'animate-marquee'} w-max`}>
        {items.map((item, idx) => (
          <div key={idx} className={`flex items-center mx-6 gap-6 font-bold text-sm ${isRtl ? '' : 'tracking-widest uppercase'}`}>
            <span dir={isRtl ? 'rtl' : 'ltr'}>{item}</span>
            {idx % 2 === 0 ? <Sparkles className="w-4 h-4 text-brand-peach/80" /> : <Heart className="w-4 h-4 text-brand-peach/80 fill-current" />}
          </div>
        ))}
      </div>
    </div>
  );
}
