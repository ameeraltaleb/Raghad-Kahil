export const WHATSAPP_PHONE = '905525200700';
export const WHATSAPP_DISPLAY = '+90 552 520 07 00';

/**
 * Builds a friendly, luxurious WhatsApp order message based on selected language and order details.
 */
export function buildWhatsAppMessage({
  lang = 'ar',
  quantity = 1,
  bundleTitle = '',
  price = '',
  customerName = '',
  city = '',
  phone = '',
  address = '',
  hasFreeGift = false,
  paymentMethod = 'cod'
}) {
  if (lang === 'tr') {
    let msg = `Merhaba Raghad Kahil Ekibi 🌸✨\n`;
    msg += `Raghad Kahil Kaş Jeli & Wax ürününüz için sipariş vermek istiyorum:\n\n`;
    msg += `📦 Seçilen Paket: ${bundleTitle || `${quantity} Adet`}\n`;
    msg += `💰 Toplam Tutar: ${price}\n`;
    if (hasFreeGift) {
      msg += `🎁 Hediye: Çift Taraflı Profesyonel Kaş Fırçası Hediye ✨\n`;
    }
    msg += `🚚 Kargo: Ücretsiz Hızlı Kargo\n`;

    if (customerName || city || phone || address) {
      msg += `\n📋 Müşteri Bilgileri:\n`;
      if (customerName) msg += `👤 İsim: ${customerName}\n`;
      if (phone) msg += `📱 Telefon: ${phone}\n`;
      if (city) msg += `📍 Şehir: ${city}\n`;
      if (address) msg += `🏠 Adres: ${address}\n`;
    }

    msg += `\nSiparişimi onaylamanızı ve kargo sürecini iletmenizi rica ederim, teşekkürler 💕`;
    return msg;
  }

  if (lang === 'en') {
    let msg = `Hello Raghad Kahil Team 🌸✨\n`;
    msg += `I would like to place an order for the Eyebrow Wax & Styling Gel:\n\n`;
    msg += `📦 Selected Bundle: ${bundleTitle || `${quantity} Units`}\n`;
    msg += `💰 Total Amount: ${price}\n`;
    if (hasFreeGift) {
      msg += `🎁 Free Gift Included: Professional Dual-Ended Brow Brush ✨\n`;
    }
    msg += `🚚 Shipping: Free Express Shipping\n`;

    if (customerName || city || phone || address) {
      msg += `\n📋 Delivery Details:\n`;
      if (customerName) msg += `👤 Name: ${customerName}\n`;
      if (phone) msg += `📱 Phone: ${phone}\n`;
      if (city) msg += `📍 City/Country: ${city}\n`;
      if (address) msg += `🏠 Address: ${address}\n`;
    }

    msg += `\nPlease confirm my order and let me know the delivery timeline, thank you 💕`;
    return msg;
  }

  // Arabic (Default)
  let msg = `مرحباً فريق رغد كحيل 🌸✨\n`;
  msg += `أود تأكيد طلبي لمنتج جل وشمع الحواجب الفاخر:\n\n`;
  msg += `📦 الباقة المختارة: ${bundleTitle || `${quantity} عبوة`}\n`;
  msg += `💰 المبلغ الإجمالي: ${price}\n`;
  if (hasFreeGift) {
    msg += `🎁 الهدية المشمولة: فرشاة دمج وتصفيف احترافية مزدوجة مجاناً ✨\n`;
  }
  msg += `🚚 الشحن: شحن سريع مجاني لجميع المناطق\n`;

  if (customerName || city || phone || address) {
    msg += `\n📋 بيانات التوصيل:\n`;
    if (customerName) msg += `👤 الاسم الكريم: ${customerName}\n`;
    if (phone) msg += `📱 رقم التواصل: ${phone}\n`;
    if (city) msg += `📍 المدينة / الدولة: ${city}\n`;
    if (address) msg += `🏠 العنوان بالتفصيل: ${address}\n`;
  }

  msg += `\nيسعدني تأكيد الطلب من طرفكم وتزويدي بموعد التوصيل، شكراً لكم 💕`;
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
  if (typeof window !== 'undefined') {
    // Record order in localStorage for local logging/analytics
    try {
      const existing = JSON.parse(localStorage.getItem('raghad_whatsapp_orders') || '[]');
      existing.unshift({
        id: `WA-${Date.now()}`,
        timestamp: new Date().toISOString(),
        quantity: params.quantity,
        price: params.price,
        customerName: params.customerName || 'Anonymous',
        city: params.city || '',
        phone: params.phone || ''
      });
      localStorage.setItem('raghad_whatsapp_orders', JSON.stringify(existing.slice(0, 50)));
    } catch (e) {
      console.error('Failed to log WhatsApp order:', e);
    }

    window.open(url, '_blank', 'noopener,noreferrer');
  }
  return url;
}
