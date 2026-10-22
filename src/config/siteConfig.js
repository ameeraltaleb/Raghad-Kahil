/**
 * Site configuration store.
 * - Holds every admin-editable setting (contact, pricing, rates, sections, texts, media).
 * - Applies settings to the existing modules (translations, whatsapp, pricing, media)
 *   so public components need almost no changes.
 * - Persists to Supabase (`site_settings` row "main") with a localStorage cache
 *   for an instant first paint.
 */
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { translations } from '../translations';
import { applyWhatsAppConfig } from '../utils/whatsapp';
import { setPricingRules } from '../data/checkoutData';
import { setManualRates } from '../services/currencyService';
import { applyMediaOverrides } from './media';

const CACHE_KEY = 'raghad_site_config';
const ORIGINAL_TRANSLATIONS = JSON.parse(JSON.stringify(translations));

export const SECTION_LABELS = {
  marquee: 'الشريط المتحرك أسفل الواجهة',
  problemSolution: 'قسم المشكلة والحل',
  comparison: 'جدول المقارنة',
  ingredients: 'المكونات الفعالة',
  results: 'النتائج (قبل / بعد)',
  howToUse: 'طريقة الاستخدام',
  productDetails: 'تفاصيل المنتج',
  checkout: 'قسم الطلب والباقات',
  reviews: 'تقييمات العملاء',
  faq: 'الأسئلة الشائعة',
  floatingWhatsApp: 'زر واتساب العائم',
  stickyBar: 'شريط الطلب الثابت (للجوال)',
  socialProof: 'إشعارات المشتريات الأخيرة',
  preloader: 'شاشة التحميل الافتتاحية'
};

export const DEFAULT_CONFIG = {
  contact: {
    whatsappPhone: '905525200700',
    whatsappDisplay: '+90 552 520 07 00'
  },
  pricing: {
    tier1: 20,
    tier2: 30,
    tier3: 45,
    extraUnit: 15,
    originalUnit: 20,
    roundTRY: true,
    giftMinQty: 3,
    vipGiftMinQty: 5
  },
  rates: {
    mode: 'live', // 'live' | 'manual'
    manual: { TRY: 49.5, SAR: 3.75, AED: 3.67, EUR: 0.9 }
  },
  sections: Object.fromEntries(Object.keys(SECTION_LABELS).map((k) => [k, true])),
  content: { ar: {}, en: {}, tr: {} },
  media: {}
};

/** Merge a (possibly partial / outdated) config onto the defaults */
export function normalizeConfig(raw) {
  const c = raw && typeof raw === 'object' ? raw : {};
  return {
    contact: { ...DEFAULT_CONFIG.contact, ...(c.contact || {}) },
    pricing: { ...DEFAULT_CONFIG.pricing, ...(c.pricing || {}) },
    rates: {
      ...DEFAULT_CONFIG.rates,
      ...(c.rates || {}),
      manual: { ...DEFAULT_CONFIG.rates.manual, ...((c.rates && c.rates.manual) || {}) }
    },
    sections: { ...DEFAULT_CONFIG.sections, ...(c.sections || {}) },
    content: {
      ar: { ...((c.content && c.content.ar) || {}) },
      en: { ...((c.content && c.content.en) || {}) },
      tr: { ...((c.content && c.content.tr) || {}) }
    },
    media: { ...(c.media || {}) }
  };
}

let current = normalizeConfig(null);
const listeners = new Set();

export function getConfig() {
  return current;
}

export function getOriginalTranslations() {
  return ORIGINAL_TRANSLATIONS;
}

export function subscribeConfig(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Push a config into all runtime modules */
export function applyConfig(rawConfig) {
  const cfg = normalizeConfig(rawConfig);
  current = cfg;

  // 1. Texts: rebuild each language from pristine originals + admin overrides
  for (const lang of Object.keys(ORIGINAL_TRANSLATIONS)) {
    const base = JSON.parse(JSON.stringify(ORIGINAL_TRANSLATIONS[lang]));
    const overrides = cfg.content[lang] || {};
    for (const key of Object.keys(overrides)) {
      if (overrides[key] !== undefined && overrides[key] !== null) base[key] = overrides[key];
    }
    translations[lang] = base;
  }

  // 2. Contact / WhatsApp
  applyWhatsAppConfig(cfg.contact.whatsappPhone, cfg.contact.whatsappDisplay);

  // 3. Pricing rules
  setPricingRules(cfg.pricing);

  // 4. Exchange rates
  setManualRates(cfg.rates.mode === 'manual' ? cfg.rates.manual : null);

  // 5. Media
  applyMediaOverrides(cfg.media);

  listeners.forEach((fn) => {
    try { fn(cfg); } catch (e) { console.error(e); }
  });
  return cfg;
}

/** Synchronous boot from cache – call before first render */
export function bootFromCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) applyConfig(JSON.parse(raw));
    else applyConfig(null);
  } catch {
    applyConfig(null);
  }
}

/** Fetch latest settings from Supabase and apply if they changed */
export async function refreshConfigFromServer() {
  if (!isSupabaseConfigured) return current;
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('data')
      .eq('id', 'main')
      .maybeSingle();
    if (error) throw error;
    const remote = (data && data.data) || {};
    const remoteStr = JSON.stringify(normalizeConfig(remote));
    if (remoteStr !== JSON.stringify(current)) {
      applyConfig(remote);
    }
    localStorage.setItem(CACHE_KEY, JSON.stringify(remote));
  } catch (e) {
    console.warn('Could not load site settings, using cached/default values:', e);
  }
  return current;
}

/** Admin: persist a full config */
export async function saveConfig(nextConfig) {
  const cfg = normalizeConfig(nextConfig);
  if (isSupabaseConfigured) {
    const { error } = await supabase
      .from('site_settings')
      .upsert({ id: 'main', data: cfg, updated_at: new Date().toISOString() });
    if (error) throw error;
  }
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(cfg)); } catch { /* ignore quota */ }
  applyConfig(cfg);
  return cfg;
}
