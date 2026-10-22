/**
 * Reviews data layer – Supabase when configured, localStorage fallback otherwise.
 */
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const PENDING_KEY = 'raghad_pending_reviews';
const APPROVED_KEY = 'raghad_approved_reviews';

const fromRow = (r) => ({
  id: r.id,
  createdAt: r.created_at,
  status: r.status,
  name: r.name,
  location: r.location,
  rating: r.rating,
  text: r.text,
  recommended: r.recommended,
  lang: r.lang,
  date: r.created_at ? new Date(r.created_at).toLocaleDateString('ar-SA') : r.date,
  time: r.time
});

const readLocal = (key) => {
  try {
    const v = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
};
const writeLocal = (key, v) => localStorage.setItem(key, JSON.stringify(v));

const sanitize = (r) => ({
  name: String(r.name || '').trim().slice(0, 80),
  location: String(r.location || '').trim().slice(0, 80),
  rating: Math.min(5, Math.max(1, Number(r.rating) || 5)),
  text: String(r.text || '').trim().slice(0, 1500),
  recommended: r.recommended !== false,
  lang: r.lang || null
});

/** Public: approved reviews shown on the site */
export async function listApprovedReviews() {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(200);
    if (error) throw error;
    return (data || []).map(fromRow);
  }
  return readLocal(APPROVED_KEY);
}

/** Public: customer submits a review (always pending) */
export async function submitReview(review) {
  const clean = sanitize(review);
  if (isSupabaseConfigured) {
    const { error } = await supabase.from('reviews').insert({ ...clean, status: 'pending' });
    if (error) throw error;
    return;
  }
  const list = readLocal(PENDING_KEY);
  list.unshift({ ...clean, id: Date.now(), status: 'pending', date: new Date().toLocaleDateString('ar-SA') });
  writeLocal(PENDING_KEY, list);
}

/** Admin: all reviews */
export async function listAllReviews() {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1000);
    if (error) throw error;
    return (data || []).map(fromRow);
  }
  return [
    ...readLocal(PENDING_KEY).map((r) => ({ ...r, status: 'pending' })),
    ...readLocal(APPROVED_KEY).map((r) => ({ ...r, status: 'approved' }))
  ];
}

export async function setReviewStatus(review, status) {
  if (isSupabaseConfigured) {
    const { error } = await supabase.from('reviews').update({ status }).eq('id', review.id);
    if (error) throw error;
    return;
  }
  const pending = readLocal(PENDING_KEY).filter((r) => r.id !== review.id);
  const approved = readLocal(APPROVED_KEY).filter((r) => r.id !== review.id);
  if (status === 'approved') approved.unshift({ ...review, status, time: 'حديثاً' });
  if (status === 'pending') pending.unshift({ ...review, status });
  writeLocal(PENDING_KEY, pending);
  writeLocal(APPROVED_KEY, approved);
}

export async function deleteReview(review) {
  if (isSupabaseConfigured) {
    const { error } = await supabase.from('reviews').delete().eq('id', review.id);
    if (error) throw error;
    return;
  }
  writeLocal(PENDING_KEY, readLocal(PENDING_KEY).filter((r) => r.id !== review.id));
  writeLocal(APPROVED_KEY, readLocal(APPROVED_KEY).filter((r) => r.id !== review.id));
}

/** Admin: add an already-approved review (e.g. received on WhatsApp) */
export async function addApprovedReview(review) {
  const clean = sanitize(review);
  if (isSupabaseConfigured) {
    const { error } = await supabase.from('reviews').insert({ ...clean, status: 'approved' });
    if (error) throw error;
    return;
  }
  const list = readLocal(APPROVED_KEY);
  list.unshift({ ...clean, id: Date.now(), status: 'approved', time: 'حديثاً' });
  writeLocal(APPROVED_KEY, list);
}
