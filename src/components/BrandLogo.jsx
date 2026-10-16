import React from 'react';
import logoDark from '../assets/logo.png';
import logoWhite from '../assets/logo-white.png';

export default function BrandLogo({ 
  className = '', 
  isScrolled = true,
  isFooter = false,
  size = 'md' 
}) {
  const isLightVersion = isFooter || (!isScrolled && !isFooter);
  const logoSrc = isLightVersion ? logoWhite : logoDark;

  const heightClass = {
    sm: 'h-8 sm:h-9',
    md: 'h-10 sm:h-12',
    lg: 'h-14 sm:h-16'
  }[size] || 'h-10 sm:h-12';

  return (
    <div className={`flex items-center select-none ${className}`}>
      <img 
        src={logoSrc} 
        alt="Raghad Kahil" 
        className={`${heightClass} w-auto object-contain transition-all duration-300 drop-shadow-xs`} 
      />
    </div>
  );
}
