/**
 * Orders data layer – Supabase when configured, localStorage fallback otherwise.
 */
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const LOCAL_KEY = 'raghad_whatsapp_orders';

const toRow = (o) => ({
  id: o.id,
  status: 'new',
  quantity: Number(o.quantity) || 1,
  bundle_title: o.bundleTitle || null,
  price: o.price != null ? String(o.price) : null,
  final_total: o.finalTotal != null ? Number(o.finalTotal) : null,
  currency: o.currency || null,
  customer_name: String(o.customerName || '').slice(0, 120),
  phone: String(o.phone || '').slice(0, 40),
  country: String(o.country || '').slice(0, 120),
  city: String(o.city || '').slice(0, 120),
  address: String(o.address || '').slice(0, 500),
  notes: String(o.notes || '').slice(0, 1000),
  payment_method: o.paymentMethod || 'cod',
  has_free_gift: Boolean(o.hasFreeGift),
  lang: o.lang || null,
  whatsapp_message: String(o.whatsappMessage || '').slice(0, 5000)
});

export const fromRow = (r) => ({
  id: r.id,
  createdAt: r.created_at || r.timestamp,
  status: r.status || 'new',
  quantity: r.quantity,
  bundleTitle: r.bundle_title ?? r.bundleTitle,
  price: r.price,
  finalTotal: r.final_total ?? r.finalTotal,
  currency: r.currency,
  customerName: r.customer_name ?? r.customerName,
  phone: r.phone,
  country: r.country,
  city: r.city,
  address: r.address,
  notes: r.notes,
  paymentMethod: r.payment_method ?? r.paymentMethod,
  hasFreeGift: r.has_free_gift ?? r.hasFreeGift,
  lang: r.lang,
  whatsappMessage: r.whatsapp_message ?? r.whatsappMessage,
  adminNote: r.admin_note ?? r.adminNote ?? ''
});

const readLocal = () => {
  try {
    const list = JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
};
const writeLocal = (list) => localStorage.setItem(LOCAL_KEY, JSON.stringify(list.slice(0, 300)));

/** Public: called when a customer confirms an order */
export async function recordOrder(order) {
  if (isSupabaseConfigured) {
    // No .select() – anonymous visitors are not allowed to read orders back
    const { error } = await supabase.from('orders').insert(toRow(order));
    if (error) throw error;
    return;
  }
  const list = readLocal();
  list.unshift({ ...order, status: 'new', createdAt: new Date().toISOString() });
  writeLocal(list);
}

/** Admin */
export async function listOrders() {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1000);
    if (error) throw error;
    return (data || []).map(fromRow);
  }
  return readLocal().map(fromRow);
}

export async function updateOrder(id, patch) {
  const row = {};
  if (patch.status !== undefined) row.status = patch.status;
  if (patch.adminNote !== undefined) row.admin_note = patch.adminNote;
  if (isSupabaseConfigured) {
    const { error } = await supabase.from('orders').update(row).eq('id', id);
    if (error) throw error;
    return;
  }
  writeLocal(readLocal().map((o) => (o.id === id ? { ...o, ...patch } : o)));
}

export async function deleteOrder(id) {
  if (isSupabaseConfigured) {
    const { error } = await supabase.from('orders').delete().eq('id', id);
    if (error) throw error;
    return;
  }
  writeLocal(readLocal().filter((o) => o.id !== id));
}
