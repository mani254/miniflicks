import apiClient from '../lib/apiClient';

/**
 * Auth API Service
 */
export const authApi = {
  /**
   * Log in admin
   * @param {{ email: string, password: string }} credentials
   * @returns {Promise<{ admin: object, token: string }>}
   */
  async login(credentials) {
    const res = await apiClient.post('/api/auth/login', credentials);
    // TypeScript route returns { success: true, data: { admin, token } }
    const result = res.data?.data || res.data;
    if (result.token) {
      localStorage.setItem('authToken', result.token);
    }
    return result;
  },

  /**
   * Verify token on initial load / refresh
   * @param {string} token
   * @returns {Promise<{ admin: object, token: string }>}
   */
  async initialLogin(token) {
    const res = await apiClient.post('/api/auth/initialLogin', { token });
    return res.data?.data || res.data;
  },

  /**
   * Log out current session
   * @returns {Promise<object>}
   */
  async logout() {
    try {
      const res = await apiClient.post('/api/auth/logout');
      return res.data?.data || res.data;
    } finally {
      localStorage.removeItem('authToken');
    }
  },

  /**
   * Register Super Admin (initial setup)
   * @param {{ name: string, email: string, password: string }} data
   * @returns {Promise<object>}
   */
  async registerSuperAdmin(data) {
    const res = await apiClient.post('/api/auth/register', data);
    return res.data?.data || res.data;
  },
};
