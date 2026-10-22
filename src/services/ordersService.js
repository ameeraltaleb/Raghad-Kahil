/**
 * Orders data layer:
 * Uses Google Firebase Firestore when configured, with seamless localStorage fallback.
 */
import { db, isFirebaseConfigured } from '../lib/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  limit,
  onSnapshot 
} from 'firebase/firestore';

const LOCAL_KEY = 'raghad_whatsapp_orders';

const readLocal = () => {
  try {
    const list = JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
};

const writeLocal = (list) => {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(list.slice(0, 300)));
  } catch (e) {
    console.warn('localStorage write failed:', e);
  }
};

/**
 * Public: Customer confirms order.
 * Saves to Firebase Firestore and local cache.
 */
export async function recordOrder(order) {
  const item = {
    id: order.id,
    createdAt: new Date().toISOString(),
    status: 'new',
    quantity: Number(order.quantity) || 1,
    bundleTitle: order.bundleTitle || `${order.quantity} عبوة`,
    price: order.price != null ? String(order.price) : null,
    finalTotal: order.finalTotal != null ? Number(order.finalTotal) : null,
    currency: order.currency || null,
    customerName: String(order.customerName || 'عميلة جديدة').slice(0, 120),
    phone: String(order.phone || '').slice(0, 40),
    country: String(order.country || '').slice(0, 120),
    city: String(order.city || '').slice(0, 120),
    address: String(order.address || '').slice(0, 500),
    notes: String(order.notes || '').slice(0, 1000),
    paymentMethod: order.paymentMethod || 'cod',
    hasFreeGift: Boolean(order.hasFreeGift),
    lang: order.lang || 'ar',
    whatsappMessage: String(order.whatsappMessage || '').slice(0, 5000),
    adminNote: ''
  };

  // Always update local cache for immediate feedback
  const list = readLocal();
  list.unshift(item);
  writeLocal(list);

  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'orders', order.id), item);
    } catch (err) {
      console.error('Firebase save order failed:', err);
    }
  }
}

/**
 * Admin: List all orders
 */
export async function listOrders() {
  if (isFirebaseConfigured && db) {
    try {
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(500));
      const snapshot = await getDocs(q);
      const remoteOrders = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      writeLocal(remoteOrders);
      return remoteOrders;
    } catch (err) {
      console.warn('Firebase list orders failed, falling back to local:', err);
    }
  }
  return readLocal();
}

/**
 * Admin: Real-time listener for incoming orders
 */
export function subscribeOrders(callback) {
  if (isFirebaseConfigured && db) {
    try {
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(500));
      const unsub = onSnapshot(q, (snapshot) => {
        const remoteOrders = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        writeLocal(remoteOrders);
        callback(remoteOrders);
      }, (e) => console.warn('Orders real-time listener warning:', e));
      return unsub;
    } catch (e) {
      console.warn('Failed to subscribe to orders:', e);
    }
  }
  callback(readLocal());
  return () => {};
}

/**
 * Admin: Update order status or internal note
 */
export async function updateOrder(id, patch) {
  const list = readLocal().map(o => (o.id === id ? { ...o, ...patch } : o));
  writeLocal(list);

  if (isFirebaseConfigured && db) {
    try {
      await updateDoc(doc(db, 'orders', id), patch);
    } catch (err) {
      console.error('Firebase update order failed:', err);
    }
  }
}

/**
 * Admin: Delete order
 */
export async function deleteOrder(id) {
  writeLocal(readLocal().filter(o => o.id !== id));

  if (isFirebaseConfigured && db) {
    try {
      await deleteDoc(doc(db, 'orders', id));
    } catch (err) {
      console.error('Firebase delete order failed:', err);
    }
  }
}
