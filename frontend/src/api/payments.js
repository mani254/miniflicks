import apiClient from '../lib/apiClient';

/**
 * Payments API Service
 */
export const paymentsApi = {
  /**
   * Verify Razorpay payment signature
   * @param {{ razorpay_order_id: string, razorpay_payment_id: string, razorpay_signature: string }} data
   * @returns {Promise<{ booking: object, message: string }>}
   */
  async verifyPayment(data) {
    const res = await apiClient.post('/api/payments/verify', data);
    return res.data?.data || res.data;
  },

  /**
   * Cancel pending payment/order
   * @param {string} orderId
   * @returns {Promise<object>}
   */
  async cancelPayment(orderId) {
    const res = await apiClient.post('/api/payments/cancel', { orderId });
    return res.data?.data || res.data;
  },
};
