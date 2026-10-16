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
  { code: 'USD', symbol: '$', name: 'US Dollar', format: (v) => `$${v.toLocaleString()}` },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira', format: (v) => `${v.toLocaleString()}₺` },
  { code: 'SAR', symbol: 'SAR', name: 'Saudi Riyal', format: (v) => `${v.toLocaleString()} SAR` },
  { code: 'AED', symbol: 'AED', name: 'UAE Dirham', format: (v) => `${v.toLocaleString()} AED` },
  { code: 'EUR', symbol: '€', name: 'Euro', format: (v) => `${v.toLocaleString()}€` },
];

export const basePricePerUnit = { USD: 39, TRY: 1199, SAR: 150, AED: 145, EUR: 36 };

export const calculatePricing = (qty, currency) => {
  const base = basePricePerUnit[currency] || 39;
  const quantity = Math.max(1, parseInt(qty) || 1);
  const originalTotal = base * quantity;
  
  let discountRate = 0;
  let freeGifts = [];
  
  if (quantity === 1) {
    discountRate = 0;
    freeGifts = [];
  } else if (quantity === 2) {
    discountRate = 0.15;
    freeGifts = [];
  } else if (quantity >= 3 && quantity <= 4) {
    discountRate = 0.25;
    freeGifts = [`${quantity}x Precision Brow Spoolies`];
  } else if (quantity >= 5) {
    discountRate = 0.35;
    freeGifts = [`${quantity}x Spoolies`, 'Luxury Eyebrow Shaping Tweezers & Kit'];
  }

  const discountAmount = Math.round(originalTotal * discountRate);
  const finalTotal = originalTotal - discountAmount;

  return {
    quantity,
    originalTotal,
    discountRate,
    discountAmount,
    finalTotal,
    freeGifts
  };
};
