/**
 * Central media registry.
 * Components import these as live ES-module bindings, so when the admin
 * replaces an image from the dashboard, `applyMediaOverrides` reassigns the
 * binding and every component picks up the new URL on its next render.
 */
import defaultHero1 from '../assets/hero1.png';
import defaultHero2 from '../assets/hero2.png';
import defaultHero3 from '../assets/hero3.jpg';
import defaultBefore from '../assets/brows-before.jpg';
import defaultAfter from '../assets/brows-after.jpg';
import defaultLogo from '../assets/logo.png';
import defaultLogoWhite from '../assets/logo-white.png';

export const MEDIA_DEFAULTS = {
  hero1: defaultHero1,
  hero2: defaultHero2,
  hero3: defaultHero3,
  before: defaultBefore,
  after: defaultAfter,
  logo: defaultLogo,
  logoWhite: defaultLogoWhite,
  promoVideo: '/promo.mp4'
};

/** Human-readable labels used by the admin Media panel */
export const MEDIA_LABELS = {
  hero1: { label: 'صورة المنتج الرئيسية (Hero 1)', type: 'image', usedIn: 'الواجهة، الباقات، السلة، الشريط الثابت' },
  hero2: { label: 'صورة المنتج الثانية (Hero 2)', type: 'image', usedIn: 'الواجهة، المشكلة والحل، الفيديو' },
  hero3: { label: 'صورة نمط الحياة (Hero 3)', type: 'image', usedIn: 'الواجهة، طريقة الاستخدام' },
  before: { label: 'صورة قبل الاستخدام', type: 'image', usedIn: 'قسم النتائج' },
  after: { label: 'صورة بعد الاستخدام', type: 'image', usedIn: 'قسم النتائج' },
  logo: { label: 'الشعار (داكن)', type: 'image', usedIn: 'الهيدر، شاشة التحميل' },
  logoWhite: { label: 'الشعار (أبيض)', type: 'image', usedIn: 'الفوتر' },
  promoVideo: { label: 'الفيديو الترويجي', type: 'video', usedIn: 'نافذة مشاهدة الفيديو' }
};

export let hero1 = MEDIA_DEFAULTS.hero1;
export let hero2 = MEDIA_DEFAULTS.hero2;
export let hero3 = MEDIA_DEFAULTS.hero3;
export let before = MEDIA_DEFAULTS.before;
export let after = MEDIA_DEFAULTS.after;
export let logo = MEDIA_DEFAULTS.logo;
export let logoWhite = MEDIA_DEFAULTS.logoWhite;
export let promoVideo = MEDIA_DEFAULTS.promoVideo;

export function applyMediaOverrides(overrides = {}) {
  const pick = (key) => (overrides && typeof overrides[key] === 'string' && overrides[key].trim()) || MEDIA_DEFAULTS[key];
  hero1 = pick('hero1');
  hero2 = pick('hero2');
  hero3 = pick('hero3');
  before = pick('before');
  after = pick('after');
  logo = pick('logo');
  logoWhite = pick('logoWhite');
  promoVideo = pick('promoVideo');
}
