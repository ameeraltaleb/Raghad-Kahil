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
import VideoModal from './components/VideoModal';
import AdminDashboard from './components/AdminDashboard';
import { translations } from './translations';
import { detectUserLocale } from './utils/geoDetection';
import { fetchLiveRates } from './services/currencyService';

function App() {
  const [locale] = useState(() => detectUserLocale());
  const [lang, setLang] = useState(locale.lang);
  const [currency, setCurrency] = useState(() => (typeof window !== 'undefined' ? localStorage.getItem('raghad_currency') : null) || 'USD');
  const [countryCode] = useState(locale.countryCode);
  const [isSiteRevealed, setIsSiteRevealed] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

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

  // Fetch live market exchange rates silently in the background
  useEffect(() => {
    fetchLiveRates();
  }, []);

  const isAdminRoute = currentPath === '/admin' || currentPath === '/admin/' || (typeof window !== 'undefined' && window.location.hash === '#admin');

  // If on /admin route, display the dedicated Admin Dashboard directly
  if (isAdminRoute) {
    return (
      <AdminDashboard 
        lang={lang} 
        onBackToStore={() => {
          if (typeof window !== 'undefined') {
            window.history.pushState({}, '', '/');
            window.location.hash = '';
          }
          setCurrentPath('/');
        }} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg text-brand-dark font-sans selection:bg-brand-pink/30 relative overflow-x-hidden w-full max-w-full">
      {/* Smoothly dissolves into crystal-clear focus as preloader fades */}
      <div 
        className={`w-full max-w-full transition-opacity duration-1000 ease-out ${
          isSiteRevealed ? 'opacity-100' : 'opacity-85'
        }`}
      >
        <Navbar lang={lang} setLang={handleLangChange} />
        <main>
          <HeroSection lang={lang} onWatchVideo={() => setIsVideoModalOpen(true)} />
          <MarqueeRibbon lang={lang} />
          <ProblemSolution lang={lang} />
          <ComparisonTable lang={lang} />
          <KeyIngredients lang={lang} />
          <ClinicalResults lang={lang} />
          <HowToUse lang={lang} />
          <ProductDetails lang={lang} />
          <CheckoutSection lang={lang} currency={currency} setCurrency={handleCurrencyChange} countryCode={countryCode} />
          <CustomerReviews lang={lang} />
          <FAQAccordion lang={lang} />
        </main>
        <Footer 
          lang={lang} 
          onNavigateToAdmin={() => {
            if (typeof window !== 'undefined') {
              window.history.pushState({}, '', '/admin');
            }
            setCurrentPath('/admin');
          }} 
        />
        <FloatingWhatsApp lang={lang} />
        <StickyAddToCart lang={lang} currency={currency} />
        <SocialProofToast lang={lang} />
      </div>

      <ElegantPreloader lang={lang} onStartReveal={() => setIsSiteRevealed(true)} />

      {/* Luxury Lightbox Video Player */}
      <VideoModal 
        isOpen={isVideoModalOpen} 
        onClose={() => setIsVideoModalOpen(false)} 
        lang={lang} 
        videoSrc="/promo.mp4" 
      />
    </div>
  );
}

export default App;
