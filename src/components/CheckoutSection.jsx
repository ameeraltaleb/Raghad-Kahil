import React, { useState, useRef, useEffect } from 'react';
import BundlePricing from './BundlePricing';
import FastCheckoutForm from './FastCheckoutForm';
import OrderSuccessModal from './OrderSuccessModal';

export default function CheckoutSection({ lang, currency, setCurrency }) {
  const [quantity, setQuantity] = useState(1);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  
  const [showCheckout, setShowCheckout] = useState(false);
  
  const checkoutRef = useRef(null);
  
  const handleAddToCart = () => {
    setShowCheckout(true);
  };

  useEffect(() => {
    if (showCheckout && checkoutRef.current) {
      setTimeout(() => {
        checkoutRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [showCheckout]);

  const handleOrderSuccess = (details) => {
    setOrderDetails(details);
    setIsSuccessModalOpen(true);
    setShowCheckout(false); // hide form again after success
  };

  return (
    <div className="relative">
      {/* Product Purchase Area */}
      <BundlePricing 
        lang={lang} 
        quantity={quantity} 
        setQuantity={setQuantity}
        currency={currency}
        setCurrency={setCurrency}
        onAddToCart={handleAddToCart}
      />

      {/* Checkout Form (Hidden until Order Now is clicked) */}
      {showCheckout && (
        <div ref={checkoutRef} className="bg-brand-bg scroll-mt-24 border-t border-brand-pink/30">
          <FastCheckoutForm 
            lang={lang} 
            quantity={quantity}
            currency={currency}
            onOrderSuccess={handleOrderSuccess}
          />
        </div>
      )}

      <OrderSuccessModal 
        lang={lang} 
        isOpen={isSuccessModalOpen} 
        onClose={() => setIsSuccessModalOpen(false)} 
        orderDetails={orderDetails} 
      />
    </div>
  );
}
