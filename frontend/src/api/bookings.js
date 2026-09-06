import apiClient from '../lib/apiClient';

/**
 * Bookings API Service
 */
export const bookingsApi = {
  /**
   * Get booked slots for a given screen and date
   * @param {{ screenId: string, currentDate: string|Date }} payload
   * @returns {Promise<Array<{ from: string, to: string }>>}
   */
  async getBookedSlots({ screenId, currentDate }) {
    const res = await apiClient.post('/api/bookings/getBookedSlots', { screenId, currentDate });
    const data = res.data?.data || res.data;
    return data?.bookedSlots || [];
  },

  /**
   * Create customer booking (triggers Razorpay order creation)
   * @param {object} bookingData
   * @returns {Promise<{ booking: object, razorpayOrderId: string }>}
   */
  async createCustomerBooking(bookingData) {
    const res = await apiClient.post('/api/bookings/customerBooking', bookingData);
    return res.data?.data || res.data;
  },

  /**
   * Create admin booking (skips payment)
   * @param {object} bookingData
   * @returns {Promise<{ booking: object }>}
   */
  async createAdminBooking(bookingData) {
    const res = await apiClient.post('/api/bookings', bookingData);
    return res.data?.data || res.data;
  },

  /**
   * Get list of bookings (admin) with pagination and filters
   * @param {object} params
   * @returns {Promise<{ bookings: Array<object>, totalDocuments: number }>}
   */
  async getBookings(params) {
    const res = await apiClient.get('/api/bookings', { params });
    const data = res.data?.data || res.data;
    return {
      bookings: data?.bookings || [],
      totalDocuments: data?.totalDocuments || 0,
    };
  },

  /**
   * Get single booking by ID (admin)
   * @param {string} id
   * @returns {Promise<object>}
   */
  async getBooking(id) {
    const res = await apiClient.get(`/api/bookings/${id}`);
    const data = res.data?.data || res.data;
    return data?.booking || null;
  },

  /**
   * Update existing booking (admin)
   * @param {object} bookingData
   * @returns {Promise<{ booking: object }>}
   */
  async updateBooking(bookingData) {
    const res = await apiClient.put('/api/bookings', bookingData);
    return res.data?.data || res.data;
  },

  /**
   * Delete booking by ID (admin)
   * @param {string} id
   * @returns {Promise<object>}
   */
  async deleteBooking(id) {
    const res = await apiClient.delete(`/api/bookings/${id}`);
    return res.data?.data || res.data;
  },

  /**
   * Get dashboard summary stats
   * @param {object} params
   * @returns {Promise<object>}
   */
  async getDashboardInfo(params) {
    const res = await apiClient.get('/api/bookings/info', { params });
    const data = res.data?.data || res.data;
    return data?.info || null;
  },

  /**
   * Get graph and analytics data (distribution and timeline)
   * @param {object} [params]
   * @returns {Promise<{ distribution: Array<object>, timeline: Array<object>, overallTotal: number, type: string }>}
   */
  async getGraphData(params) {
    const res = await apiClient.get('/api/bookings/graphData', { params });
    const data = res.data?.data || res.data;
    return data?.data || { distribution: [], timeline: [], overallTotal: 0, type: 'location' };
  },
};
