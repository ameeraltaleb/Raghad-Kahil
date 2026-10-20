import React, { useState } from 'react';
import { translations } from '../translations';
import { calculatePricing, currencies } from '../data/checkoutData';
import { Plus, Minus, Star, Check, Gift, Truck, ShieldCheck, Lock, ArrowLeft, ArrowRight, Sparkles, MessageCircle } from 'lucide-react';
import hero1Img from '../assets/hero1.png';
import hero2Img from '../assets/hero2.png';
import hero3Img from '../assets/hero3.jpg';
import GuaranteeBadge from './GuaranteeBadge';
import { WHATSAPP_DISPLAY } from '../utils/whatsapp';

const BUNDLE_QTYS = [1, 2, 3];

export default function BundlePricing({ lang, quantity, setQuantity, currency, setCurrency, onAddToCart }) {
  const t = translations[lang]?.pricing || translations.ar.pricing;
  const shop = translations[lang]?.shop || translations.ar.shop;
  const isRtl = lang === 'ar';
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  const currentCurrency = currencies.find(c => c.code === currency) || currencies[0];
  const pricing = calculatePricing(quantity, currentCurrency.code);

  const [activeImage, setActiveImage] = useState(hero1Img);
  const gallery = [hero1Img, hero2Img, hero3Img];

  const bundleLabel = { 1: shop.bundles.one, 2: shop.bundles.two, 3: shop.bundles.three };
  const bundleTag = { 2: shop.bundles.popular, 3: shop.bundles.bestValue };

  const handleIncrement = () => setQuantity(q => q + 1);
  const handleDecrement = () => setQuantity(q => Math.max(1, q - 1));

  const continueText = lang === 'ar' ? 'استمرار' : lang === 'tr' ? 'Devam Et' : 'Continue';
  const nextStepNote = lang === 'ar'
    ? 'الخطوة التالية: إدخال معلومات التوصيل وتأكيد الطلب عبر واتساب 💬'
    : lang === 'tr'
    ? 'Sonraki adım: Teslimat bilgilerini girin ve WhatsApp ile onaylayın 💬'
    : 'Next step: Enter delivery details and confirm via WhatsApp 💬';

  return (
    <section id="bundles" className="py-8 sm:py-16 lg:py-20 bg-brand-bg relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-12 lg:gap-16 items-start">

          {/* Image Gallery */}
          <div className="flex flex-col gap-3 sm:gap-4 md:sticky md:top-24">
            <div className="w-full aspect-square rounded-2xl sm:rounded-3xl overflow-hidden bg-brand-peach/30 border border-brand-pink/20 shadow-xs">
              <img src={activeImage} alt={shop.productName} className="w-full h-full object-cover transition-all duration-500" />
            </div>
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              {gallery.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImage(img)}
                  className={`aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${activeImage === img ? 'border-brand-rose ring-2 ring-[#FBC6E2]' : 'border-transparent hover:border-brand-pink'}`}
                >
                  <img src={img} alt={`${shop.productName} ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {/* Official WhatsApp Concierge Badge */}
            <div className="bg-white rounded-2xl p-4 border border-[#F3B2D4]/60 shadow-xs flex items-center gap-3.5 mt-2">
              <div className="w-11 h-11 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
                <MessageCircle className="w-6 h-6 text-emerald-600 fill-current" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-bold text-emerald-700 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>{lang === 'ar' ? 'استلام وتأكيد الطلبات عبر واتساب الرسمي' : lang === 'tr' ? 'Resmi WhatsApp Sipariş Hattı' : 'Official WhatsApp Order Line'}</span>
                </div>
                <div className="font-bold text-brand-dark text-xs sm:text-sm mt-0.5 dir-ltr tracking-wide">
                  {WHATSAPP_DISPLAY}
                </div>
              </div>
            </div>
          </div>

          {/* Product Info & Purchase */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between gap-3 mb-2">
              <span className={`text-[11px] sm:text-xs font-bold text-brand-rose ${isRtl ? '' : 'tracking-widest uppercase'}`}>Raghad Kahil</span>

              {/* Currency selector */}
              <label className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-brand-pink/30 text-xs shadow-xs">
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

            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-brand-dark mb-3 leading-tight font-bold">
              {shop.productName}
            </h2>

            <div className="flex items-center gap-2 mb-4">
              <div className="flex text-amber-400">
                {[0, 1, 2, 3, 4].map(i => <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />)}
              </div>
              <span className="text-sm text-brand-muted">{shop.reviewsCount}</span>
            </div>

            {/* Price display */}
            <div className="flex items-end gap-3 mb-5" dir="ltr" style={{ justifyContent: isRtl ? 'flex-end' : 'flex-start' }}>
              {pricing.discountRate > 0 && (
                <span className="text-base sm:text-lg text-brand-muted line-through opacity-70 mb-0.5">
                  {currentCurrency.format(pricing.originalTotal)}
                </span>
              )}
              <span className="text-3xl sm:text-4xl font-extrabold text-brand-dark">
                {currentCurrency.format(pricing.finalTotal)}
              </span>
            </div>

            {/* Bundle cards (Step 1) */}
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-brand-dark">{shop.bundles.title}</h3>
              <span className="text-[11px] font-bold text-brand-rose bg-[#FBC6E2]/30 border border-[#F3B2D4] px-2.5 py-0.5 rounded-full">
                {lang === 'ar' ? 'الخطوة 1 من 2' : lang === 'tr' ? '1. Adım' : 'Step 1 of 2'}
              </span>
            </div>

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
                    className={`relative w-full flex items-center gap-3 sm:gap-4 rounded-2xl border-2 px-4 py-3.5 text-start transition-all duration-200 cursor-pointer ${
                      selected
                        ? 'border-[#FBC6E2] bg-[#FBC6E2]/15 shadow-[0_10px_30px_-10px_rgba(251,198,226,0.6)] ring-2 ring-[#FBC6E2]'
                        : 'border-brand-pink/30 bg-white/70 hover:border-brand-pink hover:bg-white'
                    }`}
                  >
                    {bundleTag[q] && (
                      <span className="absolute -top-2.5 end-4 px-2.5 py-0.5 rounded-full bg-[#FBC6E2] text-brand-dark border border-[#F3B2D4] text-[10px] sm:text-[11px] font-black shadow-xs">
                        {bundleTag[q]}
                      </span>
                    )}

                    {/* Radio dot */}
                    <span className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center ${selected ? 'border-[#F3B2D4] bg-[#FBC6E2]' : 'border-brand-pink'}`}>
                      {selected && <Check className="w-3 h-3 text-brand-dark" strokeWidth={3.5} />}
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
                        <span className="inline-flex items-center gap-1 text-xs text-brand-dark font-semibold mt-1 px-2 py-0.5 rounded-full bg-[#FBC6E2] border border-[#F3B2D4] w-fit">
                          <Gift className="w-3.5 h-3.5 text-brand-dark" /> {shop.bundles.freeGift}
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
            <div className="flex items-center justify-between gap-3 mb-5 text-sm">
              <span className="text-brand-muted">{shop.bundles.more}</span>
              <div className="flex items-center bg-white border border-brand-pink/30 rounded-full p-0.5 shadow-xs">
                <button type="button" onClick={handleDecrement} aria-label="-" className="w-8 h-8 flex items-center justify-center rounded-full text-brand-muted hover:text-brand-dark hover:bg-[#FBC6E2]/40 transition-colors cursor-pointer">
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
                <button type="button" onClick={handleIncrement} aria-label="+" className="w-8 h-8 flex items-center justify-center rounded-full text-brand-muted hover:text-brand-dark hover:bg-[#FBC6E2]/40 transition-colors cursor-pointer">
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* PRIMARY BUTTON: استمرار (Continue) */}
            <div className="space-y-2.5">
              <button
                type="button"
                id="continue-to-info-btn"
                onClick={onAddToCart}
                className="relative w-full py-4 sm:py-5 text-base sm:text-lg font-black rounded-2xl bg-[#FBC6E2] text-brand-dark hover:bg-[#f8b0d8] border-2 border-[#F3B2D4] shadow-xl shadow-[#FBC6E2]/50 hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] cursor-pointer group"
              >
                <Sparkles className="w-5 h-5 text-brand-dark group-hover:rotate-12 transition-transform" />
                <span>{continueText}</span>
                <span dir="ltr" className="opacity-90 font-bold text-sm sm:text-base bg-white/50 px-2.5 py-0.5 rounded-full border border-[#F3B2D4]">
                  {currentCurrency.format(pricing.finalTotal)}
                </span>
                <ArrowIcon className="w-5 h-5 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
              </button>

              <p className="text-center text-xs text-brand-muted font-medium pt-1">
                {nextStepNote}
              </p>
            </div>

            {/* Trust row */}
            <div className="grid grid-cols-3 gap-2 mt-5 text-center">
              {[
                { Icon: Truck, label: shop.trust.shipping },
                { Icon: ShieldCheck, label: shop.trust.guarantee },
                { Icon: Lock, label: shop.trust.secure },
              ].map(({ Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-1.5 rounded-xl bg-white/70 border border-brand-pink/20 px-2 py-3 shadow-2xs">
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
