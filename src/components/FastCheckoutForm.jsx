import React, { useState } from 'react';
import { translations } from '../translations';
import { CreditCard, Truck, ShieldCheck, Loader2, Building, Gift, CheckCircle2, MessageCircle, FileText, User, Phone, MapPin } from 'lucide-react';
import GuaranteeBadge from './GuaranteeBadge';
import { submitOrder } from '../services/orderService';
import { countries, currencies, calculatePricing } from '../data/checkoutData';
import { openWhatsAppOrder, WHATSAPP_DISPLAY } from '../utils/whatsapp';

export default function FastCheckoutForm({ lang, quantity, currency, countryCode = 'TR', onOrderSuccess }) {
  const t = translations[lang]?.checkout || translations.ar.checkout;
  const tPricingInfo = translations[lang]?.pricing || translations.ar.pricing;
  const isRtl = lang === 'ar';
  
  const currentCurrency = currencies.find(c => c.code === currency) || currencies[0];
  const pricing = calculatePricing(quantity, currency);
  const displayFinalPrice = currentCurrency.format(pricing.finalTotal);

  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const initialCountry = countries.find(c => c.code === countryCode) || countries[0];

  const [formData, setFormData] = useState({
    fullName: '',
    phone: initialCountry ? initialCountry.dialCode + ' ' : '',
    countryCode: initialCountry ? initialCountry.code : 'TR',
    city: '',
    address: '',
    notes: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMsg('');
  };
  
  const handleCountryChange = (e) => {
    const newCode = e.target.value;
    const newCountry = countries.find(c => c.code === newCode);
    let newPhone = formData.phone;
    if (!newPhone || newPhone.startsWith('+')) {
      if (newPhone.length <= 5 && newCountry) {
        newPhone = newCountry.dialCode + ' ';
      }
    }
    setFormData({ ...formData, countryCode: newCode, phone: newPhone });
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.fullName.trim().length < 3) {
      setErrorMsg(lang === 'ar' ? 'يرجى كتابة الاسم الكامل بشكل صحيح.' : 'Please enter a valid full name.');
      return;
    }
    if (formData.phone.trim().length < 8) {
      setErrorMsg(lang === 'ar' ? 'يرجى كتابة رقم هاتف صحيح للتواصل مع رمز الدولة.' : 'Please enter a valid phone number with country code.');
      return;
    }
    if (formData.city.trim().length < 2 || formData.address.trim().length < 5) {
      setErrorMsg(lang === 'ar' ? 'يرجى كتابة المدينة وعنوان التوصيل بالتفصيل.' : 'Please provide a complete delivery address and city.');
      return;
    }

    setIsSubmitting(true);

    const generatedOrderId = `RK-${Math.floor(10000 + Math.random() * 90000)}`;
    const selectedCountryObj = countries.find(c => c.code === formData.countryCode);
    const countryName = selectedCountryObj ? selectedCountryObj.name : formData.countryCode;

    const orderData = {
      orderId: generatedOrderId,
      customerName: formData.fullName,
      phoneNumber: formData.phone,
      selectedCountry: countryName,
      city: formData.city,
      address: formData.address,
      notes: formData.notes,
      quantity: quantity,
      unitPrice: pricing.originalTotal / quantity,
      discountPercentage: pricing.discountRate,
      discountAmount: pricing.discountAmount,
      freeGiftsIncluded: pricing.freeGifts,
      finalTotal: pricing.finalTotal,
      currency: currency,
      paymentMethod,
      timestamp: new Date().toISOString(),
      language: lang
    };

    // Open WhatsApp with all structured order and customer details
    openWhatsAppOrder({
      lang,
      orderId: generatedOrderId,
      quantity,
      bundleTitle: `${quantity} ${tPricingInfo.units || 'عبوات'}`,
      price: displayFinalPrice,
      finalTotal: pricing.finalTotal,
      currency,
      customerName: formData.fullName,
      phone: formData.phone,
      country: countryName,
      city: formData.city,
      address: formData.address,
      notes: formData.notes,
      paymentMethod,
      hasFreeGift: pricing.freeGifts && pricing.freeGifts.length > 0,
      freeGifts: pricing.freeGifts
    });

    const response = await submitOrder(orderData);
    setIsSubmitting(false);

    if (response.success) {
      onOrderSuccess({
        orderId: generatedOrderId,
        bundleName: `${quantity} ${tPricingInfo.units || 'عبوات'}`,
        price: displayFinalPrice,
        city: formData.city
      });
      setFormData({ fullName: '', phone: '', countryCode: 'TR', city: '', address: '', notes: '' });
    } else {
      setErrorMsg(lang === 'ar' ? 'حدث خطأ غير متوقع، يرجى إعادة المحاولة.' : 'Order submission failed. Please try again.');
    }
  };

  return (
    <section className="pb-12 sm:pb-32 pt-4 sm:pt-10 relative">
      {/* Decorative background blur */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-brand-peach/30 pointer-events-none"></div>
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Step Indicator Header */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-[#F3B2D4]/60 shadow-xs mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">✓</span>
            <div>
              <span className="text-xs text-brand-muted font-bold block">{lang === 'ar' ? 'الخطوة 1: اختيار الباقة' : 'Step 1: Package'}</span>
              <span className="text-sm font-bold text-brand-dark">{quantity} {tPricingInfo.units} · {displayFinalPrice}</span>
            </div>
          </div>

          <div className="hidden sm:block h-8 w-px bg-gray-200" />

          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-[#FBC6E2] text-brand-dark flex items-center justify-center font-black text-sm border border-[#F3B2D4]">2</span>
            <div>
              <span className="text-xs text-brand-rose font-bold block">{lang === 'ar' ? 'الخطوة 2: معلومات التوصيل' : 'Step 2: Delivery Info'}</span>
              <span className="text-sm font-bold text-brand-dark">{lang === 'ar' ? 'إدخال بيانات مقدّم الطلب' : 'Customer Details'}</span>
            </div>
          </div>

          <div className="hidden sm:block h-8 w-px bg-gray-200" />

          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            <span>{lang === 'ar' ? 'الاستلام عبر واتساب' : 'WhatsApp Dispatch'}</span>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-2xl rounded-3xl sm:rounded-[2.5rem] shadow-[0_20px_50px_-12px_rgba(184,92,102,0.1)] border border-white/60 overflow-hidden flex flex-col md:flex-row">
          
          {/* Order Summary sidebar */}
          <div className="w-full md:w-5/12 bg-gradient-to-br from-brand-peach/40 to-transparent p-4 sm:p-8 lg:p-12 border-b md:border-b-0 md:border-r border-brand-pink/20 flex flex-col">
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-brand-dark mb-4 sm:mb-8 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-[#FBC6E2] flex items-center justify-center text-brand-dark font-bold text-sm border border-[#F3B2D4]">1</span>
              {t.summaryTitle}
            </h3>
            
            <div className="bg-white/60 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs border border-white/50 space-y-3.5 sm:space-y-5 mb-4 sm:mb-8 flex-grow">
              <div className="flex justify-between items-center pb-5 border-b border-brand-pink/20">
                <div>
                  <p className="text-xs font-semibold text-brand-muted uppercase tracking-wider mb-1">{tPricingInfo.quantity}</p>
                  <p className="font-serif font-bold text-brand-dark text-xl">{quantity} {tPricingInfo.units}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-brand-muted uppercase tracking-wider mb-1">{lang === 'ar' ? 'السعر الأصلي' : 'Item Price'}</p>
                  <p className="font-semibold text-brand-dark" dir="ltr">{currentCurrency.format(pricing.originalTotal)}</p>
                </div>
              </div>
              
              {pricing.discountRate > 0 && (
                <div className="flex justify-between items-center text-sm font-medium bg-brand-rose/5 text-brand-rose px-4 py-3 rounded-2xl">
                  <span>{tPricingInfo.discount}</span>
                  <span dir="ltr">-{currentCurrency.format(pricing.discountAmount)}</span>
                </div>
              )}
              
              {pricing.freeGifts.length > 0 && (
                <div className="pt-2">
                  <p className="text-[11px] font-bold text-brand-muted uppercase tracking-widest mb-3">{lang === 'ar' ? 'الهدايا المشمولة' : 'Included Gifts'}</p>
                  <div className="space-y-3">
                    {pricing.freeGifts.map((gift, idx) => (
                      <div key={idx} className="flex items-start gap-3 text-sm text-brand-dark font-medium bg-white/40 p-3 rounded-xl border border-white/50 shadow-xs">
                        <Gift className="w-4 h-4 text-brand-rose shrink-0 mt-0.5" />
                        <span>{gift}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50/80 p-3 rounded-xl border border-emerald-100">
                <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold">{lang === 'ar' ? 'شحن سريع مجاني لجميع المناطق' : 'Free Express Shipping Included'}</span>
              </div>
            </div>
            
            <div className="pt-2 flex justify-between items-end px-2">
              <span className="font-medium text-brand-muted text-base sm:text-lg">{tPricingInfo.total}</span>
              <span className="text-3xl sm:text-4xl font-serif font-bold text-brand-rose drop-shadow-xs" dir="ltr">{displayFinalPrice}</span>
            </div>
          </div>

          {/* Customer Information & Checkout Form */}
          <div className="w-full md:w-7/12 p-4 sm:p-8 lg:p-12 bg-white/40">
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-brand-dark mb-4 sm:mb-8 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-[#FBC6E2] flex items-center justify-center text-brand-dark font-bold text-sm border border-[#F3B2D4]">2</span>
              <span>{lang === 'ar' ? 'معلومات مقدّم الطلب للتوصيل' : 'Customer Delivery Details'}</span>
            </h3>

            <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
              
              {errorMsg && (
                <div className="p-4 rounded-2xl bg-red-50/80 backdrop-blur-md border border-red-100 text-red-600 text-sm font-medium flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                  {errorMsg}
                </div>
              )}

              {/* Form Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div className="space-y-1.5 sm:space-y-2 relative group">
                  <label className="text-[10px] sm:text-xs font-bold text-brand-muted uppercase tracking-wider pl-1">
                    {t.form.fullName} *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 sm:px-5 sm:py-3.5 rounded-xl sm:rounded-2xl border border-brand-pink/30 focus:outline-none focus:ring-4 focus:ring-brand-peach/50 focus:border-brand-rose bg-white/70 transition-all text-sm sm:text-base text-brand-dark placeholder-gray-400"
                    placeholder={lang === 'ar' ? 'مثال: نورة العتيبي' : 'Jane Doe'}
                    required
                  />
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-[10px] sm:text-xs font-bold text-brand-muted uppercase tracking-wider pl-1">
                    {t.form.phone} *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 sm:px-5 sm:py-3.5 rounded-xl sm:rounded-2xl border border-brand-pink/30 focus:outline-none focus:ring-4 focus:ring-brand-peach/50 focus:border-brand-rose bg-white/70 transition-all text-sm sm:text-base text-left text-brand-dark"
                    dir="ltr"
                    placeholder="+966 50 123 4567"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-[10px] sm:text-xs font-bold text-brand-muted uppercase tracking-wider pl-1">
                    {t.form.country} *
                  </label>
                  <select
                    name="countryCode"
                    value={formData.countryCode}
                    onChange={handleCountryChange}
                    className={`w-full px-4 py-3 sm:px-5 sm:py-3.5 rounded-xl sm:rounded-2xl border border-brand-pink/30 focus:outline-none focus:ring-4 focus:ring-brand-peach/50 focus:border-brand-rose bg-white/70 transition-all text-sm sm:text-base text-brand-dark appearance-none cursor-pointer ${
                      isRtl
                        ? 'bg-[url("data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22currentColor%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M5.293%207.293a1%201%200%20011.414%200L10%2010.586l3.293-3.293a1%201%200%20111.414%201.414l-4%204a1%201%200%2001-1.414%200l-4-4a1%201%200%20010-1.414z%22%20clip-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E")] bg-[length:1.25rem_1.25rem] bg-[position:left_1rem_center] bg-no-repeat pl-12 pr-4'
                        : 'bg-[url("data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22currentColor%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M5.293%207.293a1%201%200%20011.414%200L10%2010.586l3.293-3.293a1%201%200%20111.414%201.414l-4%204a1%201%200%2001-1.414%200l-4-4a1%201%200%20010-1.414z%22%20clip-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E")] bg-[length:1.25rem_1.25rem] bg-[position:right_1rem_center] bg-no-repeat pr-12 pl-4'
                    }`}
                  >
                    {countries.map(c => (
                      <option key={c.code} value={c.code}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-[10px] sm:text-xs font-bold text-brand-muted uppercase tracking-wider pl-1">
                    {t.form.city} *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-4 py-3 sm:px-5 sm:py-3.5 rounded-xl sm:rounded-2xl border border-brand-pink/30 focus:outline-none focus:ring-4 focus:ring-brand-peach/50 focus:border-brand-rose bg-white/70 transition-all text-sm sm:text-base text-brand-dark placeholder-gray-400"
                    placeholder={lang === 'ar' ? 'المدينة والحي (مثال: الرياض - النرجس)' : 'City & District'}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-[10px] sm:text-xs font-bold text-brand-muted uppercase tracking-wider pl-1">
                  {t.form.address} *
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows="2"
                  className="w-full px-4 py-3 sm:px-5 sm:py-3.5 rounded-xl sm:rounded-2xl border border-brand-pink/30 focus:outline-none focus:ring-4 focus:ring-brand-peach/50 focus:border-brand-rose bg-white/70 transition-all resize-none text-sm sm:text-base text-brand-dark placeholder-gray-400"
                  placeholder={lang === 'ar' ? 'الشارع، رقم المبنى أو أي معلم قريب...' : 'Full delivery address, street, building...'}
                  required
                ></textarea>
              </div>

              {/* Additional Notes Field */}
              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-[10px] sm:text-xs font-bold text-brand-muted uppercase tracking-wider pl-1 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-brand-rose" />
                  <span>{lang === 'ar' ? 'معلومات أو ملاحظات إضافية (اختياري)' : lang === 'tr' ? 'Ek Sipariş Notu (İsteğe bağlı)' : 'Additional Notes / Instructions (Optional)'}</span>
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="2"
                  className="w-full px-4 py-3 sm:px-5 sm:py-3 rounded-xl sm:rounded-2xl border border-brand-pink/30 focus:outline-none focus:ring-4 focus:ring-brand-peach/50 focus:border-brand-rose bg-white/70 transition-all resize-none text-xs sm:text-sm text-brand-dark placeholder-gray-400"
                  placeholder={lang === 'ar' ? 'مثال: وقت التوصيل المفضل، أو الاتصال قبل الوصول بدقائق...' : 'e.g. Preferred delivery time, call upon arrival...'}
                ></textarea>
              </div>

              {/* Payment Methods */}
              <div className="pt-3 sm:pt-4">
                <h4 className="text-sm font-bold text-brand-dark mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#FBC6E2] flex items-center justify-center text-brand-dark font-bold text-xs border border-[#F3B2D4]">3</span>
                  <span>{t.payment.title}</span>
                </h4>
                <div className="flex flex-col gap-2.5">
                  
                  {/* COD */}
                  <label className={`cursor-pointer group flex items-center p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all duration-300 ${
                      paymentMethod === 'cod' ? 'border-[#FBC6E2] bg-[#FBC6E2]/20 shadow-xs ring-1 ring-[#FBC6E2]' : 'border-white bg-white hover:border-[#FBC6E2]/50'
                    }`}>
                    <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="sr-only" />
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${paymentMethod === 'cod' ? 'border-[#F3B2D4] bg-[#FBC6E2]' : 'border-gray-300 group-hover:border-[#FBC6E2]'}`}>
                      {paymentMethod === 'cod' && <div className="w-2.5 h-2.5 rounded-full bg-brand-dark"></div>}
                    </div>
                    <div className="ml-3 mr-3 flex items-center justify-between w-full">
                      <div>
                        <div className="font-bold text-xs sm:text-sm text-brand-dark">{t.payment.cod}</div>
                        <div className="text-[10px] sm:text-xs text-brand-muted mt-0.5">{t.payment.codNote}</div>
                      </div>
                      <Truck className={`w-5 h-5 shrink-0 ${paymentMethod === 'cod' ? 'text-brand-dark' : 'text-gray-400'}`} />
                    </div>
                  </label>
                  
                  {/* Card / Transfer */}
                  <label className={`cursor-pointer group flex items-center p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all duration-300 ${
                      paymentMethod === 'card' ? 'border-[#FBC6E2] bg-[#FBC6E2]/20 shadow-xs ring-1 ring-[#FBC6E2]' : 'border-white bg-white hover:border-[#FBC6E2]/50'
                    }`}>
                    <input type="radio" name="payment" value="card" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} className="sr-only" />
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${paymentMethod === 'card' ? 'border-[#F3B2D4] bg-[#FBC6E2]' : 'border-gray-300 group-hover:border-[#FBC6E2]'}`}>
                      {paymentMethod === 'card' && <div className="w-2.5 h-2.5 rounded-full bg-brand-dark"></div>}
                    </div>
                    <div className="ml-3 mr-3 flex items-center justify-between w-full">
                      <div className="font-bold text-xs sm:text-sm text-brand-dark">
                        {t.payment.card}
                      </div>
                      <CreditCard className={`w-5 h-5 shrink-0 ${paymentMethod === 'card' ? 'text-brand-dark' : 'text-gray-400'}`} />
                    </div>
                  </label>

                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-4 sm:pt-6">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full py-4 sm:py-5 text-base sm:text-lg font-black rounded-xl sm:rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-500 text-white hover:from-emerald-600 hover:to-emerald-700 border-2 border-emerald-400/50 shadow-xl shadow-emerald-500/25 transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 disabled:cursor-not-allowed flex items-center justify-center gap-3 cursor-pointer group"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <span>{lang === 'ar' ? 'جارٍ التحضير والانتقال لواتساب...' : 'Processing...'}</span>
                    </>
                  ) : (
                    <>
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                        <MessageCircle className="w-4 h-4 fill-current text-white group-hover:rotate-12 transition-transform" />
                      </div>
                      <span>
                        {lang === 'ar' ? 'تأكيد الطلب والانتقال إلى واتساب 💬' : lang === 'tr' ? 'Siparişi Onayla ve WhatsApp\'a Geç 💬' : 'Confirm Order & Proceed to WhatsApp 💬'}
                      </span>
                    </>
                  )}
                </button>

                <p className="text-center text-[11px] text-brand-muted font-medium mt-3">
                  {lang === 'ar'
                    ? `سيتم نقلكِ مباشرة إلى محادثة واتساب الرسمية (${WHATSAPP_DISPLAY}) مع كامل تفاصيل طلبكِ.`
                    : `You will be redirected directly to WhatsApp (${WHATSAPP_DISPLAY}) with your order details.`}
                </p>

                <div className="flex items-center justify-center gap-2 mt-4 text-brand-muted text-xs sm:text-sm font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>{t.guarantee}</span>
                </div>
                <div className="mt-5">
                  <GuaranteeBadge lang={lang} />
                </div>
              </div>

            </form>
          </div>

        </div>
      </div>
    </section>
  );
}
