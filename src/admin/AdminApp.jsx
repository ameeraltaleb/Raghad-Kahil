import React, { useState, useEffect, useMemo } from 'react';
import { 
  Lock, ArrowLeft, ArrowRight, Package, MessageSquare, Star, 
  CheckCircle2, Clock, Trash2, Check, X, Copy, ExternalLink, 
  Search, ShieldCheck, User, Phone, MapPin, Plus, RefreshCw, Send,
  MessageCircle, Eye, EyeOff, KeyRound, AlertTriangle, Shield,
  Sliders, DollarSign, Image as ImageIcon, FileText, ToggleLeft, ToggleRight,
  Save, Database, LogOut, Upload, Globe, Layers, AlertCircle, Info, Edit3
} from 'lucide-react';
import { auth, storage, isFirebaseConfigured } from '../lib/firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getConfig, saveConfig, SECTION_LABELS, DEFAULT_CONFIG } from '../config/siteConfig';
import { listOrders, updateOrder, deleteOrder, subscribeOrders } from '../services/ordersService';
import { listAllReviews, setReviewStatus, deleteReview, addApprovedReview, subscribeAllReviews } from '../services/reviewsService';
import { MEDIA_LABELS, MEDIA_DEFAULTS } from '../config/media';
import { translations } from '../translations';

// Default master password hash (SHA-256) - zero plaintext credentials in UI
const DEFAULT_PASSWORD_HASH = '6b6c0168bc7929abce425fdec4183d44aa421aafa6415dd54ded055801d083d2';
const PASSWORD_HASH_KEY = 'raghad_admin_pw_hash';
const LOCAL_SESSION_KEY = 'raghad_admin_local_auth';

// Helper: SHA-256 for browser
async function hashCredential(text) {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return String(hash);
}

export default function AdminApp({ onBackToStore, lang = 'ar' }) {
  const isRtl = lang === 'ar';
  const ArrowIcon = isRtl ? ArrowRight : ArrowLeft;

  // ==========================================
  // AUTHENTICATION STATE
  // ==========================================
  const [session, setSession] = useState(null);
  const [localAuth, setLocalAuth] = useState(() => {
    try {
      return sessionStorage.getItem(LOCAL_SESSION_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(() => {
    try {
      return Number(sessionStorage.getItem('raghad_admin_fails') || 0);
    } catch {
      return 0;
    }
  });
  const [lockoutSeconds, setLockoutSeconds] = useState(0);

  // Check Firebase session on mount
  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setSession(user);
      });
      return () => unsubscribe();
    }
  }, []);

  // Lockout countdown timer
  useEffect(() => {
    if (lockoutSeconds <= 0) return;
    const interval = setInterval(() => {
      setLockoutSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutSeconds]);

  const isAuthenticated = Boolean(session || localAuth);

  // Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    if (lockoutSeconds > 0 || authLoading) return;
    setAuthError('');
    setAuthLoading(true);

    try {
      // 1. Firebase Auth Mode
      if (isFirebaseConfigured && auth && authEmail.trim()) {
        await signInWithEmailAndPassword(auth, authEmail.trim(), authPassword);
        setAuthLoading(false);
        return;
      }

      // 2. Local PIN / Master Password Mode
      const hashedInput = await hashCredential(authPassword.trim());
      const targetHash = localStorage.getItem(PASSWORD_HASH_KEY) || DEFAULT_PASSWORD_HASH;

      if (hashedInput === targetHash) {
        setLocalAuth(true);
        sessionStorage.setItem(LOCAL_SESSION_KEY, 'true');
        sessionStorage.removeItem('raghad_admin_fails');
        setFailedAttempts(0);
        setAuthPassword('');
      } else {
        const newFails = failedAttempts + 1;
        setFailedAttempts(newFails);
        sessionStorage.setItem('raghad_admin_fails', String(newFails));

        if (newFails >= 5) {
          setLockoutSeconds(60);
          setAuthError('تم تجميد محاولات الدخول مؤقتاً لمدة 60 ثانية لحماية النظام.');
        } else {
          setAuthError(`كلمة المرور غير صحيحة. متبقي ${5 - newFails} محاولات قبل التجميد.`);
        }
      }
    } catch (err) {
      console.error('Auth error:', err);
      setAuthError(err.message || 'حدث خطأ أثناء تسجيل الدخول.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    if (isFirebaseConfigured && auth) {
      try {
        await signOut(auth);
      } catch (err) {
        console.warn('Sign out error:', err);
      }
    }
    setSession(null);
    setLocalAuth(false);
    sessionStorage.removeItem(LOCAL_SESSION_KEY);
  };

  // ==========================================
  // DASHBOARD MAIN STATE
  // ==========================================
  const [activeTab, setActiveTab] = useState('orders'); // orders, reviews, pricing, contact, sections, content, media, settings
  const [configDraft, setConfigDraft] = useState(() => getConfig());
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [saveToast, setSaveToast] = useState('');

  // Orders State
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [selectedOrderPreview, setSelectedOrderPreview] = useState(null);
  const [copiedOrderId, setCopiedOrderId] = useState(null);

  // Reviews State
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewTab, setReviewTab] = useState('pending'); // pending, approved, add
  const [newReviewForm, setNewReviewForm] = useState({
    name: '',
    location: '',
    rating: 5,
    text: '',
    recommended: true
  });

  // Content Editor State
  const [contentLang, setContentLang] = useState('ar');
  const [contentDraft, setContentDraft] = useState({
    announcement: '',
    heroHeadline: '',
    heroSubtitle: '',
    heroPamperBadge: '',
    problemTitle: '',
    ingredientsTitle: '',
    detailsTitle: '',
    faqTitle: ''
  });

  // Media Tab State
  const [mediaDraft, setMediaDraft] = useState(() => configDraft.media || {});
  const [uploadingKey, setUploadingKey] = useState(null);

  // Change Password Modal
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwChangeMsg, setPwChangeMsg] = useState({ type: '', text: '' });

  // Load Initial Data
  const loadOrders = async () => {
    setOrdersLoading(true);
    try {
      const data = await listOrders();
      setOrders(data);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setOrdersLoading(false);
    }
  };

  const loadReviews = async () => {
    setReviewsLoading(true);
    try {
      const data = await listAllReviews();
      setReviews(data);
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      const unsubOrders = subscribeOrders((data) => {
        setOrders(data);
        setOrdersLoading(false);
      });
      const unsubReviews = subscribeAllReviews((data) => {
        setReviews(data);
        setReviewsLoading(false);
      });
      const cfg = getConfig();
      setConfigDraft(cfg);
      setMediaDraft(cfg.media || {});

      return () => {
        if (typeof unsubOrders === 'function') unsubOrders();
        if (typeof unsubReviews === 'function') unsubReviews();
      };
    }
  }, [isAuthenticated]);

  // Sync content editor fields with current language & config
  useEffect(() => {
    const activeText = translations[contentLang] || translations.ar;
    setContentDraft({
      announcement: activeText.announcement || '',
      heroHeadline: activeText.hero?.headline || '',
      heroSubtitle: activeText.hero?.subtitle || '',
      heroPamperBadge: activeText.hero?.pamperBadge || '',
      problemTitle: activeText.problemSolution?.title || '',
      ingredientsTitle: activeText.ingredients?.title || '',
      detailsTitle: activeText.productDetails?.title || '',
      faqTitle: activeText.faq?.title || ''
    });
  }, [contentLang, configDraft]);

  // Show Toast Helper
  const showToast = (msg) => {
    setSaveToast(msg);
    setTimeout(() => setSaveToast(''), 3000);
  };

  // Save Config Helper
  const handleSaveWholeConfig = async (overrideCfg) => {
    setIsSavingConfig(true);
    try {
      const toSave = overrideCfg || configDraft;
      await saveConfig(toSave);
      setConfigDraft(toSave);
      showToast('تم حفظ التعديلات وتطبيقها على المتجر بنجاح! ✨');
    } catch (err) {
      console.error('Save config failed:', err);
      showToast('حدث خطأ أثناء الحفظ: ' + err.message);
    } finally {
      setIsSavingConfig(false);
    }
  };

  // Orders Actions
  const handleUpdateStatus = async (id, status) => {
    try {
      await updateOrder(id, { status });
      setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
      showToast('تم تحديث حالة الطلب بنجاح');
    } catch (err) {
      alert('فشل تحديث الطلب: ' + err.message);
    }
  };

  const handleDeleteOrder = async (id) => {
    if (window.confirm('هل أنتِ متأكدة من حذف هذا الطلب نهائياً من السجل؟')) {
      try {
        await deleteOrder(id);
        setOrders(orders.filter(o => o.id !== id));
        showToast('تم حذف الطلب بنجاح');
      } catch (err) {
        alert('فشل الحذف: ' + err.message);
      }
    }
  };

  const handleCopyMessage = (order) => {
    if (order?.whatsappMessage) {
      navigator.clipboard.writeText(order.whatsappMessage);
      setCopiedOrderId(order.id);
      setTimeout(() => setCopiedOrderId(null), 2500);
    }
  };

  // Reviews Actions
  const handleReviewStatus = async (item, status) => {
    try {
      await setReviewStatus(item, status);
      setReviews(reviews.map(r => r.id === item.id ? { ...r, status } : r));
      showToast(status === 'approved' ? 'تم اعتماد ونشر التقييم على المتجر ✅' : 'تم رفض التقييم');
    } catch (err) {
      alert('فشل تحديث التقييم: ' + err.message);
    }
  };

  const handleDeleteReview = async (item) => {
    if (window.confirm('هل أنتِ متأكدة من إزالة هذا التقييم نهائياً؟')) {
      try {
        await deleteReview(item);
        setReviews(reviews.filter(r => r.id !== item.id));
        showToast('تم حذف التقييم');
      } catch (err) {
        alert('فشل حذف التقييم: ' + err.message);
      }
    }
  };

  const handleCreateApprovedReview = async (e) => {
    e.preventDefault();
    if (!newReviewForm.name.trim() || !newReviewForm.text.trim()) return;

    try {
      await addApprovedReview({
        name: newReviewForm.name.trim(),
        location: newReviewForm.location.trim() || 'عميلة موثقة',
        rating: Number(newReviewForm.rating),
        text: newReviewForm.text.trim(),
        recommended: newReviewForm.recommended,
        lang: contentLang
      });
      await loadReviews();
      setNewReviewForm({ name: '', location: '', rating: 5, text: '', recommended: true });
      setReviewTab('approved');
      showToast('تم نشر التقييم بنجاح على الموقع 🚀');
    } catch (err) {
      alert('فشل إضافة التقييم: ' + err.message);
    }
  };

  // Change Password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwChangeMsg({ type: '', text: '' });

    if (newPassword.length < 4) {
      setPwChangeMsg({ type: 'error', text: 'كلمة المرور الجديدة يجب أن تكون 4 خانات على الأقل.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwChangeMsg({ type: 'error', text: 'كلمتا المرور غير متطابقتين.' });
      return;
    }

    try {
      const oldHash = await hashCredential(oldPassword.trim());
      const currentTarget = localStorage.getItem(PASSWORD_HASH_KEY) || DEFAULT_PASSWORD_HASH;

      if (oldHash !== currentTarget) {
        setPwChangeMsg({ type: 'error', text: 'كلمة المرور الحالية غير صحيحة.' });
        return;
      }

      const newHash = await hashCredential(newPassword.trim());
      localStorage.setItem(PASSWORD_HASH_KEY, newHash);
      setPwChangeMsg({ type: 'success', text: 'تم تحديث الرمز السري بنجاح!' });
      setTimeout(() => {
        setIsPasswordModalOpen(false);
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setPwChangeMsg({ type: '', text: '' });
      }, 1500);
    } catch (err) {
      setPwChangeMsg({ type: 'error', text: 'فشل التحديث: ' + err.message });
    }
  };

  // Upload Media File to Firebase Storage Bucket
  const handleUploadFile = async (key, file) => {
    if (!file) return;
    if (!isFirebaseConfigured || !storage) {
      alert('رفع الملفات التلقائي يتطلب ربط Firebase Storage. يمكنك حالياً وضع رابط الصورة (URL) مباشرة بالأسفل.');
      return;
    }
    setUploadingKey(key);
    try {
      const ext = file.name.split('.').pop();
      const fileName = `media/${key}-${Date.now()}.${ext}`;
      const fileRef = storageRef(storage, fileName);
      await uploadBytes(fileRef, file);
      const publicUrl = await getDownloadURL(fileRef);

      const nextMedia = { ...mediaDraft, [key]: publicUrl };
      setMediaDraft(nextMedia);
      const nextCfg = { ...configDraft, media: nextMedia };
      setConfigDraft(nextCfg);
      await saveConfig(nextCfg);
      showToast('تم رفع الصورة وتحديث المتجر بنجاح!');
    } catch (err) {
      alert('فشل رفع الملف: ' + err.message);
    } finally {
      setUploadingKey(null);
    }
  };

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      if (orderStatusFilter !== 'all' && o.status !== orderStatusFilter) return false;
      if (!orderSearch.trim()) return true;
      const q = orderSearch.toLowerCase().trim();
      return (
        (o.id && o.id.toLowerCase().includes(q)) ||
        (o.customerName && o.customerName.toLowerCase().includes(q)) ||
        (o.phone && o.phone.includes(q)) ||
        (o.city && o.city.toLowerCase().includes(q))
      );
    });
  }, [orders, orderSearch, orderStatusFilter]);

  // Pending vs Approved Reviews
  const pendingReviewsList = useMemo(() => reviews.filter(r => r.status === 'pending'), [reviews]);
  const approvedReviewsList = useMemo(() => reviews.filter(r => r.status === 'approved'), [reviews]);

  // ==========================================
  // VIEW: LOGIN SCREEN (NO PIN HINTS)
  // ==========================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-brand-bg flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-[#F3B2D4] shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 bg-[#FBC6E2] rounded-full flex items-center justify-center mx-auto text-brand-dark border border-[#F3B2D4] shadow-xs">
            <Shield className="w-8 h-8 text-brand-dark" />
          </div>

          <div>
            <h2 className="font-serif text-2xl font-bold text-brand-dark">بوابة الإدارة والتحكم</h2>
            <p className="text-xs text-brand-muted mt-1.5 leading-relaxed">
              منطقة آمنة مخصصة لإدارة كامل تفاصيل متجر رغد كحيل والطلبات والأسعار
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {isFirebaseConfigured && (
              <div className="text-start">
                <label className="block text-xs font-bold text-brand-dark mb-1">البريد الإلكتروني للإدارة</label>
                <input
                  type="email"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="admin@raghadbeauty.com"
                  className="w-full text-start py-3 px-4 rounded-2xl border border-gray-200 focus:border-[#FBC6E2] focus:ring-2 focus:ring-[#FBC6E2]/40 outline-none text-xs font-medium"
                />
              </div>
            )}

            <div className="space-y-2 text-start">
              <label className="block text-xs font-bold text-brand-dark mb-1">
                {isFirebaseConfigured ? 'كلمة المرور' : 'الرمز السري الخاص بالإدارة'}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  disabled={lockoutSeconds > 0 || authLoading}
                  placeholder="أدخل كلمة المرور السرية"
                  className={`w-full text-center ${showPassword ? 'text-base font-bold' : 'tracking-widest text-xl font-bold'} py-3.5 px-10 rounded-2xl border border-gray-200 focus:border-[#FBC6E2] focus:ring-2 focus:ring-[#FBC6E2]/40 outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed`}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute top-4 ${isRtl ? 'left-3.5' : 'right-3.5'} text-gray-400 hover:text-brand-dark cursor-pointer`}
                  tabIndex={-1}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {authError && (
                <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-bold border border-red-200 flex items-center justify-center gap-1.5 text-center mt-2">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              {lockoutSeconds > 0 && (
                <div className="p-2.5 bg-amber-50 text-amber-800 rounded-xl text-xs font-bold border border-amber-200 flex items-center justify-center gap-1.5 mt-2">
                  <Clock className="w-3.5 h-3.5 animate-spin" />
                  <span>يرجى الانتظار {lockoutSeconds} ثانية قبل إعادة المحاولة</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={lockoutSeconds > 0 || authLoading}
              className="w-full py-4 bg-[#FBC6E2] hover:bg-[#f8b4d8] text-brand-dark font-black rounded-2xl shadow-md border border-[#F3B2D4] cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>{authLoading ? 'جارٍ التحقق...' : 'دخول لوحة التحكم'}</span>
            </button>
          </form>

          <button
            type="button"
            onClick={onBackToStore}
            className="text-xs text-brand-muted hover:text-brand-dark font-medium flex items-center justify-center gap-1.5 mx-auto cursor-pointer transition-colors"
          >
            <ArrowIcon className="w-3.5 h-3.5" />
            <span>العودة للمتجر الرئيسي</span>
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW: AUTHENTICATED COMPLETE ADMIN DASHBOARD
  // ==========================================
  return (
    <div className="min-h-screen bg-brand-bg text-brand-dark font-sans pb-16 selection:bg-[#FBC6E2]">
      
      {/* Toast Notification */}
      {saveToast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-brand-dark text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-bold border border-white/20 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-4 h-4 text-[#FBC6E2]" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* Top Header Bar */}
      <header className="bg-white/95 backdrop-blur-md border-b border-[#F3B2D4]/60 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <span className="font-serif font-black text-lg tracking-wide text-brand-dark">RAGHAD KAHIL</span>
            <span className="text-xs font-bold bg-[#FBC6E2] text-brand-dark px-2.5 py-1 rounded-full border border-[#F3B2D4] flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>لوحة الإدارة الكاملة</span>
            </span>

            {/* Firebase Status Indicator */}
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
              isFirebaseConfigured 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}>
              <Database className="w-3 h-3" />
              <span>{isFirebaseConfigured ? 'Firebase متصل' : 'وضع الحفظ المحلي'}</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPasswordModalOpen(true)}
              className="text-xs font-bold text-brand-dark hover:text-brand-rose flex items-center gap-1.5 bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-xl border border-gray-200 transition-colors cursor-pointer"
              title="تغيير كلمة المرور السرية"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">الرمز السري</span>
            </button>

            <button
              onClick={onBackToStore}
              className="text-xs font-bold text-brand-dark hover:text-brand-rose flex items-center gap-1.5 bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-xl border border-gray-200 transition-colors cursor-pointer"
            >
              <ArrowIcon className="w-3.5 h-3.5" />
              <span>معاينة المتجر</span>
            </button>

            <button
              onClick={handleLogout}
              className="text-xs text-red-600 hover:text-red-700 font-bold px-3 py-2 rounded-xl hover:bg-red-50 transition-colors cursor-pointer flex items-center gap-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>قفل</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 space-y-6">

        {/* Quick Stats Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#F3B2D4]/60 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] sm:text-xs text-brand-muted font-bold">الطلبات المسجلة</p>
              <h3 className="font-serif text-2xl sm:text-3xl font-black text-brand-dark mt-1">{orders.length}</h3>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Package className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>

          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#F3B2D4]/60 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] sm:text-xs text-brand-muted font-bold">تقييمات بالانتظار</p>
              <h3 className="font-serif text-2xl sm:text-3xl font-black text-amber-600 mt-1">{pendingReviewsList.length}</h3>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>

          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#F3B2D4]/60 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] sm:text-xs text-brand-muted font-bold">سعر العبوة الفردية</p>
              <h3 className="font-serif text-2xl sm:text-3xl font-black text-brand-dark mt-1">${configDraft.pricing?.tier1 || 20}</h3>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>

          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#F3B2D4]/60 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] sm:text-xs text-brand-muted font-bold">الأقسام الفعالة</p>
              <h3 className="font-serif text-2xl sm:text-3xl font-black text-brand-rose mt-1">
                {Object.values(configDraft.sections || {}).filter(Boolean).length} / {Object.keys(SECTION_LABELS).length}
              </h3>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-[#FFF5F9] text-brand-rose flex items-center justify-center">
              <Layers className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-gray-200 scrollbar-none">
          {[
            { id: 'orders', label: 'الطلبات والمبيعات', icon: Package, badge: orders.length },
            { id: 'reviews', label: 'اعتماد التقييمات', icon: MessageSquare, badge: pendingReviewsList.length, badgeColor: 'bg-amber-500' },
            { id: 'pricing', label: 'الأسعار والباقات والعملات', icon: DollarSign },
            { id: 'contact', label: 'الواتساب والتواصل', icon: Phone },
            { id: 'sections', label: 'إظهار / إخفاء الأقسام', icon: Layers },
            { id: 'content', label: 'نصوص وترجمات المتجر', icon: FileText },
            { id: 'media', label: 'الصور والوسائط والفيديو', icon: ImageIcon },
            { id: 'settings', label: 'قاعدة البيانات والنظام', icon: Sliders }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs shrink-0 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#FBC6E2] text-brand-dark border border-[#F3B2D4] shadow-xs'
                    : 'text-brand-muted hover:text-brand-dark hover:bg-white/80'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className={`${tab.badgeColor || 'bg-brand-dark'} text-white text-[10px] font-black px-1.5 py-0.2 rounded-full`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ======================================================== */}
        {/* TAB 1: ORDERS MANAGEMENT */}
        {/* ======================================================== */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            
            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-gray-200 shadow-xs">
              <div className="relative w-full sm:w-80">
                <Search className={`w-4 h-4 text-gray-400 absolute top-3.5 ${isRtl ? 'right-3.5' : 'left-3.5'}`} />
                <input
                  type="text"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  placeholder="بحث برقم الطلب، اسم العميلة، أو الهاتف..."
                  className={`w-full ${isRtl ? 'pr-10 pl-3' : 'pl-10 pr-3'} py-2 text-xs rounded-xl border border-gray-200 focus:border-[#FBC6E2] outline-none`}
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="text-xs font-bold py-2 px-3 rounded-xl border border-gray-200 bg-gray-50 outline-none cursor-pointer flex-1 sm:flex-initial"
                >
                  <option value="all">جميع الحالات ({orders.length})</option>
                  <option value="new">🟡 جديد بانتظار الشحن</option>
                  <option value="contacted">🔵 تم التواصل والتأكيد</option>
                  <option value="shipped">🚚 تم الشحن</option>
                  <option value="completed">🟢 تم التسليم بنجاح</option>
                  <option value="cancelled">🔴 ملغي</option>
                </select>

                <button
                  onClick={loadOrders}
                  className="p-2 text-brand-dark hover:text-brand-rose bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 cursor-pointer"
                  title="تحديث القائمة"
                >
                  <RefreshCw className={`w-4 h-4 ${ordersLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center text-brand-muted border border-gray-200 space-y-2">
                <Package className="w-12 h-12 text-gray-300 mx-auto" />
                <h4 className="font-bold text-base text-brand-dark">لا توجد طلبات مسجلة تطابق البحث</h4>
                <p className="text-xs">
                  عند قيام أي مشترية بتأكيد طلبها، سيظهر الطلب هنا فوراً مع كامل التفاصيل ورسالة الواتساب.
                </p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {filteredOrders.map((order) => {
                  const sanitizedPhone = String(order.phone || '').replace(/[^0-9]/g, '');
                  const customerWhatsAppUrl = `https://wa.me/${sanitizedPhone}`;

                  return (
                    <div
                      key={order.id}
                      className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-200 shadow-2xs hover:shadow-xs transition-shadow space-y-4"
                    >
                      {/* Header of Card */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="font-mono text-xs font-black bg-brand-dark text-white px-3 py-1 rounded-full tracking-wider">
                            #{order.id}
                          </span>
                          <span className="text-xs text-brand-muted flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{order.createdAt ? new Date(order.createdAt).toLocaleDateString('ar-SA') : 'حديثاً'}</span>
                          </span>
                          <span className="text-xs font-bold bg-[#FBC6E2]/40 text-brand-dark px-2.5 py-0.5 rounded-full border border-[#F3B2D4]">
                            {order.bundleTitle} {order.price ? `· ${order.price}` : ''}
                          </span>
                          {order.hasFreeGift && (
                            <span className="text-[11px] font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200">
                              🎁 هدية مشمولة
                            </span>
                          )}
                        </div>

                        {/* Status Selector */}
                        <div className="flex items-center gap-2">
                          <select
                            value={order.status || 'new'}
                            onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                            className="text-xs font-bold py-1.5 px-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none cursor-pointer"
                          >
                            <option value="new">🟡 جديد بانتظار الشحن</option>
                            <option value="contacted">🔵 تم التواصل والتأكيد</option>
                            <option value="shipped">🚚 تم الشحن</option>
                            <option value="completed">🟢 تم التسليم بنجاح</option>
                            <option value="cancelled">🔴 ملغي</option>
                          </select>

                          <button
                            onClick={() => handleDeleteOrder(order.id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                            title="حذف الطلب"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                        <div className="space-y-1">
                          <span className="text-brand-muted font-bold block">مقدم الطلب:</span>
                          <div className="font-bold text-brand-dark flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-brand-rose shrink-0" />
                            <span>{order.customerName}</span>
                          </div>
                          {order.phone && (
                            <div className="text-brand-dark flex items-center gap-1.5 pt-0.5">
                              <Phone className="w-3.5 h-3.5 text-brand-rose shrink-0" />
                              <span dir="ltr">{order.phone}</span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-1 sm:col-span-2">
                          <span className="text-brand-muted font-bold block">عنوان التوصيل:</span>
                          <div className="text-brand-dark flex items-start gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-brand-rose shrink-0 mt-0.5" />
                            <span>
                              {order.country ? `${order.country} · ` : ''}
                              {order.city ? `${order.city} · ` : ''}
                              {order.address || 'العنوان غير مدخل'}
                            </span>
                          </div>
                          {order.notes && (
                            <div className="bg-amber-50 p-2 rounded-xl text-amber-800 text-[11px] font-medium border border-amber-200 mt-1">
                              📝 ملاحظة الزبونة: {order.notes}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                          {order.phone && (
                            <a
                              href={customerWhatsAppUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold border border-emerald-200 transition-colors"
                            >
                              <MessageCircle className="w-3.5 h-3.5 text-emerald-600 fill-current" />
                              <span>مراسلة الزبونة على واتساب</span>
                            </a>
                          )}

                          <button
                            onClick={() => handleCopyMessage(order)}
                            className="inline-flex items-center gap-1.5 px-3 py-2 bg-gray-50 hover:bg-gray-100 text-brand-dark rounded-xl text-xs font-bold border border-gray-200 transition-colors cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>{copiedOrderId === order.id ? 'تم نسخ التذكرة! ✓' : 'نسخ رسالة الطلب'}</span>
                          </button>
                        </div>

                        <button
                          onClick={() => setSelectedOrderPreview(order)}
                          className="text-xs text-brand-rose hover:underline font-bold cursor-pointer"
                        >
                          معاينة تذكرة الواتساب الكاملة ➔
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: REVIEWS MODERATION */}
        {/* ======================================================== */}
        {activeTab === 'reviews' && (
          <div className="space-y-4">
            
            {/* Reviews Sub-Tabs */}
            <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-gray-200 w-fit flex-wrap">
              <button
                onClick={() => setReviewTab('pending')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  reviewTab === 'pending' ? 'bg-[#FBC6E2] text-brand-dark shadow-xs' : 'text-brand-muted hover:text-brand-dark'
                }`}
              >
                بانتظار الموافقة ({pendingReviewsList.length})
              </button>

              <button
                onClick={() => setReviewTab('approved')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  reviewTab === 'approved' ? 'bg-[#FBC6E2] text-brand-dark shadow-xs' : 'text-brand-muted hover:text-brand-dark'
                }`}
              >
                التقييمات المنشورة بالموقع ({approvedReviewsList.length})
              </button>

              <button
                onClick={() => setReviewTab('add')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  reviewTab === 'add' ? 'bg-[#FBC6E2] text-brand-dark shadow-xs' : 'text-brand-muted hover:text-brand-dark'
                }`}
              >
                + إضافة تقييم معتمد جديد
              </button>
            </div>

            {/* PENDING LIST */}
            {reviewTab === 'pending' && (
              <div className="space-y-3">
                {pendingReviewsList.length === 0 ? (
                  <div className="bg-white rounded-3xl p-12 text-center text-brand-muted border border-gray-200">
                    <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2 opacity-60" />
                    <h4 className="font-bold text-base text-brand-dark">لا توجد تقييمات معلقة حالياً</h4>
                    <p className="text-xs mt-1">جميع التقييمات تم مراجعتها واعتمادها بنجاح.</p>
                  </div>
                ) : (
                  pendingReviewsList.map(item => (
                    <div key={item.id} className="bg-white rounded-3xl p-5 border border-amber-200 shadow-2xs space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-brand-dark">{item.name}</span>
                          <span className="text-xs text-brand-muted">({item.location || 'عميلة موثقة'})</span>
                        </div>
                        <div className="flex text-yellow-400 gap-0.5">
                          {[...Array(item.rating || 5)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-current" />
                          ))}
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-brand-dark italic bg-[#FFF5F9] p-3 rounded-2xl border border-[#F3B2D4]/50">
                        "{item.text}"
                      </p>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] text-brand-muted flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{item.date || 'حديثاً'}</span>
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDeleteReview(item)}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 border border-red-200 transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>رفض / حذف</span>
                          </button>
                          <button
                            onClick={() => handleReviewStatus(item, 'approved')}
                            className="px-4 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>موافقة ونشر للجميع ✅</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* APPROVED LIST */}
            {reviewTab === 'approved' && (
              <div className="space-y-3">
                {approvedReviewsList.length === 0 ? (
                  <div className="bg-white rounded-3xl p-10 text-center text-brand-muted border border-gray-200 text-xs">
                    لا توجد تقييمات مخصصة معتمدة حتى الآن (الموقع يعرض التقييمات الأساسية الأصيلة).
                  </div>
                ) : (
                  approvedReviewsList.map(item => (
                    <div key={item.id} className="bg-white rounded-2xl p-4 border border-gray-200 flex items-center justify-between gap-4">
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-brand-dark">{item.name}</span>
                          <span className="text-[11px] text-brand-muted">({item.location})</span>
                          <div className="flex text-yellow-400 gap-0.5">
                            {[...Array(item.rating || 5)].map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-current" />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-brand-dark truncate italic">"{item.text}"</p>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleReviewStatus(item, 'pending')}
                          className="px-3 py-1.5 text-xs text-brand-muted hover:text-brand-dark rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer"
                          title="إلغاء النشر وإرجاعه للمعلق"
                        >
                          إلغاء النشر
                        </button>
                        <button
                          onClick={() => handleDeleteReview(item)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                          title="حذف نهائي"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* QUICK ADD REVIEW FORM */}
            {reviewTab === 'add' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 max-w-xl">
                <h4 className="font-bold text-base text-brand-dark mb-1">إضافة تقييم معتمد للموقع</h4>
                <p className="text-xs text-brand-muted mb-4">
                  يمكنكِ إضافة أي رأي وصلكِ من زبونة على واتساب أو إنستغرام ليظهر مباشرة لجميع زوار المتجر.
                </p>

                <form onSubmit={handleCreateApprovedReview} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-brand-dark mb-1">اسم الزبونة *</label>
                      <input
                        type="text"
                        required
                        value={newReviewForm.name}
                        onChange={(e) => setNewReviewForm({ ...newReviewForm, name: e.target.value })}
                        placeholder="مثال: ريم العبدالله"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-[#FBC6E2] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-brand-dark mb-1">المدينة / الدولة</label>
                      <input
                        type="text"
                        value={newReviewForm.location}
                        onChange={(e) => setNewReviewForm({ ...newReviewForm, location: e.target.value })}
                        placeholder="مثال: الرياض، السعودية"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-[#FBC6E2] outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-brand-dark mb-1">عدد النجوم</label>
                    <select
                      value={newReviewForm.rating}
                      onChange={(e) => setNewReviewForm({ ...newReviewForm, rating: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 outline-none"
                    >
                      <option value={5}>⭐⭐⭐⭐⭐ (5 نجوم - ممتاز جداً)</option>
                      <option value={4}>⭐⭐⭐⭐ (4 نجوم - رائع)</option>
                      <option value={3}>⭐⭐⭐ (3 نجوم - جيد)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-brand-dark mb-1">نص التقييم والتجربة *</label>
                    <textarea
                      required
                      rows={4}
                      value={newReviewForm.text}
                      onChange={(e) => setNewReviewForm({ ...newReviewForm, text: e.target.value })}
                      placeholder="الصقي نص الرسالة هنا..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-[#FBC6E2] outline-none resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-[#FBC6E2] hover:bg-[#f8b4d8] text-brand-dark font-bold text-sm rounded-xl border border-[#F3B2D4] cursor-pointer flex items-center justify-center gap-2 shadow-xs transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>نشر التقييم فوراً على الموقع 🚀</span>
                  </button>
                </form>
              </div>
            )}

          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: PRICING & RATES */}
        {/* ======================================================== */}
        {activeTab === 'pricing' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 space-y-6 max-w-3xl">
            <div className="border-b border-gray-100 pb-4">
              <h3 className="font-bold text-lg text-brand-dark">أسعار العبوات والباقات (بالدولار الأمريكي USD)</h3>
              <p className="text-xs text-brand-muted mt-1">
                تُحدد الأسعار هنا بالدولار كقاعدة، ويتم تحويلها تلقائياً للعملات الأخرى (التركي ₺، الريال ر.س، الدرهم د.إ، اليورو €) حسب أسعار الصرف.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-[#FFF5F9] rounded-2xl border border-[#F3B2D4]/50 space-y-1.5">
                <label className="block font-bold text-brand-dark">سعر العلبة الواحدة (Tier 1)</label>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-base text-brand-dark">$</span>
                  <input
                    type="number"
                    min="1"
                    value={configDraft.pricing?.tier1 ?? 20}
                    onChange={(e) => setConfigDraft({
                      ...configDraft,
                      pricing: { ...configDraft.pricing, tier1: Number(e.target.value) }
                    })}
                    className="w-full p-2.5 bg-white rounded-xl border border-gray-200 font-bold text-sm outline-none"
                  />
                </div>
                <p className="text-[11px] text-brand-muted">الافتراضي: 20 دولار</p>
              </div>

              <div className="p-4 bg-[#FFF5F9] rounded-2xl border border-[#F3B2D4]/50 space-y-1.5">
                <label className="block font-bold text-brand-dark">سعر باقة علبتين (Tier 2)</label>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-base text-brand-dark">$</span>
                  <input
                    type="number"
                    min="1"
                    value={configDraft.pricing?.tier2 ?? 30}
                    onChange={(e) => setConfigDraft({
                      ...configDraft,
                      pricing: { ...configDraft.pricing, tier2: Number(e.target.value) }
                    })}
                    className="w-full p-2.5 bg-white rounded-xl border border-gray-200 font-bold text-sm outline-none"
                  />
                </div>
                <p className="text-[11px] text-brand-muted">الافتراضي: 30 دولار (15 للعلبة)</p>
              </div>

              <div className="p-4 bg-[#FFF5F9] rounded-2xl border border-[#F3B2D4]/50 space-y-1.5">
                <label className="block font-bold text-brand-dark">سعر باقة 3 علب (Tier 3)</label>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-base text-brand-dark">$</span>
                  <input
                    type="number"
                    min="1"
                    value={configDraft.pricing?.tier3 ?? 45}
                    onChange={(e) => setConfigDraft({
                      ...configDraft,
                      pricing: { ...configDraft.pricing, tier3: Number(e.target.value) }
                    })}
                    className="w-full p-2.5 bg-white rounded-xl border border-gray-200 font-bold text-sm outline-none"
                  />
                </div>
                <p className="text-[11px] text-brand-muted">الافتراضي: 45 دولار</p>
              </div>

              <div className="p-4 bg-[#FFF5F9] rounded-2xl border border-[#F3B2D4]/50 space-y-1.5">
                <label className="block font-bold text-brand-dark">سعر كل علبة إضافية (4+ علب)</label>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-base text-brand-dark">$</span>
                  <input
                    type="number"
                    min="1"
                    value={configDraft.pricing?.extraUnit ?? 15}
                    onChange={(e) => setConfigDraft({
                      ...configDraft,
                      pricing: { ...configDraft.pricing, extraUnit: Number(e.target.value) }
                    })}
                    className="w-full p-2.5 bg-white rounded-xl border border-gray-200 font-bold text-sm outline-none"
                  />
                </div>
                <p className="text-[11px] text-brand-muted">الافتراضي: 15 دولار لكل علبة إضافية</p>
              </div>
            </div>

            {/* Gift Thresholds & TRY Rounding */}
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-3 text-xs">
              <h4 className="font-bold text-brand-dark">إعدادات الهدايا وتقريب الأسعار</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium mb-1">الحد الأدنى لعلب الهدية الأولى (الفرشاة)</label>
                  <input
                    type="number"
                    min="1"
                    value={configDraft.pricing?.giftMinQty ?? 3}
                    onChange={(e) => setConfigDraft({
                      ...configDraft,
                      pricing: { ...configDraft.pricing, giftMinQty: Number(e.target.value) }
                    })}
                    className="w-full p-2 bg-white rounded-xl border border-gray-200 font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">الحد الأدنى لعلب هدية الـ VIP</label>
                  <input
                    type="number"
                    min="1"
                    value={configDraft.pricing?.vipGiftMinQty ?? 5}
                    onChange={(e) => setConfigDraft({
                      ...configDraft,
                      pricing: { ...configDraft.pricing, vipGiftMinQty: Number(e.target.value) }
                    })}
                    className="w-full p-2 bg-white rounded-xl border border-gray-200 font-bold outline-none"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={configDraft.pricing?.roundTRY !== false}
                  onChange={(e) => setConfigDraft({
                    ...configDraft,
                    pricing: { ...configDraft.pricing, roundTRY: e.target.checked }
                  })}
                  className="rounded text-brand-dark focus:ring-0 w-4 h-4"
                />
                <span className="font-bold text-brand-dark">تقريب سعر الليرة التركية لأقرب 5 (مثال: 990₺ بدلاً من 989₺)</span>
              </label>
            </div>

            {/* Currency Rates Mode */}
            <div className="border-t border-gray-100 pt-5 space-y-4">
              <div>
                <h4 className="font-bold text-base text-brand-dark">وضع أسعار صرف العملات</h4>
                <p className="text-xs text-brand-muted mt-0.5">
                  يمكنكِ الاعتماد على التحديث الآلي المباشر من البورصة أو تثبيت أرقام مخصصة لكل عملة.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                  <input
                    type="radio"
                    name="rateMode"
                    value="live"
                    checked={configDraft.rates?.mode !== 'manual'}
                    onChange={() => setConfigDraft({
                      ...configDraft,
                      rates: { ...configDraft.rates, mode: 'live' }
                    })}
                  />
                  <span>مباشر وتلقائي من البورصة (open.er-api.com)</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                  <input
                    type="radio"
                    name="rateMode"
                    value="manual"
                    checked={configDraft.rates?.mode === 'manual'}
                    onChange={() => setConfigDraft({
                      ...configDraft,
                      rates: { ...configDraft.rates, mode: 'manual' }
                    })}
                  />
                  <span>تثبيت أسعار صرف يدوية</span>
                </label>
              </div>

              {configDraft.rates?.mode === 'manual' && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
                  {['TRY', 'SAR', 'AED', 'EUR'].map(curr => (
                    <div key={curr} className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                      <span className="font-bold text-brand-dark block mb-1">1 USD = ({curr})</span>
                      <input
                        type="number"
                        step="0.01"
                        value={configDraft.rates?.manual?.[curr] ?? DEFAULT_CONFIG.rates.manual[curr]}
                        onChange={(e) => setConfigDraft({
                          ...configDraft,
                          rates: {
                            ...configDraft.rates,
                            manual: {
                              ...configDraft.rates.manual,
                              [curr]: Number(e.target.value)
                            }
                          }
                        })}
                        className="w-full p-2 bg-white rounded-lg border border-gray-200 font-bold outline-none"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => handleSaveWholeConfig()}
              disabled={isSavingConfig}
              className="w-full py-3.5 bg-[#FBC6E2] hover:bg-[#f8b4d8] text-brand-dark font-bold text-sm rounded-2xl border border-[#F3B2D4] cursor-pointer flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{isSavingConfig ? 'جارٍ الحفظ...' : 'حفظ إعدادات الأسعار والعملات'}</span>
            </button>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: CONTACT & WHATSAPP */}
        {/* ======================================================== */}
        {activeTab === 'contact' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 space-y-6 max-w-xl">
            <div className="border-b border-gray-100 pb-4">
              <h3 className="font-bold text-lg text-brand-dark">رقم الواتساب لاستقبال الطلبات</h3>
              <p className="text-xs text-brand-muted mt-1">
                عند تغيير هذا الرقم، سيتم توجيه جميع نقرات الزبونات ورسائل الطلبات تلقائياً إلى الرقم الجديد فوراً.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-brand-dark mb-1">
                  رقم الواتساب الفعلي (مع رمز الدولة وبدون فواصل أو إشارة +) *
                </label>
                <input
                  type="text"
                  value={configDraft.contact?.whatsappPhone || '905525200700'}
                  onChange={(e) => setConfigDraft({
                    ...configDraft,
                    contact: { ...configDraft.contact, whatsappPhone: e.target.value.replace(/[^0-9]/g, '') }
                  })}
                  placeholder="905525200700"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 font-mono text-sm font-bold text-brand-dark outline-none focus:border-[#FBC6E2]"
                />
                <p className="text-[11px] text-brand-muted mt-1">مثال: 905525200700 (تركيا 90+)</p>
              </div>

              <div>
                <label className="block font-bold text-brand-dark mb-1">
                  صيغة عرض الرقم للزبونات في الواجهة
                </label>
                <input
                  type="text"
                  value={configDraft.contact?.whatsappDisplay || '+90 552 520 07 00'}
                  onChange={(e) => setConfigDraft({
                    ...configDraft,
                    contact: { ...configDraft.contact, whatsappDisplay: e.target.value }
                  })}
                  placeholder="+90 552 520 07 00"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-bold text-brand-dark outline-none focus:border-[#FBC6E2]"
                />
                <p className="text-[11px] text-brand-muted mt-1">يظهر في زر الواتساب العائم وأسفل نموذج الطلب</p>
              </div>

              {/* Live Preview Box */}
              <div className="p-4 bg-[#FFF5F9] rounded-2xl border border-[#F3B2D4]/60 space-y-2">
                <span className="text-[11px] font-bold text-brand-rose block">معاينة مباشرة لرابط المراسلة:</span>
                <p className="font-mono text-xs text-brand-dark break-all bg-white p-2.5 rounded-xl border border-gray-200">
                  https://wa.me/{configDraft.contact?.whatsappPhone || '905525200700'}
                </p>
              </div>
            </div>

            <button
              onClick={() => handleSaveWholeConfig()}
              disabled={isSavingConfig}
              className="w-full py-3.5 bg-[#FBC6E2] hover:bg-[#f8b4d8] text-brand-dark font-bold text-sm rounded-2xl border border-[#F3B2D4] cursor-pointer flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{isSavingConfig ? 'جارٍ الحفظ...' : 'حفظ رقم الواتساب وتطبيقه'}</span>
            </button>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 5: SECTION VISIBILITY */}
        {/* ======================================================== */}
        {activeTab === 'sections' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 space-y-6 max-w-2xl">
            <div className="border-b border-gray-100 pb-4">
              <h3 className="font-bold text-lg text-brand-dark">التحكم في ظهور أقسام الموقع</h3>
              <p className="text-xs text-brand-muted mt-1">
                يمكنكِ تفعيل أو إخفاء أي قسم من أقسام الصفحة الرئيسية بنقرة واحدة، وتحديث المتجر فوراً.
              </p>
            </div>

            <div className="space-y-3">
              {Object.entries(SECTION_LABELS).map(([secKey, label]) => {
                const isEnabled = configDraft.sections?.[secKey] !== false;
                return (
                  <div
                    key={secKey}
                    onClick={() => setConfigDraft({
                      ...configDraft,
                      sections: { ...configDraft.sections, [secKey]: !isEnabled }
                    })}
                    className="p-3.5 bg-gray-50 hover:bg-gray-100 rounded-2xl border border-gray-200 flex items-center justify-between gap-3 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-3 h-3 rounded-full ${isEnabled ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                      <span className="font-bold text-xs text-brand-dark">{label}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] font-bold ${isEnabled ? 'text-emerald-700' : 'text-gray-400'}`}>
                        {isEnabled ? 'مفعّل ويظهر للزوار' : 'مخفي حالياً'}
                      </span>
                      {isEnabled ? (
                        <ToggleRight className="w-7 h-7 text-emerald-600" />
                      ) : (
                        <ToggleLeft className="w-7 h-7 text-gray-400" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => handleSaveWholeConfig()}
              disabled={isSavingConfig}
              className="w-full py-3.5 bg-[#FBC6E2] hover:bg-[#f8b4d8] text-brand-dark font-bold text-sm rounded-2xl border border-[#F3B2D4] cursor-pointer flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{isSavingConfig ? 'جارٍ الحفظ...' : 'حفظ خيارات الأقسام'}</span>
            </button>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 6: CONTENT & TEXTS EDITOR */}
        {/* ======================================================== */}
        {activeTab === 'content' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 space-y-6 max-w-3xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
              <div>
                <h3 className="font-bold text-lg text-brand-dark">محرر نصوص وعناوين المتجر</h3>
                <p className="text-xs text-brand-muted mt-1">
                  تعديل العناوين والنصوص الإعلانية مباشرة لكل لغة.
                </p>
              </div>

              {/* Language Switcher */}
              <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl text-xs font-bold w-fit">
                {[
                  { code: 'ar', label: 'العربية 🇸🇦' },
                  { code: 'en', label: 'English 🇬🇧' },
                  { code: 'tr', label: 'Türkçe 🇹🇷' }
                ].map(l => (
                  <button
                    key={l.code}
                    onClick={() => setContentLang(l.code)}
                    className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                      contentLang === l.code ? 'bg-white text-brand-dark shadow-xs' : 'text-brand-muted hover:text-brand-dark'
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-brand-dark mb-1">الشريط الإعلاني العلوي (Announcement Bar)</label>
                <input
                  type="text"
                  value={contentDraft.announcement}
                  onChange={(e) => setContentDraft({ ...contentDraft, announcement: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 outline-none focus:border-[#FBC6E2]"
                />
              </div>

              <div>
                <label className="block font-bold text-brand-dark mb-1">شارة الهيرو الفاخرة (Hero Badge)</label>
                <input
                  type="text"
                  value={contentDraft.heroPamperBadge}
                  onChange={(e) => setContentDraft({ ...contentDraft, heroPamperBadge: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 outline-none focus:border-[#FBC6E2]"
                />
              </div>

              <div>
                <label className="block font-bold text-brand-dark mb-1">العنوان الرئيسي في واجهة المتجر (Hero Headline)</label>
                <textarea
                  rows={2}
                  value={contentDraft.heroHeadline}
                  onChange={(e) => setContentDraft({ ...contentDraft, heroHeadline: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 outline-none focus:border-[#FBC6E2] resize-none"
                />
              </div>

              <div>
                <label className="block font-bold text-brand-dark mb-1">الوصف الفرعي للهيرو (Hero Subtitle)</label>
                <textarea
                  rows={3}
                  value={contentDraft.heroSubtitle}
                  onChange={(e) => setContentDraft({ ...contentDraft, heroSubtitle: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 outline-none focus:border-[#FBC6E2] resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block font-bold text-brand-dark mb-1">عنوان قسم المشكلة والحل</label>
                  <input
                    type="text"
                    value={contentDraft.problemTitle}
                    onChange={(e) => setContentDraft({ ...contentDraft, problemTitle: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 outline-none focus:border-[#FBC6E2]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-brand-dark mb-1">عنوان قسم المكونات الفعالة</label>
                  <input
                    type="text"
                    value={contentDraft.ingredientsTitle}
                    onChange={(e) => setContentDraft({ ...contentDraft, ingredientsTitle: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 outline-none focus:border-[#FBC6E2]"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                const nextContent = {
                  ...configDraft.content,
                  [contentLang]: {
                    ...configDraft.content?.[contentLang],
                    announcement: contentDraft.announcement,
                    hero: {
                      ...translations[contentLang]?.hero,
                      headline: contentDraft.heroHeadline,
                      subtitle: contentDraft.heroSubtitle,
                      pamperBadge: contentDraft.heroPamperBadge
                    },
                    problemSolution: {
                      ...translations[contentLang]?.problemSolution,
                      title: contentDraft.problemTitle
                    },
                    ingredients: {
                      ...translations[contentLang]?.ingredients,
                      title: contentDraft.ingredientsTitle
                    }
                  }
                };
                const nextCfg = { ...configDraft, content: nextContent };
                handleSaveWholeConfig(nextCfg);
              }}
              disabled={isSavingConfig}
              className="w-full py-3.5 bg-[#FBC6E2] hover:bg-[#f8b4d8] text-brand-dark font-bold text-sm rounded-2xl border border-[#F3B2D4] cursor-pointer flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{isSavingConfig ? 'جارٍ الحفظ...' : `حفظ نصوص اللغة (${contentLang.toUpperCase()})`}</span>
            </button>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 7: MEDIA & VISUALS */}
        {/* ======================================================== */}
        {activeTab === 'media' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 space-y-6 max-w-4xl">
            <div className="border-b border-gray-100 pb-4">
              <h3 className="font-bold text-lg text-brand-dark">إدارة صور وفيديوهات المتجر</h3>
              <p className="text-xs text-brand-muted mt-1">
                يمكنكِ استبدال أي صورة أو فيديو في المتجر عبر رفع ملف جديد أو وضع رابط مباشر للصورة (URL).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(MEDIA_LABELS).map(([mKey, info]) => {
                const activeSrc = mediaDraft[mKey] || MEDIA_DEFAULTS[mKey];
                const isUploading = uploadingKey === mKey;

                return (
                  <div key={mKey} className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-brand-dark">{info.label}</h4>
                      <span className="text-[10px] text-brand-muted">{info.usedIn}</span>
                    </div>

                    {/* Preview Box */}
                    <div className="h-36 bg-white rounded-xl border border-gray-200 overflow-hidden flex items-center justify-center relative">
                      {info.type === 'video' ? (
                        <video src={activeSrc} controls className="max-h-full max-w-full object-contain" />
                      ) : (
                        <img src={activeSrc} alt={info.label} className="max-h-full max-w-full object-contain p-2" />
                      )}
                      {isUploading && (
                        <div className="absolute inset-0 bg-black/50 text-white flex items-center justify-center text-xs font-bold">
                          جارٍ الرفع...
                        </div>
                      )}
                    </div>

                    {/* URL Input & Upload */}
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={mediaDraft[mKey] || ''}
                          onChange={(e) => setMediaDraft({ ...mediaDraft, [mKey]: e.target.value })}
                          placeholder="أو الصقي رابط URL للصورة هنا..."
                          className="flex-1 p-2 bg-white rounded-xl border border-gray-200 outline-none text-[11px]"
                        />
                        {mediaDraft[mKey] && (
                          <button
                            onClick={() => {
                              const next = { ...mediaDraft };
                              delete next[mKey];
                              setMediaDraft(next);
                            }}
                            className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50"
                            title="إعادة تعيين للصورة الافتراضية"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* File Upload Button */}
                      <label className="flex items-center justify-center gap-1.5 p-2 bg-white hover:bg-gray-100 rounded-xl border border-dashed border-gray-300 font-bold text-xs text-brand-dark cursor-pointer transition-colors">
                        <Upload className="w-3.5 h-3.5 text-brand-rose" />
                        <span>رفع ملف جديد من الجهاز</span>
                        <input
                          type="file"
                          accept={info.type === 'video' ? 'video/*' : 'image/*'}
                          className="hidden"
                          onChange={(e) => handleUploadFile(mKey, e.target.files?.[0])}
                        />
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => handleSaveWholeConfig({ ...configDraft, media: mediaDraft })}
              disabled={isSavingConfig}
              className="w-full py-3.5 bg-[#FBC6E2] hover:bg-[#f8b4d8] text-brand-dark font-bold text-sm rounded-2xl border border-[#F3B2D4] cursor-pointer flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{isSavingConfig ? 'جارٍ الحفظ...' : 'حفظ تعديلات الوسائط والصور'}</span>
            </button>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 8: SYSTEM & DATABASE SETTINGS */}
        {/* ======================================================== */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 space-y-6 max-w-2xl">
            <div className="border-b border-gray-100 pb-4">
              <h3 className="font-bold text-lg text-brand-dark">إعدادات النظام وقاعدة البيانات</h3>
              <p className="text-xs text-brand-muted mt-1">
                حالة الربط السحابي ومفاتيح المشروع.
              </p>
            </div>

            <div className={`p-4 rounded-2xl border space-y-3 text-xs leading-relaxed ${
              isFirebaseConfigured 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}>
              <div className="flex items-center gap-2 font-bold text-sm">
                <Database className="w-4 h-4" />
                <span>{isFirebaseConfigured ? 'قاعدة بيانات Google Firebase مفعلة ومتصلة بنجاح' : 'تعمل لوحة الإدارة حالياً بالوضع المحلي (Local Storage)'}</span>
              </div>
              <p>
                {isFirebaseConfigured
                  ? 'جميع الطلبات، التقييمات، إعدادات الأسعار، والوسائط يتم مزامنتها سحابياً مع Firebase Firestore وتظهر لجميع الزوار فوراً.'
                  : 'لتفعيل المزامنة السحابية: أنشئ مشروعاً مجانياً على console.firebase.google.com، فعّل Firestore Database، وأضف المفاتيح في ملف .env.'}
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <h4 className="font-bold text-brand-dark">خيارات الصيانة السريعة:</h4>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => {
                    if (window.confirm('هل تريد مسح التخزين المؤقت المحلي وإعادة تحميل أحدث إعدادات؟')) {
                      localStorage.removeItem('raghad_site_config');
                      window.location.reload();
                    }
                  }}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold text-brand-dark cursor-pointer text-center"
                >
                  تفريغ الكاش المحلي
                </button>

                <button
                  onClick={() => setIsPasswordModalOpen(true)}
                  className="px-4 py-2.5 bg-[#FBC6E2] hover:bg-[#f8b4d8] rounded-xl font-bold text-brand-dark cursor-pointer text-center"
                >
                  تغيير الرمز السري للدخول
                </button>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* MODAL: Full WhatsApp Ticket Preview */}
      {selectedOrderPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl border border-gray-200 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedOrderPreview(null)}
              className="absolute top-5 right-5 p-1 text-gray-400 hover:text-brand-dark cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-bold text-base text-brand-dark mb-4 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-emerald-600" />
              <span>تذكرة الطلب المعتمدة (#{selectedOrderPreview.id})</span>
            </h3>

            <div className="bg-gray-900 text-emerald-300 font-mono text-xs p-4 rounded-2xl whitespace-pre-wrap leading-relaxed overflow-x-auto">
              {selectedOrderPreview.whatsappMessage}
            </div>

            <div className="flex items-center gap-2 mt-4">
              <button
                onClick={() => handleCopyMessage(selectedOrderPreview)}
                className="flex-1 py-3 bg-[#FBC6E2] hover:bg-[#f8b4d8] text-brand-dark font-bold text-xs rounded-xl border border-[#F3B2D4] cursor-pointer text-center"
              >
                {copiedOrderId === selectedOrderPreview.id ? 'تم النسخ بنجاح! ✓' : 'نسخ التذكرة'}
              </button>
              <button
                onClick={() => setSelectedOrderPreview(null)}
                className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-brand-dark font-bold text-xs rounded-xl cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Change Password */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl border border-[#F3B2D4] relative">
            <button
              onClick={() => {
                setIsPasswordModalOpen(false);
                setPwChangeMsg({ type: '', text: '' });
              }}
              className="absolute top-5 right-5 p-1 text-gray-400 hover:text-brand-dark cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-[#FBC6E2] border border-[#F3B2D4] flex items-center justify-center text-brand-dark">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-brand-dark">تغيير الرمز السري</h3>
                <p className="text-[11px] text-brand-muted">تعيين كلمة مرور سرية جديدة خاصة بكِ</p>
              </div>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-brand-dark mb-1">كلمة المرور الحالية</label>
                <input
                  type="password"
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="أدخلي كلمة المرور الحالية"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-[#FBC6E2] outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-brand-dark mb-1">كلمة المرور الجديدة</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="أدخلي كلمة المرور الجديدة"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-[#FBC6E2] outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-brand-dark mb-1">تأكيد كلمة المرور الجديدة</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="أعيدي كتابة كلمة المرور الجديدة"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-[#FBC6E2] outline-none"
                />
              </div>

              {pwChangeMsg.text && (
                <div className={`p-3 rounded-xl font-bold text-center border ${
                  pwChangeMsg.type === 'success' 
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                    : 'bg-red-50 text-red-600 border-red-200'
                }`}>
                  {pwChangeMsg.text}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#FBC6E2] hover:bg-[#f8b4d8] text-brand-dark font-bold rounded-xl border border-[#F3B2D4] cursor-pointer shadow-xs"
                >
                  حفظ كلمة المرور الجديدة
                </button>
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-brand-dark font-bold rounded-xl cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
