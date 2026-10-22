import { recordOrder } from '../services/ordersService';

// Live bindings – updated from the admin dashboard via applyWhatsAppConfig()
export let WHATSAPP_PHONE = '905525200700';
export let WHATSAPP_DISPLAY = '+90 552 520 07 00';

export function applyWhatsAppConfig(phone, display) {
  const cleaned = String(phone || '').replace(/[^0-9]/g, '');
  if (cleaned.length >= 8) WHATSAPP_PHONE = cleaned;
  if (display && String(display).trim()) WHATSAPP_DISPLAY = String(display).trim();
}

/**
 * Builds a friendly, luxurious, complete WhatsApp order message
 * with bundle details, customer information, and extra notes.
 */
export function buildWhatsAppMessage({
  lang = 'ar',
  orderId = '',
  quantity = 1,
  bundleTitle = '',
  price = '',
  customerName = '',
  country = '',
  city = '',
  phone = '',
  address = '',
  paymentMethod = 'cod',
  notes = '',
  hasFreeGift = false,
  freeGifts = []
}) {
  const currentOrderId = orderId || `RK-${Math.floor(10000 + Math.random() * 90000)}`;
  const now = new Date().toLocaleDateString(lang === 'ar' ? 'ar-SA' : lang === 'tr' ? 'tr-TR' : 'en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const paymentLabels = {
    ar: { cod: 'الدفع عند الاستلام', card: 'بطاقة بنكية / مدى', bank: 'تحويل بنكي' },
    tr: { cod: 'Kapıda Ödeme', card: 'Kredi / Banka Kartı', bank: 'Banka Havalesi' },
    en: { cod: 'Cash on Delivery', card: 'Credit / Debit Card', bank: 'Bank Transfer' }
  };

  const paymentText = (paymentLabels[lang] || paymentLabels.ar)[paymentMethod] || (paymentLabels.ar.cod);

  // 1. ARABIC MESSAGE
  if (lang === 'ar') {
    let msg = `مرحباً فريق رغد كحيل 🌸✨\n`;
    msg += `أود تأكيد طلبي لمنتج جل وشمع الحواجب الفاخر:\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `🧾 رقم الطلب: #${currentOrderId}\n`;
    msg += `✨ المنتج: جل وشمع الحواجب (Brow Styling Wax & Gel)\n`;
    msg += `📦 عدد العبوات والباقة: ${bundleTitle || `${quantity} عبوة`}\n`;
    msg += `💰 المبلغ الإجمالي: ${price}\n`;
    
    if (hasFreeGift || (freeGifts && freeGifts.length > 0)) {
      msg += `🎁 الهدايا المشمولة: فرشاة دمج وتصفيف احترافية مزدوجة مجاناً ✨\n`;
    }
    msg += `🚚 الشحن: شحن سريع مجاني لجميع المناطق\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `📋 معلومات مقدّم الطلب:\n`;
    msg += `👤 الاسم الكامل: ${customerName || 'غير محدد'}\n`;
    if (phone) msg += `📱 رقم الهاتف: ${phone}\n`;
    if (country) msg += `🏳️ الدولة: ${country}\n`;
    if (city) msg += `📍 المدينة والحي: ${city}\n`;
    if (address) msg += `🏠 العنوان بالتفصيل: ${address}\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `ℹ️ معلومات إضافية:\n`;
    msg += `💳 طريقة الدفع: ${paymentText}\n`;
    if (notes && notes.trim()) {
      msg += `📝 ملاحظات خاصة بالتوصيل: ${notes.trim()}\n`;
    }
    msg += `🛡️ الضمان: ضمان ذهبي 14 يوم رضا تام\n`;
    msg += `⏰ تاريخ ووقت الطلب: ${now}\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `يسعدني تأكيد الطلب وتزويدي بموعد وصول الشحنة، شكراً لكم 💕`;
    return msg;
  }

  // 2. TURKISH MESSAGE
  if (lang === 'tr') {
    let msg = `Merhaba Raghad Kahil Ekibi 🌸✨\n`;
    msg += `Kaş Jeli & Wax ürününüz için siparişimi onaylamak istiyorum:\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `🧾 Sipariş No: #${currentOrderId}\n`;
    msg += `✨ Ürün: Raghad Kahil Kaş Wax & Jel\n`;
    msg += `📦 Paket / Adet: ${bundleTitle || `${quantity} Adet`}\n`;
    msg += `💰 Toplam Tutar: ${price}\n`;
    if (hasFreeGift || (freeGifts && freeGifts.length > 0)) {
      msg += `🎁 Dahil Olan Hediye: Çift Taraflı Profesyonel Kaş Fırçası ✨\n`;
    }
    msg += `🚚 Kargo: Ücretsiz Hızlı Kargo\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `📋 Müşteri Bilgileri:\n`;
    msg += `👤 Ad Soyad: ${customerName || 'Belirtilmedi'}\n`;
    if (phone) msg += `📱 Telefon: ${phone}\n`;
    if (country) msg += `🏳️ Ülke: ${country}\n`;
    if (city) msg += `📍 Şehir: ${city}\n`;
    if (address) msg += `🏠 Açık Adres: ${address}\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `ℹ️ Ek Bilgiler:\n`;
    msg += `💳 Ödeme Yöntemi: ${paymentText}\n`;
    if (notes && notes.trim()) {
      msg += `📝 Sipariş Notu: ${notes.trim()}\n`;
    }
    msg += `🛡️ Garanti: 14 Günlük Koşulsuz Memnuniyet Garantisi\n`;
    msg += `⏰ Sipariş Tarihi: ${now}\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `Siparişimi onaylamanızı ve kargo takip bilgilerini iletmenizi rica ederim, teşekkürler 💕`;
    return msg;
  }

  // 3. ENGLISH MESSAGE
  let msg = `Hello Raghad Kahil Team 🌸✨\n`;
  msg += `I would like to confirm my order for the Eyebrow Wax & Styling Gel:\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `🧾 Order ID: #${currentOrderId}\n`;
  msg += `✨ Product: Raghad Kahil Eyebrow Wax & Styling Gel\n`;
  msg += `📦 Selected Bundle / Units: ${bundleTitle || `${quantity} Units`}\n`;
  msg += `💰 Total Amount: ${price}\n`;
  if (hasFreeGift || (freeGifts && freeGifts.length > 0)) {
    msg += `🎁 Free Gift Included: Dual-Ended Professional Brow Brush ✨\n`;
  }
  msg += `🚚 Shipping: Free Express Shipping\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `📋 Customer Delivery Details:\n`;
  msg += `👤 Full Name: ${customerName || 'Not specified'}\n`;
  if (phone) msg += `📱 Phone: ${phone}\n`;
  if (country) msg += `🏳️ Country: ${country}\n`;
  if (city) msg += `📍 City: ${city}\n`;
  if (address) msg += `🏠 Full Address: ${address}\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `ℹ️ Additional Details:\n`;
  msg += `💳 Payment Method: ${paymentText}\n`;
  if (notes && notes.trim()) {
    msg += `📝 Delivery Notes: ${notes.trim()}\n`;
  }
  msg += `🛡️ Guarantee: 14-Day Satisfaction Guarantee\n`;
  msg += `⏰ Order Timestamp: ${now}\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `Looking forward to your confirmation and dispatch details, thank you 💕`;
  return msg;
}

/**
 * Creates the direct wa.me link with encoded message.
 */
export function getWhatsAppOrderUrl(params) {
  const text = buildWhatsAppMessage(params);
  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(text)}`;
}

/**
 * Safely opens WhatsApp in a new tab or deep-links on mobile.
 */
export function openWhatsAppOrder(params) {
  const url = getWhatsAppOrderUrl(params);
  const rawText = buildWhatsAppMessage(params);
  const orderId = params.orderId || `RK-${Math.floor(10000 + Math.random() * 90000)}`;

  if (typeof window !== 'undefined') {
    // Open WhatsApp synchronously (avoids popup blockers), then persist the order
    window.open(url, '_blank', 'noopener,noreferrer');

    recordOrder({
      id: orderId,
      quantity: params.quantity,
      bundleTitle: params.bundleTitle || `${params.quantity} عبوة`,
      price: params.price,
      finalTotal: params.finalTotal,
      currency: params.currency,
      customerName: params.customerName || 'عميلة جديدة',
      phone: params.phone || '',
      country: params.country || '',
      city: params.city || '',
      address: params.address || '',
      notes: params.notes || '',
      paymentMethod: params.paymentMethod || 'cod',
      hasFreeGift: Boolean(params.hasFreeGift),
      lang: params.lang,
      whatsappMessage: rawText
    }).catch((e) => console.error('Failed to record order:', e));
  }
  return url;
}
