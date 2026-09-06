import apiClient from '../lib/apiClient';

/**
 * Catalog API Service (Locations, Screens, Cakes, Addons, Gifts, Occasions, Coupons, Cities, Banners, Customers)
 */
export const catalogApi = {
  // ─── Locations ─────────────────────────────────────────────────────────────
  async getLocations(city) {
    const res = await apiClient.get('/api/locations', { params: city ? { city } : {} });
    return res.data?.locations || [];
  },

  async getLocation(id) {
    const res = await apiClient.get(`/api/locations/${id}`);
    return res.data?.location || null;
  },

  async addLocation(formData) {
    const res = await apiClient.post('/api/locations', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  async updateLocation(id, formData) {
    const res = await apiClient.put(`/api/locations/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  async changeLocationStatus(id, status) {
    const res = await apiClient.put(`/api/locations/status/${id}`, { status });
    return res.data;
  },

  async deleteLocation(id) {
    const res = await apiClient.delete(`/api/locations/${id}`);
    return res.data;
  },

  // ─── Screens ───────────────────────────────────────────────────────────────
  async getScreens(locationId) {
    const res = await apiClient.get('/api/screens', {
      params: locationId ? { location: locationId } : {},
    });
    return res.data?.screens || [];
  },

  async getScreen(id) {
    const res = await apiClient.get(`/api/screens/${id}`);
    return res.data?.screen || null;
  },

  async addScreen(formData) {
    const res = await apiClient.post('/api/screens', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  async updateScreen(id, formData) {
    const res = await apiClient.put(`/api/screens/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  async changeScreenStatus(id, status) {
    const res = await apiClient.put(`/api/screens/status/${id}`, { status });
    return res.data;
  },

  async deleteScreen(id) {
    const res = await apiClient.delete(`/api/screens/${id}`);
    return res.data;
  },

  // ─── Cakes ─────────────────────────────────────────────────────────────────
  async getAllCakes() {
    const res = await apiClient.get('/api/cakes/getAllCakes');
    return res.data?.cakes || [];
  },

  async getCakes(params) {
    const res = await apiClient.get('/api/cakes', { params });
    return {
      cakes: res.data?.cakes || [],
      totalDocuments: res.data?.totalDocuments || 0,
    };
  },

  async addCake(formData) {
    const res = await apiClient.post('/api/cakes', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  async updateCake(id, formData) {
    const res = await apiClient.put(`/api/cakes/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  async changeCakeStatus(id, status) {
    const res = await apiClient.put(`/api/cakes/status/${id}`, { status });
    return res.data;
  },

  async deleteCake(id) {
    const res = await apiClient.delete(`/api/cakes/${id}`);
    return res.data;
  },

  // ─── Addons ────────────────────────────────────────────────────────────────
  async getAllAddons() {
    const res = await apiClient.get('/api/addons/getAllAddons');
    return res.data?.addons || [];
  },

  async getAddons(params) {
    const res = await apiClient.get('/api/addons', { params });
    return {
      addons: res.data?.addons || [],
      totalDocuments: res.data?.totalDocuments || 0,
    };
  },

  async addAddon(formData) {
    const res = await apiClient.post('/api/addons', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  async updateAddon(id, formData) {
    const res = await apiClient.put(`/api/addons/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  async changeAddonStatus(id, status) {
    const res = await apiClient.put(`/api/addons/status/${id}`, { status });
    return res.data;
  },

  async deleteAddon(id) {
    const res = await apiClient.delete(`/api/addons/${id}`);
    return res.data;
  },

  // ─── Gifts ─────────────────────────────────────────────────────────────────
  async getAllGifts() {
    const res = await apiClient.get('/api/gifts/getAllGifts');
    return res.data?.gifts || [];
  },

  async getGifts(params) {
    const res = await apiClient.get('/api/gifts', { params });
    return {
      gifts: res.data?.gifts || [],
      totalDocuments: res.data?.totalDocuments || 0,
    };
  },

  async addGift(formData) {
    const res = await apiClient.post('/api/gifts', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  async updateGift(id, formData) {
    const res = await apiClient.put(`/api/gifts/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  async changeGiftStatus(id, status) {
    const res = await apiClient.put(`/api/gifts/status/${id}`, { status });
    return res.data;
  },

  async deleteGift(id) {
    const res = await apiClient.delete(`/api/gifts/${id}`);
    return res.data;
  },

  // ─── Occasions ─────────────────────────────────────────────────────────────
  async getAllOccasions() {
    const res = await apiClient.get('/api/occasions/getAllOccasions');
    return res.data?.occasions || [];
  },

  async getOccasions(params) {
    const res = await apiClient.get('/api/occasions', { params });
    return {
      occasions: res.data?.occasions || [],
      totalDocuments: res.data?.totalDocuments || 0,
    };
  },

  async addOccasion(formData) {
    const res = await apiClient.post('/api/occasions', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  async updateOccasion(id, formData) {
    const res = await apiClient.put(`/api/occasions/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  async changeOccasionStatus(id, status) {
    const res = await apiClient.put(`/api/occasions/status/${id}`, { status });
    return res.data;
  },

  async deleteOccasion(id) {
    const res = await apiClient.delete(`/api/occasions/${id}`);
    return res.data;
  },

  // ─── Coupons ───────────────────────────────────────────────────────────────
  async validateCoupon(code, date) {
    const res = await apiClient.post('/api/coupons/validate', { code, date });
    return res.data;
  },

  async getUserCoupons() {
    const res = await apiClient.get('/api/coupons/getUserCoupons');
    return res.data?.coupons || [];
  },

  async getCoupons(params) {
    const res = await apiClient.get('/api/coupons', { params });
    return {
      coupons: res.data?.coupons || [],
      totalDocuments: res.data?.totalDocuments || 0,
    };
  },

  async addCoupon(data) {
    const res = await apiClient.post('/api/coupons', data);
    return res.data;
  },

  async updateCoupon(id, data) {
    const res = await apiClient.put(`/api/coupons/${id}`, data);
    return res.data;
  },

  async deleteCoupon(id) {
    const res = await apiClient.delete(`/api/coupons/${id}`);
    return res.data;
  },

  // ─── Cities ────────────────────────────────────────────────────────────────
  async getCities(params) {
    const res = await apiClient.get('/api/cities', { params });
    return {
      cities: res.data?.cities || [],
      totalDocuments: res.data?.totalDocuments || 0,
    };
  },

  async addCity(data) {
    const res = await apiClient.post('/api/cities', data);
    return res.data;
  },

  async updateCity(id, data) {
    const res = await apiClient.put(`/api/cities/${id}`, data);
    return res.data;
  },

  async deleteCity(id) {
    const res = await apiClient.delete(`/api/cities/${id}`);
    return res.data;
  },

  // ─── Banners ───────────────────────────────────────────────────────────────
  async getUserBanners() {
    const res = await apiClient.get('/api/banners/getUserBanners');
    return res.data?.banners || [];
  },

  async getBanners(params) {
    const res = await apiClient.get('/api/banners', { params });
    return {
      banners: res.data?.banners || [],
      totalDocuments: res.data?.totalDocuments || 0,
    };
  },

  async addBanner(formData) {
    const res = await apiClient.post('/api/banners', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  async updateBanner(id, formData) {
    const res = await apiClient.put(`/api/banners/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  async changeBannerStatus(id, status) {
    const res = await apiClient.put(`/api/banners/status/${id}`, { status });
    return res.data;
  },

  async deleteBanner(id) {
    const res = await apiClient.delete(`/api/banners/${id}`);
    return res.data;
  },

  // ─── Customers ─────────────────────────────────────────────────────────────
  async getCustomers(params) {
    const res = await apiClient.get('/api/customers', { params });
    return {
      customers: res.data?.customers || [],
      totalDocuments: res.data?.totalDocuments || 0,
    };
  },
};
