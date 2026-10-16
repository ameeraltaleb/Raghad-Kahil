import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import MarqueeRibbon from './components/MarqueeRibbon';
import ProblemSolution from './components/ProblemSolution';
import KeyIngredients from './components/KeyIngredients';
import ClinicalResults from './components/ClinicalResults';
import HowToUse from './components/HowToUse';
import ProductDetails from './components/ProductDetails';
import CheckoutSection from './components/CheckoutSection';
import CustomerReviews from './components/CustomerReviews';
import FAQAccordion from './components/FAQAccordion';
import Footer from './components/Footer';
import FloatingWhatsApp from './components/FloatingWhatsApp';
import ComparisonTable from './components/ComparisonTable';
import ElegantPreloader from './components/ElegantPreloader';
import StickyAddToCart from './components/StickyAddToCart';
import SocialProofToast from './components/SocialProofToast';
import { translations } from './translations';

const getBrowserLanguage = () => {
  if (typeof window !== 'undefined') {
    // 1. Check if the user previously selected a language
    const saved = localStorage.getItem('raghad_lang');
    if (saved && ['ar', 'tr', 'en'].includes(saved)) return saved;

    // 2. Check full user preferred languages list
    if (navigator.languages && navigator.languages.length) {
      for (const l of navigator.languages) {
        const lower = l.toLowerCase();
        if (lower.startsWith('ar')) return 'ar';
        if (lower.startsWith('tr')) return 'tr';
      }
    }

    // 3. Check primary navigator language
    if (navigator.language) {
      const browserLang = navigator.language.toLowerCase();
      if (browserLang.startsWith('ar')) return 'ar';
      if (browserLang.startsWith('tr')) return 'tr';
    }
  }
  // Default to Arabic for Middle Eastern / Gulf beauty brand
  return 'ar';
};

const DEFAULT_CURRENCY = { ar: 'SAR', tr: 'TRY', en: 'USD' };

function App() {
  const [lang, setLang] = useState(getBrowserLanguage());
  const [currency, setCurrency] = useState(() => DEFAULT_CURRENCY[getBrowserLanguage()] || 'SAR');
  const [isSiteRevealed, setIsSiteRevealed] = useState(false);

  // Switch to natural currency and persist language choice
  useEffect(() => {
    setCurrency(DEFAULT_CURRENCY[lang] || 'USD');
    if (typeof window !== 'undefined') {
      localStorage.setItem('raghad_lang', lang);
    }
  }, [lang]);
  
  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;

    // SEO Meta Configuration
    const tSeo = translations[lang].seo;
    document.title = tSeo.title;
    
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.name = 'description';
      document.head.appendChild(metaDescription);
    }
    metaDescription.content = tSeo.description;

  }, [lang]);

  const t = translations[lang];

  return (
    <div className="min-h-screen bg-brand-bg text-brand-dark font-sans selection:bg-brand-pink/30 relative overflow-x-hidden w-full">
      {/* Smoothly dissolves into crystal-clear focus as preloader fades */}
      <div 
        className={`w-full transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isSiteRevealed ? 'opacity-100 scale-100 blur-0' : 'opacity-90 scale-[0.985] blur-[2px]'
        }`}
      >
        <Navbar lang={lang} setLang={setLang} />
        <main>
          <HeroSection lang={lang} />
          <MarqueeRibbon lang={lang} />
          <ProblemSolution lang={lang} />
          <ComparisonTable lang={lang} />
          <KeyIngredients lang={lang} />
          <ClinicalResults lang={lang} />
          <HowToUse lang={lang} />
          <ProductDetails lang={lang} />
          <CheckoutSection lang={lang} currency={currency} setCurrency={setCurrency} />
          <CustomerReviews lang={lang} />
          <FAQAccordion lang={lang} />
        </main>
        <Footer lang={lang} />
        <FloatingWhatsApp lang={lang} />
        <StickyAddToCart lang={lang} currency={currency} />
        <SocialProofToast lang={lang} />
      </div>

      <ElegantPreloader lang={lang} onStartReveal={() => setIsSiteRevealed(true)} />
    </div>
  );
}

export default App;
