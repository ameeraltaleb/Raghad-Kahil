import React, { useState, useEffect, lazy, Suspense } from 'react';
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
import { detectUserLocale } from './utils/geoDetection';
import { fetchLiveRates } from './services/currencyService';
import { getConfig, subscribeConfig } from './config/siteConfig';

// Admin panel is code-split: visitors never download it
const AdminApp = lazy(() => import('./admin/AdminApp'));

function App() {
  // Re-render the whole tree whenever admin settings are (re)applied
  const [config, setConfigState] = useState(() => getConfig());
  useEffect(() => subscribeConfig((c) => setConfigState(c)), []);
  const sections = config.sections || {};

  const [locale] = useState(() => detectUserLocale());
  const [lang, setLang] = useState(locale.lang);
  const [currency, setCurrency] = useState(() => (typeof window !== 'undefined' ? localStorage.getItem('raghad_currency') : null) || 'USD');
  const [countryCode] = useState(locale.countryCode);
  const [isSiteRevealed, setIsSiteRevealed] = useState(false);

  // Dedicated Route State for /admin
  const [currentPath, setCurrentPath] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname;
    }
    return '/';
  });

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  // Persist language
  const handleLangChange = (newLang) => {
    setLang(newLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('raghad_lang', newLang);
    }
  };

  const handleCurrencyChange = (newCurrency) => {
    setCurrency(newCurrency);
    if (typeof window !== 'undefined') {
      localStorage.setItem('raghad_currency', newCurrency);
    }
  };
  
  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;

    // SEO Meta Configuration
    const tSeo = translations[lang]?.seo || {};
    if (tSeo.title) document.title = tSeo.title;
    
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.name = 'description';
      document.head.appendChild(metaDescription);
    }
    if (tSeo.description) metaDescription.content = tSeo.description;

  }, [lang, config]);

  // Fetch live market exchange rates silently in the background
  useEffect(() => {
    fetchLiveRates();
  }, []);

  const isAdminRoute = currentPath === '/admin' || currentPath === '/admin/' || (typeof window !== 'undefined' && window.location.hash === '#admin');

  // If on /admin route, display the dedicated Admin Dashboard directly
  if (isAdminRoute) {
    return (
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center bg-brand-bg">
            <div className="w-10 h-10 rounded-full border-4 border-[#FBC6E2] border-t-brand-dark animate-spin" />
          </div>
        }
      >
        <AdminApp
          onBackToStore={() => {
            if (typeof window !== 'undefined') {
              window.history.pushState({}, '', '/');
              window.location.hash = '';
            }
            setCurrentPath('/');
          }}
        />
      </Suspense>
    );
  }

  const showPreloader = sections.preloader !== false;
  const revealed = isSiteRevealed || !showPreloader;

  return (
    <div className="min-h-screen bg-brand-bg text-brand-dark font-sans selection:bg-brand-pink/30 relative overflow-x-hidden w-full max-w-full">
      {/* Smoothly dissolves into crystal-clear focus as preloader fades */}
      <div 
        className={`w-full max-w-full transition-opacity duration-1000 ease-out ${
          revealed ? 'opacity-100' : 'opacity-85'
        }`}
      >
        <Navbar lang={lang} setLang={handleLangChange} />
        <main>
          <HeroSection lang={lang} />
          {sections.marquee !== false && <MarqueeRibbon lang={lang} />}
          {sections.problemSolution !== false && <ProblemSolution lang={lang} />}
          {sections.comparison !== false && <ComparisonTable lang={lang} />}
          {sections.ingredients !== false && <KeyIngredients lang={lang} />}
          {sections.results !== false && <ClinicalResults lang={lang} />}
          {sections.howToUse !== false && <HowToUse lang={lang} />}
          {sections.productDetails !== false && <ProductDetails lang={lang} />}
          {sections.checkout !== false && (
            <CheckoutSection lang={lang} currency={currency} setCurrency={handleCurrencyChange} countryCode={countryCode} />
          )}
          {sections.reviews !== false && <CustomerReviews lang={lang} />}
          {sections.faq !== false && <FAQAccordion lang={lang} />}
        </main>
        <Footer lang={lang} />
        {sections.floatingWhatsApp !== false && <FloatingWhatsApp lang={lang} />}
        {sections.stickyBar !== false && sections.checkout !== false && <StickyAddToCart lang={lang} currency={currency} />}
        {sections.socialProof !== false && <SocialProofToast lang={lang} />}
      </div>

      {showPreloader && <ElegantPreloader lang={lang} onStartReveal={() => setIsSiteRevealed(true)} />}
    </div>
  );
}

export default App;
