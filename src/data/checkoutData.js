import { getStoredRates, DEFAULT_RATES } from '../services/currencyService';

export const countries = [
  { code: 'TR', name: 'Turkey (Türkiye 🇹🇷)', dialCode: '+90', priority: 1 },
  { code: 'SA', name: 'Saudi Arabia (المملكة العربية السعودية 🇸🇦)', dialCode: '+966', priority: 2 },
  { code: 'AE', name: 'United Arab Emirates (الإمارات العربية المتحدة 🇦🇪)', dialCode: '+971', priority: 2 },
  { code: 'QA', name: 'Qatar (قطر 🇶🇦)', dialCode: '+974', priority: 2 },
  { code: 'KW', name: 'Kuwait (الكويت 🇰🇼)', dialCode: '+965', priority: 2 },
  { code: 'OM', name: 'Oman (عُمان 🇴🇲)', dialCode: '+968', priority: 2 },
  { code: 'BH', name: 'Bahrain (البحرين 🇧🇭)', dialCode: '+973', priority: 2 },
  { code: 'JO', name: 'Jordan (الأردن 🇯🇴)', dialCode: '+962', priority: 2 },
  { code: 'LB', name: 'Lebanon (لبنان 🇱🇧)', dialCode: '+961', priority: 2 },
  { code: 'IQ', name: 'Iraq (العراق 🇮🇶)', dialCode: '+964', priority: 2 },
  { code: 'EG', name: 'Egypt (مصر 🇪🇬)', dialCode: '+20', priority: 2 },
  { code: 'SY', name: 'Syria (سوريا 🇸🇾)', dialCode: '+963', priority: 2 },
  { code: 'MA', name: 'Morocco (المغرب 🇲🇦)', dialCode: '+212', priority: 2 },
  { code: 'DZ', name: 'Algeria (الجزائر 🇩🇿)', dialCode: '+213', priority: 2 },
  { code: 'TN', name: 'Tunisia (تونس 🇹🇳)', dialCode: '+216', priority: 2 },
  { code: 'US', name: 'United States 🇺🇸', dialCode: '+1', priority: 3 },
  { code: 'GB', name: 'United Kingdom 🇬🇧', dialCode: '+44', priority: 3 },
  { code: 'DE', name: 'Germany (Deutschland 🇩🇪)', dialCode: '+49', priority: 3 },
  { code: 'FR', name: 'France 🇫🇷', dialCode: '+33', priority: 3 },
  { code: 'IT', name: 'Italy (Italia 🇮🇹)', dialCode: '+39', priority: 3 },
  { code: 'CA', name: 'Canada 🇨🇦', dialCode: '+1', priority: 3 },
  { code: 'AU', name: 'Australia 🇦🇺', dialCode: '+61', priority: 3 },
].sort((a, b) => {
  if (a.priority !== b.priority) return a.priority - b.priority;
  return a.name.localeCompare(b.name);
});

export const currencies = [
  { code: 'USD', symbol: '$', name: 'US Dollar ($)', format: (v) => `$${v.toLocaleString()}` },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira (₺)', format: (v) => `${v.toLocaleString()}₺` },
  { code: 'SAR', symbol: 'SAR', name: 'Saudi Riyal (ر.س)', format: (v) => `${v.toLocaleString()} SAR` },
  { code: 'AED', symbol: 'AED', name: 'UAE Dirham (د.إ)', format: (v) => `${v.toLocaleString()} AED` },
  { code: 'EUR', symbol: '€', name: 'Euro (€)', format: (v) => `${v.toLocaleString()}€` },
];

/**
 * Pricing Rules:
 * Base in USD:
 * 1 jar  = 20 USD
 * 2 jars = 30 USD
 * 3 jars = 45 USD
 * Each additional jar (4+) = +15 USD per jar
 *
 * Rates are dynamically fetched and cached, guaranteeing up-to-date conversion.
 */
export const calculatePricing = (qty, currency = 'USD', customRates = null) => {
  const quantity = Math.max(1, parseInt(qty) || 1);
  const rates = customRates || getStoredRates() || DEFAULT_RATES;
  const rate = rates[currency] || 1;

  // Base price in USD
  let baseFinalUSD = 20;
  if (quantity === 1) {
    baseFinalUSD = 20;
  } else if (quantity === 2) {
    baseFinalUSD = 30;
  } else if (quantity === 3) {
    baseFinalUSD = 45;
  } else {
    // 4+ jars: 45 + (quantity - 3) * 15 which equals quantity * 15
    baseFinalUSD = 45 + (quantity - 3) * 15;
  }

  // Original single-unit price without bundle discount (20 USD per jar)
  const baseOriginalUSD = quantity * 20;

  // Converted totals:
  // For currencies with high numbers like TRY, round to nearest 5 or 10 for clean boutique pricing
  let finalTotal = Math.round(baseFinalUSD * rate);
  let originalTotal = Math.round(baseOriginalUSD * rate);

  if (currency === 'TRY' && finalTotal > 100) {
    // Round to clean nearest 5 for Turkish Lira (e.g. 990 or 1485)
    finalTotal = Math.round(finalTotal / 5) * 5;
    originalTotal = Math.round(originalTotal / 5) * 5;
  }

  const discountAmount = Math.max(0, originalTotal - finalTotal);
  const discountRate = originalTotal > 0 ? (discountAmount / originalTotal) : 0;

  let freeGifts = [];
  if (quantity >= 3) {
    freeGifts = ['Dual-Ended Professional Brow Brush & Spoolie (Free Gift)'];
  }
  if (quantity >= 5) {
    freeGifts = [
      'Dual-Ended Professional Brow Brush & Spoolie (Free Gift)',
      'Luxury Eyebrow Shaping Kit & Pouch (VIP Gift)'
    ];
  }

  return {
    quantity,
    originalTotal,
    discountRate,
    discountAmount,
    finalTotal,
    freeGifts,
    activeRate: rate
  };
};
