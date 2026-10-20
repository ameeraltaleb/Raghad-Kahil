import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, ChevronDown } from 'lucide-react';
import { translations } from '../translations';
import BrandLogo from './BrandLogo';

export default function Navbar({ lang, setLang }) {
  const t = translations[lang].nav;
  const isRtl = lang === 'ar';
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const desktopLangRef = useRef(null);
  const mobileLangRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const clickedOutsideDesktop = desktopLangRef.current && !desktopLangRef.current.contains(event.target);
      const clickedOutsideMobile = mobileLangRef.current && !mobileLangRef.current.contains(event.target);
      
      if (clickedOutsideDesktop && clickedOutsideMobile) {
        setIsLangDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { name: t.benefits, href: '#benefits' },
    { name: t.ingredients, href: '#ingredients' },
    { name: t.details, href: '#details' },
    { name: t.results, href: '#results' },
    { name: t.reviews, href: '#reviews' },
    { name: t.faq, href: '#faq' },
  ];

  const languages = [
    { code: 'tr', label: '🇹🇷 Türkçe' },
    { code: 'ar', label: '🇸🇦 العربية' },
    { code: 'en', label: '🇬🇧 English' }
  ];

  const currentLang = languages.find(l => l.code === lang);

  // Dynamic styles based on scroll state
  const textColorClass = isScrolled ? 'text-brand-dark' : 'text-white';
  const textHoverClass = isScrolled ? 'hover:text-brand-rose' : 'hover:text-brand-peach';

  return (
    <nav className={`fixed w-full top-0 z-50 transition-all duration-500 ${
      isScrolled ? 'bg-brand-bg/95 backdrop-blur-lg shadow-sm border-b border-brand-pink/30 py-1' : 'bg-transparent py-3'
    }`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-12">
          
          {/* Logo */}
          <div className="flex-shrink-0">
            <a href="#" className="flex items-center group transition-transform hover:scale-105">
              <BrandLogo isScrolled={isScrolled} size="md" />
            </a>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            <div className={`flex items-center gap-8 ${isRtl ? 'space-x-reverse' : ''}`}>
              {navLinks.map((link, index) => (
                <a key={index} href={link.href} className={`text-sm font-medium transition-colors ${textColorClass} ${textHoverClass}`}>
                  {link.name}
                </a>
              ))}
            </div>
            
            <div className={`w-px h-6 mx-4 transition-colors ${isScrolled ? 'bg-brand-pink/50' : 'bg-white/30'}`}></div>
            
            {/* Language Dropdown */}
            <div className="relative" ref={desktopLangRef}>
              <button 
                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full border transition-all ${
                  isScrolled 
                    ? 'text-brand-dark hover:text-brand-rose border-brand-pink/30 hover:border-brand-pink hover:bg-brand-peach/50' 
                    : 'text-white border-white/30 hover:border-white hover:bg-white/10'
                }`}
              >
                <span>{currentLang.label}</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isLangDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isLangDropdownOpen && (
                <div className={`absolute top-full mt-3 ${isRtl ? 'left-0' : 'right-0'} w-40 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-brand-pink/30 py-2 overflow-hidden`}>
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        setLang(l.code);
                        setIsLangDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-brand-peach transition-colors ${lang === l.code ? 'font-bold text-brand-dark bg-[#FBC6E2]/40' : 'text-brand-dark'}`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
            
            {/* Mobile Lang Dropdown */}
            <div className="relative" ref={mobileLangRef}>
              <button 
                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                className={`flex items-center gap-1 text-sm font-medium px-3 py-1.5 rounded-full border transition-all ${
                  isScrolled 
                    ? 'text-brand-dark border-brand-pink/30 bg-brand-peach/20' 
                    : 'text-white border-white/30 bg-white/10'
                }`}
              >
                <span className="text-base">{currentLang.label.split(' ')[0]}</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isLangDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isLangDropdownOpen && (
                <div className={`absolute top-full mt-3 ${isRtl ? 'left-0' : 'right-0'} w-36 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-brand-pink/30 py-2 overflow-hidden`}>
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        setLang(l.code);
                        setIsLangDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-brand-peach transition-colors ${lang === l.code ? 'font-bold text-brand-dark bg-[#FBC6E2]/40' : 'text-brand-dark'}`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`transition-colors ${textColorClass} ${textHoverClass}`}
            >
              {isMobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Panel */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pt-4 pb-6 border-t border-brand-pink/30 bg-brand-bg absolute left-0 right-0 shadow-2xl px-6 rounded-b-3xl">
            <div className="flex flex-col space-y-5">
              {navLinks.map((link, index) => (
                <a 
                  key={index} 
                  href={link.href} 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-lg font-bold text-brand-dark hover:text-brand-rose transition-colors"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
