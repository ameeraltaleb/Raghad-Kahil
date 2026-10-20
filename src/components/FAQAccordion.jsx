import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { translations } from '../translations';

export default function FAQAccordion({ lang }) {
  const t = translations[lang].faq;
  
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section id="faq" className="py-8 sm:py-16 lg:py-20 bg-white relative">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        
        <div className="text-center mb-6 sm:mb-12">
          <h2 className="font-serif text-2xl sm:text-5xl text-brand-dark leading-tight">
            {t.title}
          </h2>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {t.items.map((item, index) => (
            <div 
              key={index}
              className={`border-2 rounded-2xl overflow-hidden transition-all duration-300 ${openIndex === index ? 'border-[#FBC6E2] bg-[#FBC6E2]/15 shadow-sm' : 'border-gray-100 bg-white hover:border-[#FBC6E2]/50'}`}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
                className="w-full text-left px-4 py-3.5 sm:px-6 sm:py-5 flex items-center justify-between gap-4 focus:outline-none"
              >
                <span className="font-bold text-base sm:text-lg text-brand-dark pr-2">{item.q}</span>
                <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 transition-colors duration-300 ${openIndex === index ? 'bg-[#FBC6E2] border border-[#F3B2D4]' : 'bg-[#FBC6E2]/40'}`}>
                  <ChevronDown 
                    className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 ${openIndex === index ? 'rotate-180 text-brand-dark' : 'text-brand-dark'}`} 
                  />
                </div>
              </button>
              
              <div 
                className={`px-4 sm:px-6 overflow-hidden transition-all duration-300 ease-in-out ${openIndex === index ? 'max-h-96 pb-4 sm:pb-6 opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <p className="text-brand-muted leading-relaxed text-sm sm:text-base pt-1 sm:pt-2">
                  {item.a}
                </p>
              </div>
            </div>
          ))}
        </div>
        
      </div>
    </section>
  );
}
