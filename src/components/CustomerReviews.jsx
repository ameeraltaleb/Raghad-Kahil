import React, { useState, useEffect } from 'react';
import { Star, CheckCircle2, Quote, PenSquare, X, ThumbsUp, Sparkles, Heart } from 'lucide-react';
import { translations } from '../translations';

const STORAGE_KEY = 'raghad_customer_reviews';

export default function CustomerReviews({ lang }) {
  const t = translations[lang]?.reviews || translations.ar.reviews;
  const isRtl = lang === 'ar';

  // Modal & form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userReviews, setUserReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [recommend, setRecommend] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successNotice, setSuccessNotice] = useState(false);

  // Load user reviews from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setUserReviews(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load reviews:', e);
    }
  }, []);

  // Handle new review submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !reviewText.trim()) return;

    setIsSubmitting(true);

    const nowText = lang === 'ar' ? 'الآن' : lang === 'tr' ? 'Az önce' : 'Just now';
    const newReview = {
      id: Date.now(),
      name: name.trim(),
      location: city.trim() || (lang === 'ar' ? 'الرياض' : lang === 'tr' ? 'İstanbul' : 'Verified Buyer'),
      rating: rating,
      time: nowText,
      text: reviewText.trim(),
      recommended: recommend,
      isUserSubmitted: true
    };

    setTimeout(() => {
      const updated = [newReview, ...userReviews];
      setUserReviews(updated);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to save review:', err);
      }

      setIsSubmitting(false);
      setSuccessNotice(true);

      // Reset form
      setName('');
      setCity('');
      setReviewText('');
      setRating(5);
      setRecommend(true);

      // Close modal after 1.5 seconds
      setTimeout(() => {
        setSuccessNotice(false);
        setIsModalOpen(false);
      }, 1600);
    }, 400);
  };

  // Combine user-submitted reviews with predefined reviews
  const allReviews = [...userReviews, ...(t.items || [])];

  const ratingPhrases = {
    ar: ['', 'مقبول', 'جيد', 'جيد جداً', 'رائع جداً ✨', 'ممتاز وأنصح به بشدة! 💖'],
    en: ['', 'Poor', 'Fair', 'Good', 'Very Good ✨', 'Outstanding & highly recommended! 💖'],
    tr: ['', 'Yetersiz', 'İdare Eder', 'İyi', 'Çok İyi ✨', 'Mükemmel & Kesinlikle Tavsiye! 💖']
  };

  return (
    <section id="reviews" className="py-12 sm:py-20 lg:py-24 bg-brand-bg relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-48 bg-gradient-to-b from-[#FBC6E2]/25 to-transparent pointer-events-none blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 bg-[#FBC6E2] border border-[#F3B2D4] text-brand-dark px-4 py-1.5 rounded-full text-xs font-bold tracking-wider mb-3 sm:mb-4 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#3D1B22]" />
            <span>{t.badge}</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-4xl lg:text-5xl text-brand-dark mb-3 sm:mb-4 leading-tight font-bold">
            {t.title}
          </h2>
          <p className="text-sm sm:text-base text-brand-muted max-w-xl mx-auto">
            {t.subtitle}
          </p>
        </div>

        {/* Rating Summary & Write Review Bar */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#F3B2D4]/60 shadow-sm mb-8 sm:mb-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-start">
            <div className="flex items-center gap-3">
              <span className="font-serif text-4xl sm:text-5xl font-black text-brand-dark">4.9</span>
              <div>
                <div className="flex text-yellow-400 gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current" />
                  ))}
                </div>
                <div className="text-xs text-brand-muted mt-1 font-medium">
                  {lang === 'ar' ? 'أكثر من 10,000 تقييم مؤكد' : lang === 'tr' ? '10.000+ Doğrulanmış Yorum' : '10,000+ Verified Reviews'}
                </div>
              </div>
            </div>

            <div className="hidden sm:block h-10 w-px bg-gray-200" />

            <div className="flex items-center gap-2 text-xs sm:text-sm text-emerald-700 font-semibold bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200">
              <ThumbsUp className="w-4 h-4 text-emerald-600" />
              <span>{lang === 'ar' ? '99% يوصين بشراء المنتج' : lang === 'tr' ? '%99 Tavsiye Oranı' : '99% Customer Recommendation'}</span>
            </div>
          </div>

          {/* Action button to open write-review modal */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full md:w-auto inline-flex items-center justify-center gap-2.5 bg-[#FBC6E2] hover:bg-[#f8b4d8] text-brand-dark font-bold px-6 py-3.5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 border border-[#F3B2D4] cursor-pointer group"
          >
            <PenSquare className="w-4 h-4 text-brand-dark group-hover:rotate-6 transition-transform" />
            <span>{t.writeBtn || (lang === 'ar' ? 'اكتبي تقييمكِ الآن' : 'Write a Review')}</span>
          </button>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {allReviews.map((review, index) => {
            const isUserReview = Boolean(review.isUserSubmitted);

            return (
              <div
                key={review.id || index}
                className={`bg-white rounded-3xl p-5 sm:p-7 shadow-xs border transition-all duration-300 flex flex-col h-full relative group hover:shadow-md ${
                  isUserReview ? 'border-[#FBC6E2] ring-2 ring-[#FBC6E2]/40 bg-linear-to-b from-white to-[#FBC6E2]/10' : 'border-[#F3B2D4]/50'
                }`}
              >
                {/* Decorative quote icon */}
                <Quote className={`absolute top-5 ${isRtl ? 'left-5' : 'right-5'} w-7 h-7 text-[#FBC6E2]/60 group-hover:text-[#FBC6E2] transition-colors pointer-events-none`} />

                {/* Rating & Timestamp Header */}
                <div className="flex items-center justify-between mb-3 relative z-10">
                  <div className="flex text-yellow-400 gap-0.5">
                    {[...Array(review.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    {isUserReview && (
                      <span className="text-[10px] font-bold bg-[#FBC6E2] text-brand-dark px-2 py-0.5 rounded-full border border-[#F3B2D4]">
                        {lang === 'ar' ? 'تقييمكِ' : lang === 'tr' ? 'Yorumunuz' : 'Your Review'}
                      </span>
                    )}
                    <span className="text-xs text-brand-muted font-medium">
                      {review.time}
                    </span>
                  </div>
                </div>

                {/* Recommendation pill if applicable */}
                {review.recommended !== false && (
                  <div className="inline-flex items-center gap-1.5 text-[11px] text-emerald-700 bg-emerald-50/80 px-2.5 py-1 rounded-full w-fit mb-3 border border-emerald-100">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span className="font-medium">{t.recommendedBadge || (lang === 'ar' ? 'توصي بهذا المنتج' : 'Recommends this product')}</span>
                  </div>
                )}

                {/* Review Text */}
                <p className="text-brand-dark leading-relaxed mb-6 italic relative z-10 flex-1 text-sm sm:text-base">
                  "{review.text}"
                </p>

                {/* Author Info */}
                <div className="flex items-center gap-3.5 pt-4 border-t border-gray-100 mt-auto">
                  <div className="w-11 h-11 bg-[#FBC6E2] border border-[#F3B2D4] rounded-full flex items-center justify-center font-serif text-brand-dark font-black text-lg shadow-xs shrink-0">
                    {review.name ? review.name.charAt(0).toUpperCase() : '💖'}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-brand-dark text-sm truncate">{review.name}</h4>
                    <div className="flex items-center gap-1.5 text-xs text-brand-muted mt-0.5 flex-wrap">
                      <span className="truncate">{review.location}</span>
                      <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                      <div className="flex items-center gap-1 text-emerald-600 font-semibold shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        <span>{t.verified}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Write a Review Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="bg-white rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl border border-[#F3B2D4] relative max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-brand-muted hover:text-brand-dark hover:bg-gray-100 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-[#FBC6E2] rounded-full flex items-center justify-center mx-auto mb-3 border border-[#F3B2D4]">
                <Heart className="w-6 h-6 text-brand-dark fill-current" />
              </div>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-brand-dark mb-1.5">
                {t.modalTitle || (lang === 'ar' ? 'شاركينا رأيكِ وتجربتكِ' : 'Share Your Experience')}
              </h3>
              <p className="text-xs sm:text-sm text-brand-muted max-w-sm mx-auto">
                {t.modalSubtitle || (lang === 'ar' ? 'رأيكِ الصادق يلهم آلاف السيدات لاكتشاف حواجب مثالية ✨' : 'Your feedback helps other customers')}
              </p>
            </div>

            {/* Success message banner */}
            {successNotice ? (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-6 text-center animate-in zoom-in-95 duration-200 my-4">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
                <h4 className="font-bold text-base mb-1">
                  {t.successMsg || (lang === 'ar' ? 'شكراً لكِ! تم نشر تقييمكِ بنجاح ✨' : 'Review published successfully!')}
                </h4>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Star Rating Picker */}
                <div className="bg-[#FFF5F9] p-4 rounded-2xl border border-[#F3B2D4]/60 text-center">
                  <label className="block text-xs font-bold text-brand-dark mb-2">
                    {t.ratingLabel || (lang === 'ar' ? 'تقييمكِ العام' : 'Your Rating')}
                  </label>
                  <div className="flex items-center justify-center gap-2 mb-1.5">
                    {[1, 2, 3, 4, 5].map((starValue) => {
                      const isFilled = (hoverRating || rating) >= starValue;
                      return (
                        <button
                          key={starValue}
                          type="button"
                          onMouseEnter={() => setHoverRating(starValue)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setRating(starValue)}
                          className="p-1 cursor-pointer transition-transform hover:scale-125 focus:outline-none"
                        >
                          <Star
                            className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${
                              isFilled ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                  <span className="text-xs font-semibold text-brand-dark">
                    {(ratingPhrases[lang] || ratingPhrases.ar)[hoverRating || rating]}
                  </span>
                </div>

                {/* Name field */}
                <div>
                  <label className="block text-xs font-bold text-brand-dark mb-1">
                    {t.nameLabel || (lang === 'ar' ? 'اسمكِ الكريم' : 'Your Name')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t.namePlaceholder || (lang === 'ar' ? 'مثال: نورة العتيبي' : 'e.g. Sarah M.')}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#FBC6E2] focus:ring-2 focus:ring-[#FBC6E2]/40 outline-none text-sm transition-all bg-white"
                  />
                </div>

                {/* City field */}
                <div>
                  <label className="block text-xs font-bold text-brand-dark mb-1">
                    {t.cityLabel || (lang === 'ar' ? 'المدينة والدولة' : 'City & Country')}
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder={t.cityPlaceholder || (lang === 'ar' ? 'مثال: الرياض، السعودية' : 'e.g. Riyadh, Saudi Arabia')}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#FBC6E2] focus:ring-2 focus:ring-[#FBC6E2]/40 outline-none text-sm transition-all bg-white"
                  />
                </div>

                {/* Review textarea */}
                <div>
                  <label className="block text-xs font-bold text-brand-dark mb-1">
                    {t.reviewLabel || (lang === 'ar' ? 'رأيكِ وتجربتكِ' : 'Your Review')} *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder={t.reviewPlaceholder || (lang === 'ar' ? 'كيف كانت تجربتكِ مع جل الحواجب؟ (قوة الثبات، المظهر الطبيعي، انعدام القشور البيضاء...)' : 'How was your experience?')}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#FBC6E2] focus:ring-2 focus:ring-[#FBC6E2]/40 outline-none text-sm transition-all resize-none bg-white"
                  />
                </div>

                {/* Recommend Checkbox */}
                <label className="flex items-center gap-3 cursor-pointer py-1">
                  <input
                    type="checkbox"
                    checked={recommend}
                    onChange={(e) => setRecommend(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-[#FBC6E2] focus:ring-[#FBC6E2] accent-[#3D1B22]"
                  />
                  <span className="text-xs text-brand-dark font-medium">
                    {t.recommendCheckbox || (lang === 'ar' ? 'نعم، أوصي بهذا المنتج لصديقاتي' : 'Yes, I recommend this product')}
                  </span>
                </label>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#FBC6E2] hover:bg-[#f8b4d8] text-brand-dark font-bold py-3.5 px-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 border border-[#F3B2D4] cursor-pointer text-sm flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isSubmitting ? (t.submitting || 'جارٍ النشر...') : (t.submitBtn || 'نشر التقييم')}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
