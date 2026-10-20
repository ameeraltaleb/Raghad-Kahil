import React, { useState, useEffect } from 'react';
import { 
  Lock, ArrowLeft, ArrowRight, Package, MessageSquare, Star, 
  CheckCircle2, Clock, Trash2, Check, X, Copy, ExternalLink, 
  Search, ShieldCheck, User, Phone, MapPin, Plus, RefreshCw, Send,
  MessageCircle, Eye, EyeOff, KeyRound, AlertTriangle, Shield
} from 'lucide-react';
import BrandLogo from './BrandLogo';
import { WHATSAPP_PHONE } from '../utils/whatsapp';

// SHA-256 hash for initial master credential - zero plaintext credentials in code or UI
const DEFAULT_PASSWORD_HASH = '6b6c0168bc7929abce425fdec4183d44aa421aafa6415dd54ded055801d083d2';
const PASSWORD_HASH_KEY = 'raghad_admin_pw_hash';
const ORDERS_STORAGE_KEY = 'raghad_whatsapp_orders';
const PENDING_STORAGE_KEY = 'raghad_pending_reviews';
const APPROVED_STORAGE_KEY = 'raghad_approved_reviews';
const SESSION_AUTH_KEY = 'raghad_admin_auth';
const SESSION_TIMESTAMP_KEY = 'raghad_admin_session_ts';
const SESSION_MAX_AGE_MS = 4 * 60 * 60 * 1000; // 4 hours

// Helper to hash strings with Web Crypto API SHA-256
async function hashCredential(text) {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  // Deterministic fallback for environments without crypto.subtle
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return String(hash);
}

// React Error Boundary to prevent any white screen crashes
class AdminErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('Admin Dashboard caught error:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center border border-red-200 shadow-xl space-y-4">
            <div className="w-14 h-14 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-lg text-brand-dark">حدث خطأ أثناء تحميل لوحة الإدارة</h3>
            <p className="text-xs text-brand-muted">
              تم حماية الصفحة من الانهيار بنجاح. يمكنك إعادة تحميل الصفحة بأمان.
            </p>
            <div className="flex gap-2 pt-2">
              <button 
                onClick={() => window.location.reload()}
                className="flex-1 py-3 bg-[#FBC6E2] text-brand-dark font-bold text-xs rounded-xl border border-[#F3B2D4] cursor-pointer hover:bg-[#f8b4d8]"
              >
                إعادة التحميل
              </button>
              <button 
                onClick={this.props.onBackToStore}
                className="flex-1 py-3 bg-gray-100 text-brand-dark font-bold text-xs rounded-xl cursor-pointer hover:bg-gray-200"
              >
                العودة للمتجر
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function AdminDashboardContent({ onBackToStore, lang = 'ar' }) {
  const isRtl = lang === 'ar';
  const ArrowIcon = isRtl ? ArrowRight : ArrowLeft;

  // Session Authentication Check with auto-expiry (4 hours)
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      const isAuth = sessionStorage.getItem(SESSION_AUTH_KEY) === 'true';
      const ts = sessionStorage.getItem(SESSION_TIMESTAMP_KEY);
      if (isAuth && ts && (Date.now() - Number(ts) < SESSION_MAX_AGE_MS)) {
        return true;
      }
      return false;
    } catch {
      return false;
    }
  });

  // Login Form State
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Brute Force Protection (Rate Limiting & Lockout)
  const [failedAttempts, setFailedAttempts] = useState(() => {
    try {
      return Number(sessionStorage.getItem('raghad_admin_fails') || 0);
    } catch {
      return 0;
    }
  });
  const [lockoutSeconds, setLockoutSeconds] = useState(0);

  // Password Change Modal State
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [currentPwInput, setCurrentPwInput] = useState('');
  const [newPwInput, setNewPwInput] = useState('');
  const [confirmPwInput, setConfirmPwInput] = useState('');
  const [pwChangeMessage, setPwChangeMessage] = useState({ type: '', text: '' });

  // Tab State: 'orders' | 'reviews'
  const [activeTab, setActiveTab] = useState('orders');

  // Orders State
  const [orders, setOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedOrderId, setCopiedOrderId] = useState(null);
  const [selectedOrderPreview, setSelectedOrderPreview] = useState(null);

  // Reviews State
  const [reviewSubTab, setReviewSubTab] = useState('pending'); // 'pending' | 'add' | 'approved'
  const [pendingReviews, setPendingReviews] = useState([]);
  const [approvedReviews, setApprovedReviews] = useState([]);

  // New Review Form State
  const [newReviewName, setNewReviewName] = useState('');
  const [newReviewCity, setNewReviewCity] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewText, setNewReviewText] = useState('');
  const [newReviewRecommend, setNewReviewRecommend] = useState(true);

  // Load Data Safely
  const loadData = () => {
    try {
      const storedOrders = localStorage.getItem(ORDERS_STORAGE_KEY);
      if (storedOrders) {
        const parsed = JSON.parse(storedOrders);
        if (Array.isArray(parsed)) setOrders(parsed);
      }

      const storedPending = localStorage.getItem(PENDING_STORAGE_KEY);
      if (storedPending) {
        const parsed = JSON.parse(storedPending);
        if (Array.isArray(parsed)) setPendingReviews(parsed);
      }

      const storedApproved = localStorage.getItem(APPROVED_STORAGE_KEY);
      if (storedApproved) {
        const parsed = JSON.parse(storedApproved);
        if (Array.isArray(parsed)) setApprovedReviews(parsed);
      }
    } catch (e) {
      console.error('Failed to load admin data:', e);
    }
  };

  useEffect(() => {
    loadData();
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

  // Handle Secure Login
  const handleLogin = async (e) => {
    e.preventDefault();
    if (lockoutSeconds > 0 || isAuthenticating) return;

    const trimmed = passwordInput.trim();
    if (!trimmed) {
      setAuthError('يرجى إدخال كلمة المرور للمتابعة.');
      return;
    }

    setIsAuthenticating(true);
    setAuthError('');

    try {
      const hashedInput = await hashCredential(trimmed);
      const targetHash = localStorage.getItem(PASSWORD_HASH_KEY) || DEFAULT_PASSWORD_HASH;

      if (hashedInput === targetHash) {
        // Success
        setIsAuthenticated(true);
        setAuthError('');
        setPasswordInput('');
        setFailedAttempts(0);
        try {
          sessionStorage.setItem(SESSION_AUTH_KEY, 'true');
          sessionStorage.setItem(SESSION_TIMESTAMP_KEY, Date.now().toString());
          sessionStorage.removeItem('raghad_admin_fails');
        } catch {
          // ignore session write errors
        }
      } else {
        // Failed attempt
        const newFails = failedAttempts + 1;
        setFailedAttempts(newFails);
        try {
          sessionStorage.setItem('raghad_admin_fails', String(newFails));
        } catch {}

        if (newFails >= 5) {
          setLockoutSeconds(60);
          setAuthError('تم تجميد محاولات الدخول مؤقتاً لمدة 60 ثانية لحماية النظام.');
        } else {
          setAuthError(`كلمة المرور غير صحيحة. متبقي ${5 - newFails} محاولات قبل التجميد المؤقت.`);
        }
      }
    } catch (err) {
      console.error('Authentication error:', err);
      setAuthError('حدث خطأ أثناء التحقق. يرجى المحاولة لاحقاً.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Handle Logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    try {
      sessionStorage.removeItem(SESSION_AUTH_KEY);
      sessionStorage.removeItem(SESSION_TIMESTAMP_KEY);
    } catch {}
  };

  // Handle Changing Password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwChangeMessage({ type: '', text: '' });

    if (!currentPwInput.trim()) {
      setPwChangeMessage({ type: 'error', text: 'يرجى إدخال كلمة المرور الحالية.' });
      return;
    }
    if (newPwInput.length < 4) {
      setPwChangeMessage({ type: 'error', text: 'كلمة المرور الجديدة يجب أن تتكون من 4 خانات على الأقل.' });
      return;
    }
    if (newPwInput !== confirmPwInput) {
      setPwChangeMessage({ type: 'error', text: 'كلمة المرور وتأكيدها غير متطابقين.' });
      return;
    }

    try {
      const currentHashed = await hashCredential(currentPwInput.trim());
      const targetHash = localStorage.getItem(PASSWORD_HASH_KEY) || DEFAULT_PASSWORD_HASH;

      if (currentHashed !== targetHash) {
        setPwChangeMessage({ type: 'error', text: 'كلمة المرور الحالية غير صحيحة.' });
        return;
      }

      const newHashed = await hashCredential(newPwInput.trim());
      localStorage.setItem(PASSWORD_HASH_KEY, newHashed);

      setPwChangeMessage({ type: 'success', text: 'تم تحديث كلمة المرور بنجاح! احفظي الرمز الجديد في مكان آمن.' });
      setTimeout(() => {
        setIsChangePasswordOpen(false);
        setCurrentPwInput('');
        setNewPwInput('');
        setConfirmPwInput('');
        setPwChangeMessage({ type: '', text: '' });
      }, 2000);
    } catch (err) {
      setPwChangeMessage({ type: 'error', text: 'حدث خطأ أثناء حفظ التغيير.' });
    }
  };

  // Orders Management Functions
  const handleUpdateOrderStatus = (orderId, newStatus) => {
    const updated = orders.map(ord => ord.id === orderId ? { ...ord, status: newStatus } : ord);
    setOrders(updated);
    try {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to update order status:', e);
    }
  };

  const handleDeleteOrder = (orderId) => {
    if (window.confirm('هل أنتِ متأكدة من حذف هذا الطلب نهائياً من السجل؟')) {
      const updated = orders.filter(ord => ord.id !== orderId);
      setOrders(updated);
      try {
        localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to delete order:', e);
      }
    }
  };

  const handleCopyMessage = (order) => {
    if (order && order.whatsappMessage) {
      navigator.clipboard.writeText(order.whatsappMessage);
      setCopiedOrderId(order.id);
      setTimeout(() => setCopiedOrderId(null), 2500);
    }
  };

  // Reviews Management Functions
  const handleApproveReview = (item) => {
    const approvedItem = { ...item, status: 'approved', time: 'حديثاً' };
    const newApproved = [approvedItem, ...approvedReviews];
    const newPending = pendingReviews.filter(p => p.id !== item.id);

    setApprovedReviews(newApproved);
    setPendingReviews(newPending);

    try {
      localStorage.setItem(APPROVED_STORAGE_KEY, JSON.stringify(newApproved));
      localStorage.setItem(PENDING_STORAGE_KEY, JSON.stringify(newPending));
    } catch (e) {
      console.error('Failed to approve review:', e);
    }
  };

  const handleDeletePending = (id) => {
    const newPending = pendingReviews.filter(p => p.id !== id);
    setPendingReviews(newPending);
    try {
      localStorage.setItem(PENDING_STORAGE_KEY, JSON.stringify(newPending));
    } catch (e) {
      console.error('Failed to delete pending review:', e);
    }
  };

  const handleDeleteApproved = (id) => {
    if (window.confirm('هل أنتِ متأكدة من إزالة هذا التقييم من الظهور للعامة في المتجر؟')) {
      const newApproved = approvedReviews.filter(p => p.id !== id);
      setApprovedReviews(newApproved);
      try {
        localStorage.setItem(APPROVED_STORAGE_KEY, JSON.stringify(newApproved));
      } catch (e) {
        console.error('Failed to delete approved review:', e);
      }
    }
  };

  const handleAddApprovedReview = (e) => {
    e.preventDefault();
    if (!newReviewName.trim() || !newReviewText.trim()) return;

    const newItem = {
      id: Date.now(),
      name: newReviewName.trim(),
      location: newReviewCity.trim() || 'عميلة موثقة',
      rating: newReviewRating,
      time: 'حديثاً',
      text: newReviewText.trim(),
      recommended: newReviewRecommend,
      status: 'approved'
    };

    const newApproved = [newItem, ...approvedReviews];
    setApprovedReviews(newApproved);
    try {
      localStorage.setItem(APPROVED_STORAGE_KEY, JSON.stringify(newApproved));
    } catch (e) {
      console.error('Failed to add approved review:', e);
    }

    setNewReviewName('');
    setNewReviewCity('');
    setNewReviewText('');
    setNewReviewRating(5);
    setReviewSubTab('approved');
  };

  // Filtered Orders with safe optional chaining
  const filteredOrders = orders.filter(ord => {
    if (!ord) return false;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (ord.id && String(ord.id).toLowerCase().includes(q)) ||
      (ord.customerName && String(ord.customerName).toLowerCase().includes(q)) ||
      (ord.phone && String(ord.phone).includes(q)) ||
      (ord.city && String(ord.city).toLowerCase().includes(q))
    );
  });

  // ========================================================
  // SECURE AUTHENTICATION SCREEN (ZERO PIN HINTS)
  // ========================================================
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
              منطقة آمنة ومخصصة لإدارة متجر رغد كحيل لمتابعة الطلبات ومراجعة التقييمات
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  disabled={lockoutSeconds > 0 || isAuthenticating}
                  placeholder="أدخل كلمة المرور السرية"
                  className={`w-full text-center ${showPassword ? 'text-base font-bold' : 'tracking-widest text-xl font-bold'} py-3.5 px-10 rounded-2xl border border-gray-200 focus:border-[#FBC6E2] focus:ring-2 focus:ring-[#FBC6E2]/40 outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed`}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute top-4 ${isRtl ? 'left-3.5' : 'right-3.5'} text-gray-400 hover:text-brand-dark cursor-pointer`}
                  tabIndex={-1}
                  aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {authError && (
                <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-bold border border-red-200 flex items-center justify-center gap-1.5 text-center">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              {lockoutSeconds > 0 && (
                <div className="p-2.5 bg-amber-50 text-amber-800 rounded-xl text-xs font-bold border border-amber-200 flex items-center justify-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 animate-spin" />
                  <span>يرجى الانتظار {lockoutSeconds} ثانية قبل إعادة المحاولة</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={lockoutSeconds > 0 || isAuthenticating}
              className="w-full py-4 bg-[#FBC6E2] hover:bg-[#f8b4d8] text-brand-dark font-black rounded-2xl shadow-md border border-[#F3B2D4] cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>{isAuthenticating ? 'جارٍ التحقق الآمن...' : 'دخول لوحة التحكم'}</span>
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

  // ========================================================
  // AUTHENTICATED DASHBOARD
  // ========================================================
  return (
    <div className="min-h-screen bg-brand-bg text-brand-dark font-sans pb-16">
      
      {/* Top Navigation Bar */}
      <header className="bg-white/95 backdrop-blur-md border-b border-[#F3B2D4]/60 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <BrandLogo size="sm" />
            <span className="text-xs font-bold bg-[#FBC6E2] text-brand-dark px-2.5 py-1 rounded-full border border-[#F3B2D4] flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>لوحة الإدارة</span>
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setIsChangePasswordOpen(true)}
              className="text-xs font-bold text-brand-dark hover:text-brand-rose flex items-center gap-1.5 bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-xl border border-gray-200 transition-colors cursor-pointer"
              title="تغيير كلمة المرور السرية"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">تغيير الرمز السري</span>
            </button>

            <button
              onClick={onBackToStore}
              className="text-xs font-bold text-brand-dark hover:text-brand-rose flex items-center gap-1.5 bg-gray-50 hover:bg-gray-100 px-3.5 py-2 rounded-xl border border-gray-200 transition-colors cursor-pointer"
            >
              <ArrowIcon className="w-3.5 h-3.5" />
              <span>العودة للمتجر</span>
            </button>

            <button
              onClick={handleLogout}
              className="text-xs text-red-600 hover:text-red-700 font-bold px-3 py-2 rounded-xl hover:bg-red-50 transition-colors cursor-pointer"
            >
              قفل
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 space-y-6">

        {/* Overview Stats Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-3xl p-5 border border-[#F3B2D4]/60 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs text-brand-muted font-bold">إجمالي الطلبات المسجلة</p>
              <h3 className="font-serif text-3xl font-black text-brand-dark mt-1">{orders.length}</h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Package className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-[#F3B2D4]/60 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs text-brand-muted font-bold">تقييمات بانتظار الموافقة</p>
              <h3 className="font-serif text-3xl font-black text-amber-600 mt-1">{pendingReviews.length}</h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-[#F3B2D4]/60 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs text-brand-muted font-bold">التقييمات المعتمدة المنشورة</p>
              <h3 className="font-serif text-3xl font-black text-brand-rose mt-1">{approvedReviews.length}</h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#FFF5F9] text-brand-rose flex items-center justify-center">
              <Star className="w-6 h-6 fill-current" />
            </div>
          </div>
        </div>

        {/* Primary Tabs: Orders vs Reviews */}
        <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm transition-all cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-[#FBC6E2] text-brand-dark border border-[#F3B2D4] shadow-xs'
                : 'text-brand-muted hover:text-brand-dark hover:bg-white/60'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>سجل وحفظ الطلبات ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm transition-all cursor-pointer ${
              activeTab === 'reviews'
                ? 'bg-[#FBC6E2] text-brand-dark border border-[#F3B2D4] shadow-xs'
                : 'text-brand-muted hover:text-brand-dark hover:bg-white/60'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>اعتماد وإدارة التقييمات</span>
            {pendingReviews.length > 0 && (
              <span className="bg-amber-500 text-white text-[11px] font-black px-2 py-0.5 rounded-full">
                {pendingReviews.length}
              </span>
            )}
          </button>
        </div>

        {/* ======================================================== */}
        {/* TAB 1: ORDERS MANAGEMENT */}
        {/* ======================================================== */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            
            {/* Search and Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-200">
              <div className="relative w-full sm:w-80">
                <Search className={`w-4 h-4 text-gray-400 absolute top-3.5 ${isRtl ? 'right-3.5' : 'left-3.5'}`} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="بحث برقم الطلب، الاسم، أو الهاتف..."
                  className={`w-full ${isRtl ? 'pr-10 pl-3' : 'pl-10 pr-3'} py-2 text-xs rounded-xl border border-gray-200 focus:border-[#FBC6E2] outline-none`}
                />
              </div>

              <div className="flex items-center gap-2 text-xs text-brand-muted">
                <RefreshCw className="w-3.5 h-3.5 cursor-pointer hover:rotate-180 transition-transform" onClick={loadData} />
                <span>يتم التحديث وحفظ الطلبات تلقائياً</span>
              </div>
            </div>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center text-brand-muted border border-gray-200 space-y-2">
                <Package className="w-12 h-12 text-gray-300 mx-auto" />
                <h4 className="font-bold text-base text-brand-dark">لا توجد طلبات مسجلة حتى الآن</h4>
                <p className="text-xs">
                  عند قيام أي مشترية بتأكيد طلبها، سيظهر الطلب هنا فوراً مع كامل التفاصيل ورسالة الواتساب.
                </p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {filteredOrders.map((order) => {
                  if (!order) return null;
                  const sanitizedPhone = String(order.phone || '').replace(/[^0-9]/g, '');
                  const customerWhatsAppUrl = `https://wa.me/${sanitizedPhone}`;

                  return (
                    <div
                      key={order.id || Math.random()}
                      className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-200 shadow-2xs hover:shadow-xs transition-shadow space-y-4"
                    >
                      {/* Top Header of Card */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="font-mono text-xs font-black bg-brand-dark text-white px-3 py-1 rounded-full tracking-wider">
                            #{order.id || 'N/A'}
                          </span>
                          <span className="text-xs text-brand-muted flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{order.dateFormatted || order.timestamp || 'حديثاً'}</span>
                          </span>
                          <span className="text-xs font-bold bg-[#FBC6E2]/40 text-brand-dark px-2.5 py-0.5 rounded-full border border-[#F3B2D4]">
                            {order.bundleTitle || 'باقة رغد'} {order.price ? `· ${order.price}` : ''}
                          </span>
                        </div>

                        {/* Status Selector */}
                        <div className="flex items-center gap-2">
                          <select
                            value={order.status || 'new'}
                            onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                            className="text-xs font-bold py-1.5 px-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none cursor-pointer"
                          >
                            <option value="new">🟡 جديد بانتظار الشحن</option>
                            <option value="contacted">🔵 تم التواصل والتأكيد</option>
                            <option value="completed">🟢 تم التسليم بنجاح</option>
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

                      {/* Customer & Address Details Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                        <div className="space-y-1">
                          <span className="text-brand-muted font-bold block">مقدم الطلب:</span>
                          <div className="font-bold text-brand-dark flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-brand-rose shrink-0" />
                            <span>{order.customerName || 'عميلة'}</span>
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
                              📝 ملاحظة: {order.notes}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action buttons: WhatsApp Customer & Copy Ticket */}
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
                onClick={() => setReviewSubTab('pending')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  reviewSubTab === 'pending'
                    ? 'bg-[#FBC6E2] text-brand-dark shadow-xs'
                    : 'text-brand-muted hover:text-brand-dark'
                }`}
              >
                التقييمات المعلقة للموافقة ({pendingReviews.length})
              </button>

              <button
                onClick={() => setReviewSubTab('add')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  reviewSubTab === 'add'
                    ? 'bg-[#FBC6E2] text-brand-dark shadow-xs'
                    : 'text-brand-muted hover:text-brand-dark'
                }`}
              >
                + إضافة تقييم معتمد جديد
              </button>

              <button
                onClick={() => setReviewSubTab('approved')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  reviewSubTab === 'approved'
                    ? 'bg-[#FBC6E2] text-brand-dark shadow-xs'
                    : 'text-brand-muted hover:text-brand-dark'
                }`}
              >
                التقييمات المنشورة بالموقع ({approvedReviews.length})
              </button>
            </div>

            {/* PENDING REVIEWS LIST */}
            {reviewSubTab === 'pending' && (
              <div className="space-y-3">
                {pendingReviews.length === 0 ? (
                  <div className="bg-white rounded-3xl p-12 text-center text-brand-muted border border-gray-200">
                    <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2 opacity-60" />
                    <h4 className="font-bold text-base text-brand-dark">لا توجد تقييمات معلقة</h4>
                    <p className="text-xs mt-1">جميع التقييمات تم مراجعتها واعتمادها بنجاح.</p>
                  </div>
                ) : (
                  pendingReviews.map((item) => (
                    <div
                      key={item.id || Math.random()}
                      className="bg-white rounded-3xl p-5 border border-amber-200 shadow-2xs space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-brand-dark">{item.name || 'عميلة'}</span>
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
                          <span>{item.date || item.time || 'حديثاً'}</span>
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDeletePending(item.id)}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 border border-red-200 transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>رفض / حذف</span>
                          </button>
                          <button
                            onClick={() => handleApproveReview(item)}
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

            {/* QUICK ADD REVIEW FORM */}
            {reviewSubTab === 'add' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 max-w-xl">
                <h4 className="font-bold text-base text-brand-dark mb-1">إضافة تقييم معتمد للموقع</h4>
                <p className="text-xs text-brand-muted mb-4">
                  يمكنكِ إضافة أي رأي وصلكِ من زبونة على واتساب ليظهر مباشرة لجميع زوار المتجر.
                </p>

                <form onSubmit={handleAddApprovedReview} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-brand-dark mb-1">اسم الزبونة *</label>
                      <input
                        type="text"
                        required
                        value={newReviewName}
                        onChange={(e) => setNewReviewName(e.target.value)}
                        placeholder="مثال: ريم العبدالله"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-[#FBC6E2] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-brand-dark mb-1">المدينة / الدولة</label>
                      <input
                        type="text"
                        value={newReviewCity}
                        onChange={(e) => setNewReviewCity(e.target.value)}
                        placeholder="مثال: الرياض، السعودية"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-[#FBC6E2] outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-brand-dark mb-1">عدد النجوم</label>
                    <select
                      value={newReviewRating}
                      onChange={(e) => setNewReviewRating(Number(e.target.value))}
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
                      value={newReviewText}
                      onChange={(e) => setNewReviewText(e.target.value)}
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

            {/* APPROVED REVIEWS LIST */}
            {reviewSubTab === 'approved' && (
              <div className="space-y-3">
                {approvedReviews.length === 0 ? (
                  <div className="bg-white rounded-3xl p-10 text-center text-brand-muted border border-gray-200 text-xs">
                    لم تقومي بإضافة تقييمات مخصصة بعد (الموقع يعرض التقييمات الأساسية تلقائياً).
                  </div>
                ) : (
                  approvedReviews.map((item) => (
                    <div
                      key={item.id || Math.random()}
                      className="bg-white rounded-2xl p-4 border border-gray-200 flex items-center justify-between gap-4"
                    >
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-brand-dark">{item.name || 'عميلة'}</span>
                          <span className="text-[11px] text-brand-muted">({item.location || 'عميلة موثقة'})</span>
                          <div className="flex text-yellow-400 gap-0.5">
                            {[...Array(item.rating || 5)].map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-current" />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-brand-dark truncate italic">"{item.text}"</p>
                      </div>

                      <button
                        onClick={() => handleDeleteApproved(item.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors cursor-pointer shrink-0"
                        title="حذف من الموقع"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}

          </div>
        )}

      </main>

      {/* WHATSAPP TICKET PREVIEW MODAL */}
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
              <span>تذكرة الطلب المعتمدة (#{selectedOrderPreview.id || 'N/A'})</span>
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

      {/* CHANGE PASSWORD MODAL */}
      {isChangePasswordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl border border-[#F3B2D4] relative">
            <button
              onClick={() => {
                setIsChangePasswordOpen(false);
                setPwChangeMessage({ type: '', text: '' });
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
                <p className="text-[11px] text-brand-muted">يمكنكِ تعيين كلمة مرور جديدة خاصة بكِ للدخول</p>
              </div>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-brand-dark mb-1">كلمة المرور الحالية</label>
                <input
                  type="password"
                  required
                  value={currentPwInput}
                  onChange={(e) => setCurrentPwInput(e.target.value)}
                  placeholder="أدخلي كلمة المرور الحالية"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-[#FBC6E2] outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-brand-dark mb-1">كلمة المرور الجديدة</label>
                <input
                  type="password"
                  required
                  value={newPwInput}
                  onChange={(e) => setNewPwInput(e.target.value)}
                  placeholder="أدخلي كلمة المرور الجديدة (4 خانات فأكثر)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-[#FBC6E2] outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-brand-dark mb-1">تأكيد كلمة المرور الجديدة</label>
                <input
                  type="password"
                  required
                  value={confirmPwInput}
                  onChange={(e) => setConfirmPwInput(e.target.value)}
                  placeholder="أعيدي كتابة كلمة المرور الجديدة"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-[#FBC6E2] outline-none"
                />
              </div>

              {pwChangeMessage.text && (
                <div className={`p-3 rounded-xl font-bold text-center border ${
                  pwChangeMessage.type === 'success' 
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                    : 'bg-red-50 text-red-600 border-red-200'
                }`}>
                  {pwChangeMessage.text}
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
                  onClick={() => setIsChangePasswordOpen(false)}
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

export default function AdminDashboard(props) {
  return (
    <AdminErrorBoundary onBackToStore={props.onBackToStore}>
      <AdminDashboardContent {...props} />
    </AdminErrorBoundary>
  );
}
