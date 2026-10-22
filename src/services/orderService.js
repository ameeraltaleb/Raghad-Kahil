/**
 * Order submission hook used by the checkout form.
 * The order itself is persisted by `openWhatsAppOrder` → ordersService.recordOrder,
 * so this simply confirms success without an artificial delay.
 */
export const submitOrder = async (orderData) => {
  return { success: true, orderId: orderData?.orderId };
};
