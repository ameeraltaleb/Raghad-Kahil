import React, { useState, useEffect } from 'react';
import { 
  Lock, ArrowLeft, ArrowRight, Package, MessageSquare, Star, 
  CheckCircle2, Clock, Trash2, Check, X, Copy, ExternalLink, 
  Search, ShieldCheck, User, Phone, MapPin, Plus, RefreshCw, Send
} from 'lucide-react';
import BrandLogo from './BrandLogo';
import { WHATSAPP_PHONE } from '../utils/whatsapp';

const ADMIN_PIN = '7700';
const ORDERS_STORAGE_KEY = 'raghad_whatsapp_orders';
const PENDING_STORAGE_KEY = 'raghad_pending_reviews';
const APPROVED_STORAGE_KEY = 'raghad_approved_reviews';

export default function AdminDashboard({ onBackToStore, lang = 'ar' }) {
  const isRtl = lang === 'ar';
  const ArrowIcon = isRtl ? ArrowRight : ArrowLeft;

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('raghad_admin_auth') === 'true';
  });
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

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

  // Load Data
  const loadData = () => {
    try {
      const storedOrders = localStorage.getItem(ORDERS_STORAGE_KEY);
      if (storedOrders) setOrders(JSON.parse(storedOrders));

      const storedPending = localStorage.getItem(PENDING_STORAGE_KEY);
      if (storedPending) setPendingReviews(JSON.parse(storedPending));

      const storedApproved = localStorage.getItem(APPROVED_STORAGE_KEY);
      if (storedApproved) setApprovedReviews(JSON.parse(storedApproved));
    } catch (e) {
      console.error('Failed to load admin data:', e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle PIN Login
  const handleLogin = (e) => {
    e.preventDefault();
    if (pinInput.trim() === ADMIN_PIN) {
      setIsAuthenticated(true);
      setPinError(false);
      sessionStorage.setItem('raghad_admin_auth', 'true');
    } else {
      setPinError(true);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('raghad_admin_auth');
  };

  // Orders Management Functions
  const handleUpdateOrderStatus = (orderId, newStatus) => {
    const updated = orders.map(ord => ord.id === orderId ? { ...ord, status: newStatus } : ord);
    setOrders(updated);
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(updated));
  };

  const handleDeleteOrder = (orderId) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الطلب من السجل؟')) {
      const updated = orders.filter(ord => ord.id !== orderId);
      setOrders(updated);
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(updated));
    }
  };

  const handleCopyMessage = (order) => {
    if (order.whatsappMessage) {
      navigator.clipboard.writeText(order.whatsappMessage);
      setCopiedOrderId(order.id);
      setTimeout(() => setCopiedOrderId(null), 2000);
    }
  };

  // Reviews Management Functions
  const handleApproveReview = (item) => {
    const approvedItem = { ...item, status: 'approved', time: 'حديثاً' };
    const newApproved = [approvedItem, ...approvedReviews];
    const newPending = pendingReviews.filter(p => p.id !== item.id);

    setApprovedReviews(newApproved);
    setPendingReviews(newPending);

    localStorage.setItem(APPROVED_STORAGE_KEY, JSON.stringify(newApproved));
    localStorage.setItem(PENDING_STORAGE_KEY, JSON.stringify(newPending));
  };

  const handleDeletePending = (id) => {
    const newPending = pendingReviews.filter(p => p.id !== id);
    setPendingReviews(newPending);
    localStorage.setItem(PENDING_STORAGE_KEY, JSON.stringify(newPending));
  };

  const handleDeleteApproved = (id) => {
    if (window.confirm('هل أنت متأكد من إزالة هذا التقييم من الموقع؟')) {
      const newApproved = approvedReviews.filter(p => p.id !== id);
      setApprovedReviews(newApproved);
      localStorage.setItem(APPROVED_STORAGE_KEY, JSON.stringify(newApproved));
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
    localStorage.setItem(APPROVED_STORAGE_KEY, JSON.stringify(newApproved));

    setNewReviewName('');
    setNewReviewCity('');
    setNewReviewText('');
    setNewReviewRating(5);
    setReviewSubTab('approved');
  };

  // Filtered Orders
  const filteredOrders = orders.filter(ord => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (ord.id && ord.id.toLowerCase().includes(q)) ||
      (ord.customerName && ord.customerName.toLowerCase().includes(q)) ||
      (ord.phone && ord.phone.includes(q)) ||
      (ord.city && ord.city.toLowerCase().includes(q))
    );
  });

  // PIN Login Gate
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-brand-bg flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-[#F3B2D4] shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 bg-[#FBC6E2] rounded-full flex items-center justify-center mx-auto text-brand-dark border border-[#F3B2D4]">
            <Lock className="w-8 h-8" />
          </div>

          <div>
            <h2 className="font-serif text-2xl font-bold text-brand-dark">لوحة الإدارة والتحكم</h2>
            <p className="text-xs text-brand-muted mt-1.5">
              خاص بإدارة رغد كحيل لمتابعة الطلبات واعتماد التقييمات
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                maxLength={6}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="أدخل الرمز السري (7700)"
                className="w-full text-center tracking-widest text-xl font-bold py-3.5 rounded-2xl border border-gray-200 focus:border-[#FBC6E2] focus:ring-2 focus:ring-[#FBC6E2]/40 outline-none"
                autoFocus
              />
              {pinError && (
                <p className="text-xs text-red-500 font-bold mt-2">
                  الرمز السري غير صحيح، يرجى المحاولة ثانية.
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-[#FBC6E2] hover:bg-[#f8b4d8] text-brand-dark font-black rounded-2xl shadow-md border border-[#F3B2D4] cursor-pointer transition-all"
            >
              دخول لوحة الإدارة 🔐
            </button>
          </form>

          <button
            type="button"
            onClick={onBackToStore}
            className="text-xs text-brand-muted hover:text-brand-dark font-medium flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
          >
            <ArrowIcon className="w-3.5 h-3.5" />
            <span>العودة للمتجر الرئيسي</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg text-brand-dark font-sans pb-16">
      
      {/* Top Navigation Bar */}
      <header className="bg-white/95 backdrop-blur-md border-b border-[#F3B2D4]/60 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <BrandLogo size="sm" />
            <span className="text-xs font-bold bg-[#FBC6E2] text-brand-dark px-2.5 py-1 rounded-full border border-[#F3B2D4]">
              لوحة الإدارة
            </span>
          </div>

          <div className="flex items-center gap-3">
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
                  const sanitizedPhone = (order.phone || '').replace(/[^0-9]/g, '');
                  const customerWhatsAppUrl = `https://wa.me/${sanitizedPhone}`;

                  return (
                    <div
                      key={order.id}
                      className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-200 shadow-2xs hover:shadow-xs transition-shadow space-y-4"
                    >
                      {/* Top Header of Card */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="font-mono text-xs font-black bg-brand-dark text-white px-3 py-1 rounded-full tracking-wider">
                            #{order.id}
                          </span>
                          <span className="text-xs text-brand-muted flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{order.dateFormatted || order.timestamp}</span>
                          </span>
                          <span className="text-xs font-bold bg-[#FBC6E2]/40 text-brand-dark px-2.5 py-0.5 rounded-full border border-[#F3B2D4]">
                            {order.bundleTitle} · {order.price}
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
                            <User className="w-3.5 h-3.5 text-brand-rose" />
                            <span>{order.customerName}</span>
                          </div>
                          {order.phone && (
                            <div className="text-brand-dark flex items-center gap-1.5 pt-0.5">
                              <Phone className="w-3.5 h-3.5 text-brand-rose" />
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
                              {order.address}
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
            <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-gray-200 w-fit">
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
                    <p className="text-xs mt-1">جميع التقييمات تم مراجعتها بنجاح.</p>
                  </div>
                ) : (
                  pendingReviews.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-3xl p-5 border border-amber-200 shadow-2xs space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-brand-dark">{item.name}</span>
                          <span className="text-xs text-brand-muted">({item.location})</span>
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
                          <span>{item.date || item.time}</span>
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
                    className="w-full py-3 bg-[#FBC6E2] hover:bg-[#f8b4d8] text-brand-dark font-bold text-sm rounded-xl border border-[#F3B2D4] cursor-pointer flex items-center justify-center gap-2 shadow-xs"
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
                    لم تقم بإضافة تقييمات مخصصة بعد (الموقع يعرض التقييمات الأساسية تلقائياً).
                  </div>
                ) : (
                  approvedReviews.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl p-4 border border-gray-200 flex items-center justify-between gap-4"
                    >
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

    </div>
  );
}
