import bannerTypes from './bannerActionTypes'; // Adjust this path as necessary
import axios from 'axios';
import { showNotification } from '../notification/notificationActions';

// Add Banner Actions
const addBannerRequest = () => ({
   type: bannerTypes.ADD_BANNER_REQUEST,
});

const addBannerSuccess = (banner) => ({
   type: bannerTypes.ADD_BANNER_SUCCESS,
   payload: banner,
});

const addBannerFailure = (error) => ({
   type: bannerTypes.ADD_BANNER_FAILURE,
   payload: error,
});

export const addBanner = (bannerData) => async (dispatch) => {
   dispatch(addBannerRequest());
   try {
      const response = await axios.post(`${import.meta.env.VITE_APP_BACKENDURI}/api/banners`, bannerData);
      dispatch(addBannerSuccess(response.data.banner));
      dispatch(showNotification('Banner added successfully!'));
      return Promise.resolve();
   } catch (error) {
      let errMessage = error.response ? error.response.data.error : 'Something went wrong';
      dispatch(addBannerFailure(errMessage));
      dispatch(showNotification(errMessage));
      return Promise.reject(errMessage);
   }
};

// Get Banners Actions
const getBannersRequest = () => ({
   type: bannerTypes.GET_BANNERS_REQUEST,
});

const getBannersSuccess = (banners) => ({
   type: bannerTypes.GET_BANNERS_SUCCESS,
   payload: banners,
});

const getBannersFailure = (error) => ({
   type: bannerTypes.GET_BANNERS_FAILURE,
   payload: error,
});

export const getBanners = () => async (dispatch) => {
   dispatch(getBannersRequest());
   try {
      const response = await axios.get(`${import.meta.env.VITE_APP_BACKENDURI}/api/banners`);
      dispatch(getBannersSuccess(response.data.banners));
      return Promise.resolve();
   } catch (error) {
      let errMessage = error.response ? error.response.data.error : 'Something went wrong';
      dispatch(getBannersFailure(errMessage));
      dispatch(showNotification(errMessage));
      return Promise.reject(errMessage);
   }
};

// Update Banner Actions
const updateBannerRequest = () => ({
   type: bannerTypes.UPDATE_BANNER_REQUEST,
});

const updateBannerSuccess = (banner) => ({
   type: bannerTypes.UPDATE_BANNER_SUCCESS,
   payload: banner,
});

const updateBannerFailure = (error) => ({
   type: bannerTypes.UPDATE_BANNER_FAILURE,
   payload: error,
});

export const updateBanner = (bannerId, bannerData) => async (dispatch) => {
   dispatch(updateBannerRequest());
   try {
      const response = await axios.put(`${import.meta.env.VITE_APP_BACKENDURI}/api/banners/${bannerId}`, bannerData);
      dispatch(updateBannerSuccess(response.data.banner));
      dispatch(showNotification('Banner updated successfully!'));
      return Promise.resolve();
   } catch (error) {
      let errMessage = error.response ? error.response.data.error : 'Something went wrong';
      dispatch(updateBannerFailure(errMessage));
      dispatch(showNotification(errMessage));
      return Promise.reject(errMessage);
   }
};

// Delete Banner Actions
const deleteBannerRequest = () => ({
   type: bannerTypes.DELETE_BANNER_REQUEST,
});

const deleteBannerSuccess = (bannerId) => ({
   type: bannerTypes.DELETE_BANNER_SUCCESS,
   payload: bannerId,
});

const deleteBannerFailure = (error) => ({
   type: bannerTypes.DELETE_BANNER_FAILURE,
   payload: error,
});

export const deleteBanner = (bannerId) => async (dispatch) => {
   dispatch(deleteBannerRequest());
   try {
      await axios.delete(`${import.meta.env.VITE_APP_BACKENDURI}/api/banners/${bannerId}`);
      dispatch(deleteBannerSuccess(bannerId));
      dispatch(showNotification('Banner deleted successfully!'));
      return Promise.resolve(bannerId);
   } catch (error) {
      let errMessage = error.response ? error.response.data.error : 'Something went wrong';
      dispatch(deleteBannerFailure(errMessage));
      dispatch(showNotification(errMessage));
      return Promise.reject(errMessage);
   }
};

// Change Banner Status Actions
export const changeBannerStatus = (bannerId, status) => async (dispatch) => {
   try {
      const response = await axios.put(`${import.meta.env.VITE_APP_BACKENDURI}/api/banners/status/${bannerId}`, { status });
      dispatch(updateBannerSuccess(response.data.banner));
      dispatch(showNotification('Banner status updated successfully!'));
      return Promise.resolve();
   } catch (error) {
      let errMessage = error.response ? error.response.data.error : 'Something went wrong';
      dispatch(updateBannerFailure(errMessage));
      dispatch(showNotification(errMessage));
      return Promise.reject(errMessage);
   }
};


