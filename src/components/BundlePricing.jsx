import React, { useState } from 'react';
import { translations } from '../translations';
import { calculatePricing, currencies } from '../data/checkoutData';
import { Plus, Minus, ShoppingBag, Star, Check, Gift, Truck, ShieldCheck, Lock } from 'lucide-react';
import hero1Img from '../assets/hero1.png';
import hero2Img from '../assets/hero2.png';
import hero3Img from '../assets/hero3.jpg';
import GuaranteeBadge from './GuaranteeBadge';

const BUNDLE_QTYS = [1, 2, 3];

export default function BundlePricing({ lang, quantity, setQuantity, currency, setCurrency, onAddToCart }) {
  const t = translations[lang].pricing;
  const shop = translations[lang].shop;
  const isRtl = lang === 'ar';

  const currentCurrency = currencies.find(c => c.code === currency) || currencies[0];
  const pricing = calculatePricing(quantity, currentCurrency.code);

  const [activeImage, setActiveImage] = useState(hero1Img);
  const gallery = [hero1Img, hero2Img, hero3Img];

  const bundleLabel = { 1: shop.bundles.one, 2: shop.bundles.two, 3: shop.bundles.three };
  const bundleTag = { 2: shop.bundles.popular, 3: shop.bundles.bestValue };

  const handleIncrement = () => setQuantity(q => q + 1);
  const handleDecrement = () => setQuantity(q => Math.max(1, q - 1));

  return (
    <section id="bundles" className="py-12 sm:py-16 lg:py-20 bg-brand-bg relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-start">

          {/* Image Gallery */}
          <div className="flex flex-col gap-3 sm:gap-4 md:sticky md:top-24">
            <div className="w-full aspect-square rounded-2xl sm:rounded-3xl overflow-hidden bg-brand-peach/30 border border-brand-pink/20">
              <img src={activeImage} alt={shop.productName} className="w-full h-full object-cover transition-all duration-500" />
            </div>
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              {gallery.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImage(img)}
                  className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${activeImage === img ? 'border-brand-rose' : 'border-transparent hover:border-brand-pink'}`}
                >
                  <img src={img} alt={`${shop.productName} ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info & Purchase */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between gap-3 mb-2">
              <span className={`text-[11px] sm:text-xs font-bold text-brand-rose ${isRtl ? '' : 'tracking-widest uppercase'}`}>Raghad Kahil</span>

              {/* Currency selector */}
              <label className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-brand-pink/30 text-xs">
                <span className="text-brand-muted font-semibold">{t.currencyLabel}:</span>
                <select
                  value={currentCurrency.code}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="bg-transparent text-brand-rose font-bold focus:outline-none cursor-pointer"
                >
                  {currencies.map(c => (
                    <option key={c.code} value={c.code} className="text-brand-dark">{c.code} ({c.symbol})</option>
                  ))}
                </select>
              </label>
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-brand-dark mb-3 leading-tight">
              {shop.productName}
            </h2>

            <div className="flex items-center gap-2 mb-5">
              <div className="flex text-amber-400">
                {[0, 1, 2, 3, 4].map(i => <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />)}
              </div>
              <span className="text-sm text-brand-muted">{shop.reviewsCount}</span>
            </div>

            {/* Price */}
            <div className="flex items-end gap-3 mb-6" dir="ltr" style={{ justifyContent: isRtl ? 'flex-end' : 'flex-start' }}>
              {pricing.discountRate > 0 && (
                <span className="text-base sm:text-lg text-brand-muted line-through opacity-70 mb-0.5">
                  {currentCurrency.format(pricing.originalTotal)}
                </span>
              )}
              <span className="text-3xl sm:text-4xl font-bold text-brand-dark">
                {currentCurrency.format(pricing.finalTotal)}
              </span>
            </div>

            {/* Bundle cards */}
            <h3 className="text-sm font-bold text-brand-dark mb-3">{shop.bundles.title}</h3>
            <div role="radiogroup" className="space-y-3 mb-4">
              {BUNDLE_QTYS.map(q => {
                const p = calculatePricing(q, currentCurrency.code);
                const selected = quantity === q;
                const perUnit = Math.round(p.finalTotal / q);
                return (
                  <button
                    key={q}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    id={`bundle-${q}`}
                    onClick={() => setQuantity(q)}
                    className={`relative w-full flex items-center gap-3 sm:gap-4 rounded-2xl border-2 px-4 py-3.5 text-start transition-all duration-200 ${
                      selected
                        ? 'border-brand-rose bg-white shadow-[0_8px_24px_-10px_rgba(184,92,102,0.45)]'
                        : 'border-brand-pink/30 bg-white/60 hover:border-brand-pink hover:bg-white'
                    }`}
                  >
                    {bundleTag[q] && (
                      <span className="absolute -top-2.5 end-4 px-2.5 py-0.5 rounded-full bg-brand-rose text-white text-[10px] sm:text-[11px] font-bold shadow-sm">
                        {bundleTag[q]}
                      </span>
                    )}

                    {/* Radio dot */}
                    <span className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center ${selected ? 'border-brand-rose bg-brand-rose' : 'border-brand-pink'}`}>
                      {selected && <Check className="w-3 h-3 text-white" strokeWidth={3.5} />}
                    </span>

                    <span className="flex-1 min-w-0">
                      <span className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-brand-dark">{bundleLabel[q]}</span>
                        {p.discountRate > 0 && (
                          <span className="px-2 py-0.5 rounded-md bg-green-100 text-green-700 text-[11px] font-bold">
                            {shop.bundles.save} {Math.round(p.discountRate * 100)}%
                          </span>
                        )}
                      </span>
                      {p.freeGifts.length > 0 ? (
                        <span className="inline-flex items-center gap-1 text-xs text-brand-dark font-semibold mt-1 px-2 py-0.5 rounded-full bg-[#F7D6DE] border border-[#edd0d7] w-fit">
                          <Gift className="w-3.5 h-3.5 text-brand-rose" /> {shop.bundles.freeGift}
                        </span>
                      ) : q > 1 ? (
                        <span className="block text-xs text-brand-muted mt-0.5" dir="ltr" style={{ textAlign: isRtl ? 'right' : 'left' }}>
                          {currentCurrency.format(perUnit)} {shop.bundles.perUnit}
                        </span>
                      ) : null}
                    </span>

                    <span className="text-end shrink-0" dir="ltr">
                      <span className="block font-bold text-brand-dark">{currentCurrency.format(p.finalTotal)}</span>
                      {p.discountRate > 0 && (
                        <span className="block text-xs text-brand-muted line-through">{currentCurrency.format(p.originalTotal)}</span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Custom quantity (for 4+) */}
            <div className="flex items-center justify-between gap-3 mb-6 text-sm">
              <span className="text-brand-muted">{shop.bundles.more}</span>
              <div className="flex items-center bg-white border border-brand-pink/30 rounded-full p-0.5 shadow-sm">
                <button type="button" onClick={handleDecrement} aria-label="-" className="w-8 h-8 flex items-center justify-center rounded-full text-brand-muted hover:text-brand-rose hover:bg-brand-peach/50 transition-colors">
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-10 text-center bg-transparent font-bold text-brand-dark focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                  min="1"
                  aria-label={t.quantity}
                />
                <button type="button" onClick={handleIncrement} aria-label="+" className="w-8 h-8 flex items-center justify-center rounded-full text-brand-muted hover:text-brand-rose hover:bg-brand-peach/50 transition-colors">
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* CTA */}
            <button
              type="button"
              id="confirm-order-btn"
              onClick={onAddToCart}
              className="relative w-full py-4 sm:py-5 text-base sm:text-lg font-bold rounded-xl sm:rounded-2xl bg-brand-rose text-white hover:bg-[#a64e58] hover:shadow-xl hover:shadow-brand-rose/40 transition-all duration-300 flex items-center justify-center gap-2 sm:gap-3 hover:scale-[1.02] active:scale-[0.98] animate-pulse-glow group"
            >
              <ShoppingBag className="w-5 h-5 group-hover:-rotate-12 transition-transform duration-300" />
              {t.addToCart}
              <span dir="ltr" className="opacity-90">· {currentCurrency.format(pricing.finalTotal)}</span>
            </button>

            {/* Trust row */}
            <div className="grid grid-cols-3 gap-2 mt-4 text-center">
              {[
                { Icon: Truck, label: shop.trust.shipping },
                { Icon: ShieldCheck, label: shop.trust.guarantee },
                { Icon: Lock, label: shop.trust.secure },
              ].map(({ Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-1.5 rounded-xl bg-white/70 border border-brand-pink/20 px-2 py-3">
                  <Icon className="w-5 h-5 text-brand-rose" />
                  <span className="text-[11px] sm:text-xs font-semibold text-brand-dark leading-tight">{label}</span>
                </div>
              ))}
            </div>

            <GuaranteeBadge lang={lang} className="mt-4" />
          </div>

        </div>
      </div>
    </section>
  );
}
