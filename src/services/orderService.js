export const submitOrder = async (orderData) => {
  // Mock webhook URL (e.g. Google Apps Script, Supabase, or custom REST API)
  const WEBHOOK_URL = 'https://example.com/api/orders';

  return new Promise((resolve) => {
    // Simulate network delay for UX purposes
    setTimeout(() => {
      console.log('Order submitted successfully:', orderData);
      
      /*
      // Real implementation template:
      try {
        const response = await fetch(WEBHOOK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(orderData),
        });
        const result = await response.json();
        resolve({ success: true, data: result });
      } catch (error) {
        console.error('Order submission failed', error);
        resolve({ success: false, error });
      }
      */

      // Mock success response
      resolve({ 
        success: true, 
        orderId: `GLW-${Math.floor(Math.random() * 1000000)}` 
      });
    }, 1500);
  });
};
