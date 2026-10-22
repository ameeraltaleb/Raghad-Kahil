/**
 * Reviews data layer:
 * Google Firebase Firestore when configured, with localStorage fallback.
 */
import { db, isFirebaseConfigured } from '../lib/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  addDoc,
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy, 
  limit 
} from 'firebase/firestore';

const PENDING_KEY = 'raghad_pending_reviews';
const APPROVED_KEY = 'raghad_approved_reviews';

const readLocal = (key) => {
  try {
    const v = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
};

const writeLocal = (key, v) => {
  try {
    localStorage.setItem(key, JSON.stringify(v));
  } catch (e) {
    console.warn('localStorage write failed:', e);
  }
};

const sanitize = (r) => ({
  name: String(r.name || '').trim().slice(0, 80),
  location: String(r.location || 'عميلة موثقة').trim().slice(0, 80),
  rating: Math.min(5, Math.max(1, Number(r.rating) || 5)),
  text: String(r.text || '').trim().slice(0, 1500),
  recommended: r.recommended !== false,
  lang: r.lang || 'ar',
  createdAt: new Date().toISOString()
});

/**
 * Public: Approved reviews shown on the store
 */
export async function listApprovedReviews() {
  if (isFirebaseConfigured && db) {
    try {
      const q = query(
        collection(db, 'reviews'), 
        where('status', '==', 'approved'),
        limit(200)
      );
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      writeLocal(APPROVED_KEY, list);
      return list;
    } catch (err) {
      console.warn('Firebase listApprovedReviews failed, using local:', err);
    }
  }
  return readLocal(APPROVED_KEY);
}

/**
 * Public: Customer submits a new review (pending moderation by Admin)
 */
export async function submitReview(review) {
  const clean = {
    ...sanitize(review),
    status: 'pending',
    date: new Date().toLocaleDateString('ar-SA'),
    time: 'الآن'
  };

  if (isFirebaseConfigured && db) {
    try {
      const docRef = await addDoc(collection(db, 'reviews'), clean);
      const itemWithId = { ...clean, id: docRef.id };
      const currentPending = readLocal(PENDING_KEY);
      currentPending.unshift(itemWithId);
      writeLocal(PENDING_KEY, currentPending);
      return itemWithId;
    } catch (err) {
      console.error('Firebase submit review failed:', err);
    }
  }

  // Fallback to local
  const list = readLocal(PENDING_KEY);
  const localItem = { ...clean, id: `rev-${Date.now()}` };
  list.unshift(localItem);
  writeLocal(PENDING_KEY, list);
  return localItem;
}

/**
 * Admin: List all reviews (pending + approved)
 */
export async function listAllReviews() {
  if (isFirebaseConfigured && db) {
    try {
      const snapshot = await getDocs(collection(db, 'reviews'));
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      return list;
    } catch (err) {
      console.warn('Firebase listAllReviews failed, using local:', err);
    }
  }
  return [
    ...readLocal(PENDING_KEY).map(r => ({ ...r, status: 'pending' })),
    ...readLocal(APPROVED_KEY).map(r => ({ ...r, status: 'approved' }))
  ];
}

/**
 * Admin: Approve or Reject
 */
export async function setReviewStatus(review, status) {
  const pending = readLocal(PENDING_KEY).filter(r => r.id !== review.id);
  const approved = readLocal(APPROVED_KEY).filter(r => r.id !== review.id);

  if (status === 'approved') approved.unshift({ ...review, status, time: 'حديثاً' });
  if (status === 'pending') pending.unshift({ ...review, status });

  writeLocal(PENDING_KEY, pending);
  writeLocal(APPROVED_KEY, approved);

  if (isFirebaseConfigured && db && review.id && !review.id.startsWith('rev-')) {
    try {
      await updateDoc(doc(db, 'reviews', review.id), { status });
    } catch (err) {
      console.error('Firebase update review status failed:', err);
    }
  }
}

/**
 * Admin: Delete review
 */
export async function deleteReview(review) {
  writeLocal(PENDING_KEY, readLocal(PENDING_KEY).filter(r => r.id !== review.id));
  writeLocal(APPROVED_KEY, readLocal(APPROVED_KEY).filter(r => r.id !== review.id));

  if (isFirebaseConfigured && db && review.id && !review.id.startsWith('rev-')) {
    try {
      await deleteDoc(doc(db, 'reviews', review.id));
    } catch (err) {
      console.error('Firebase delete review failed:', err);
    }
  }
}

/**
 * Admin: Directly publish an approved review (e.g. from WhatsApp/Instagram)
 */
export async function addApprovedReview(review) {
  const clean = {
    ...sanitize(review),
    status: 'approved',
    date: new Date().toLocaleDateString('ar-SA'),
    time: 'حديثاً'
  };

  const list = readLocal(APPROVED_KEY);
  const localId = `rev-${Date.now()}`;
  list.unshift({ ...clean, id: localId });
  writeLocal(APPROVED_KEY, list);

  if (isFirebaseConfigured && db) {
    try {
      await addDoc(collection(db, 'reviews'), clean);
    } catch (err) {
      console.error('Firebase add approved review failed:', err);
    }
  }
}
