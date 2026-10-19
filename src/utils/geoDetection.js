/**
 * Intelligent Geo & Timezone Detector
 * Detects visitor's country, currency, and language instantly based on device timezone and browser locale.
 * Zero external API calls, zero latency, 100% privacy-compliant.
 */

export function detectUserLocale() {
  if (typeof window === 'undefined') {
    return { lang: 'ar', currency: 'SAR', countryCode: 'SA' };
  }

  // 1. Check if user previously saved their choice manually
  const savedLang = localStorage.getItem('raghad_lang');
  const savedCurrency = localStorage.getItem('raghad_currency');

  // 2. Read device timezone
  let tz = '';
  try {
    tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
  } catch (e) {
    tz = '';
  }

  // 3. Read browser language preference
  const navLanguages = navigator.languages || [navigator.language || ''];
  const primaryLang = (navLanguages[0] || '').toLowerCase();

  let detectedCountry = 'SA';
  let detectedCurrency = 'SAR';
  let detectedLang = 'ar';

  // --- Turkey Detection ---
  if (tz.includes('Istanbul') || tz.includes('Turkey')) {
    detectedCountry = 'TR';
    detectedCurrency = 'TRY';
    detectedLang = 'tr';
  }
  // --- Saudi Arabia Detection ---
  else if (tz.includes('Riyadh')) {
    detectedCountry = 'SA';
    detectedCurrency = 'SAR';
    detectedLang = 'ar';
  }
  // --- UAE (Dubai / Abu Dhabi) Detection ---
  else if (tz.includes('Dubai') || tz.includes('Abu_Dhabi')) {
    detectedCountry = 'AE';
    detectedCurrency = 'AED';
    detectedLang = 'ar';
  }
  // --- Kuwait Detection ---
  else if (tz.includes('Kuwait')) {
    detectedCountry = 'KW';
    detectedCurrency = 'USD';
    detectedLang = 'ar';
  }
  // --- Qatar Detection ---
  else if (tz.includes('Qatar')) {
    detectedCountry = 'QA';
    detectedCurrency = 'USD';
    detectedLang = 'ar';
  }
  // --- Jordan / Lebanon / Egypt / Iraq / Syria / Oman / Bahrain ---
  else if (tz.includes('Amman') || tz.includes('Beirut') || tz.includes('Cairo') || tz.includes('Baghdad') || tz.includes('Damascus') || tz.includes('Muscat') || tz.includes('Bahrain')) {
    detectedCountry = tz.includes('Amman') ? 'JO' 
      : tz.includes('Beirut') ? 'LB' 
      : tz.includes('Cairo') ? 'EG' 
      : tz.includes('Baghdad') ? 'IQ' 
      : tz.includes('Muscat') ? 'OM' 
      : tz.includes('Bahrain') ? 'BH' 
      : 'SA';
    detectedCurrency = 'USD';
    detectedLang = 'ar';
  }
  // --- European Timezones ---
  else if (tz.startsWith('Europe/')) {
    detectedCountry = 'DE';
    detectedCurrency = 'EUR';
    if (primaryLang.startsWith('tr')) detectedLang = 'tr';
    else if (primaryLang.startsWith('ar')) detectedLang = 'ar';
    else detectedLang = 'en';
  }
  // --- Americas / UK / Global Fallback ---
  else {
    detectedCountry = 'US';
    detectedCurrency = 'USD';
    if (primaryLang.startsWith('tr')) detectedLang = 'tr';
    else if (primaryLang.startsWith('ar')) detectedLang = 'ar';
    else detectedLang = 'en';
  }

  // User manual preference always takes top priority if present
  const finalLang = savedLang && ['ar', 'tr', 'en'].includes(savedLang) ? savedLang : detectedLang;
  const finalCurrency = savedCurrency && ['USD', 'TRY', 'SAR', 'AED', 'EUR'].includes(savedCurrency) ? savedCurrency : detectedCurrency;

  return {
    lang: finalLang,
    currency: finalCurrency,
    countryCode: detectedCountry
  };
}
