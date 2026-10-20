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

  return (
    <nav className={`fixed w-full top-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-[#FBC6E2]/95 backdrop-blur-md shadow-md border-b border-[#F3B2D4] py-1.5' 
        : 'bg-[#FBC6E2] shadow-sm border-b border-[#F3B2D4] py-2 sm:py-2.5'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-11 sm:h-12">
          
          {/* Logo */}
          <div className="flex-shrink-0">
            <a href="#" className="flex items-center group transition-transform hover:scale-105">
              <BrandLogo isScrolled={true} size="md" />
            </a>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-6">
            <div className={`flex items-center gap-6 ${isRtl ? 'space-x-reverse' : ''}`}>
              {navLinks.map((link, index) => (
                <a 
                  key={index} 
                  href={link.href} 
                  className="text-sm font-bold text-brand-dark hover:text-black transition-colors px-3 py-1.5 rounded-full hover:bg-white/40"
                >
                  {link.name}
                </a>
              ))}
            </div>
            
            <div className="w-px h-6 mx-2 bg-[#F3B2D4]"></div>
            
            {/* Language Dropdown */}
            <div className="relative" ref={desktopLangRef}>
              <button 
                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                className="flex items-center gap-2 text-sm font-bold text-brand-dark px-3.5 py-1.5 rounded-full border border-[#F3B2D4] bg-white/70 hover:bg-white shadow-2xs transition-all"
              >
                <span>{currentLang.label}</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isLangDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isLangDropdownOpen && (
                <div className={`absolute top-full mt-2.5 ${isRtl ? 'left-0' : 'right-0'} w-40 bg-white/98 backdrop-blur-md rounded-2xl shadow-xl border border-[#F3B2D4] py-2 overflow-hidden z-50`}>
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        setLang(l.code);
                        setIsLangDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-[#FBC6E2]/30 transition-colors ${lang === l.code ? 'font-bold text-brand-dark bg-[#FBC6E2]/50' : 'text-brand-dark font-medium'}`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Mobile Actions */}
          <div className="md:hidden flex items-center gap-2.5">
            
            {/* Mobile Lang Dropdown */}
            <div className="relative" ref={mobileLangRef}>
              <button 
                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                className="flex items-center gap-1 text-xs font-bold text-brand-dark px-2.5 py-1.5 rounded-full border border-[#F3B2D4] bg-white/70 shadow-2xs transition-all"
              >
                <span className="text-sm">{currentLang.label.split(' ')[0]}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isLangDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isLangDropdownOpen && (
                <div className={`absolute top-full mt-2.5 ${isRtl ? 'left-0' : 'right-0'} w-36 bg-white/98 backdrop-blur-md rounded-2xl shadow-xl border border-[#F3B2D4] py-2 overflow-hidden z-50`}>
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        setLang(l.code);
                        setIsLangDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-xs hover:bg-[#FBC6E2]/30 transition-colors ${lang === l.code ? 'font-bold text-brand-dark bg-[#FBC6E2]/50' : 'text-brand-dark font-medium'}`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-1.5 rounded-xl text-brand-dark hover:bg-white/40 transition-colors"
              aria-label="Toggle Navigation"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Panel */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-2 pt-3 pb-5 border-t border-[#F3B2D4] bg-[#FBC6E2] absolute left-0 right-0 shadow-2xl px-6 rounded-b-3xl">
            <div className="flex flex-col space-y-3.5">
              {navLinks.map((link, index) => (
                <a 
                  key={index} 
                  href={link.href} 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-base font-bold text-brand-dark hover:text-black py-1 transition-colors"
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
