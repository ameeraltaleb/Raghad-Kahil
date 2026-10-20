/**
 * Live Currency Exchange Service
 * Fetches real-time market exchange rates (base USD) from open.er-api.com
 * Caches results in localStorage for 6 hours for instant performance.
 */

const CACHE_KEY = 'raghad_live_exchange_rates';
const CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours

// High-confidence fallback rates
export const DEFAULT_RATES = {
  USD: 1,
  TRY: 49.5,
  SAR: 3.75,
  AED: 3.67,
  EUR: 0.90
};

/**
 * Reads cached rates if available and fresh, otherwise returns default rates.
 */
export function getStoredRates() {
  if (typeof window === 'undefined') return DEFAULT_RATES;

  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      if (data && data.rates && (Date.now() - data.timestamp < CACHE_TTL)) {
        return { ...DEFAULT_RATES, ...data.rates };
      }
    }
  } catch (e) {
    console.warn('Failed to read cached currency rates:', e);
  }

  return DEFAULT_RATES;
}

/**
 * Fetches live exchange rates in the background and updates cache.
 * Applies a safety buffer margin if desired.
 */
export async function fetchLiveRates() {
  if (typeof window === 'undefined') return DEFAULT_RATES;

  try {
    const response = await fetch('https://open.er-api.com/v6/latest/USD');
    if (!response.ok) throw new Error('Network error fetching rates');

    const data = await response.json();
    if (data && data.result === 'success' && data.rates) {
      const newRates = {
        USD: 1,
        TRY: Number(data.rates.TRY ? data.rates.TRY.toFixed(2) : DEFAULT_RATES.TRY),
        SAR: Number(data.rates.SAR ? data.rates.SAR.toFixed(2) : DEFAULT_RATES.SAR),
        AED: Number(data.rates.AED ? data.rates.AED.toFixed(2) : DEFAULT_RATES.AED),
        EUR: Number(data.rates.EUR ? data.rates.EUR.toFixed(2) : DEFAULT_RATES.EUR)
      };

      localStorage.setItem(CACHE_KEY, JSON.stringify({
        timestamp: Date.now(),
        rates: newRates
      }));

      return newRates;
    }
  } catch (err) {
    console.warn('Could not fetch latest exchange rates, using fallback:', err);
  }

  return getStoredRates();
}
