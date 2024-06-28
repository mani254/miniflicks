import * as types from './bannerActionsTypes.js';
import axios from 'axios';
import { showNotification } from '../notification/notificationActions.js';

export const addBanner = ({ position, image, heading, content, redirection, status }) => {
   return async (dispatch) => {
      dispatch({ type: types.ADD_BANNER });

      const formData = new FormData();
      formData.append('position', position);
      formData.append('image', image);
      formData.append('heading', heading);
      formData.append('content', content);
      formData.append('redirection', redirection);
      formData.append('status', status)

      try {
         const response = await axios.post(`${process.env.REACT_APP_BACKENDURI}/api/banners`, formData, {
            headers: {
               'Content-Type': 'multipart/form-data'
            }
         });
         dispatch(addBannerSuccess(response.data.banner));
         dispatch(showNotification('Banner Added Successfully'));
         return Promise.resolve(response.data.banner);
      } catch (err) {
         dispatch(addBannerFailure(err.response ? err.response.data.error : "Network Error"));
         dispatch(showNotification(err.response ? err.response.data.error : "Network Error"));
         return Promise.reject(err.response ? err.response.data.error : "Network Error");
      }
   };
};

export const addBannerSuccess = (banner) => ({
   type: types.ADD_BANNER_SUCCESS,
   payload: banner
});

export const addBannerFailure = (error) => ({
   type: types.ADD_BANNER_FAILURE,
   payload: error
});

export const getBanners = () => {
   return async (dispatch) => {
      dispatch({ type: types.GET_BANNERS });
      try {
         const response = await axios.get(`${process.env.REACT_APP_BACKENDURI}/api/banners`);
         dispatch(getBannersSuccess(response.data));
         return Promise.resolve(response.data);
      } catch (err) {
         dispatch(getBannersFailure(err.message));
         return Promise.reject(err);
      }
   };
};

export const getBannersSuccess = (banners) => ({
   type: types.GET_BANNERS_SUCCESS,
   payload: banners
});

export const getBannersFailure = (error) => ({
   type: types.GET_BANNERS_FAILURE,
   payload: error
});

export const updateBanner = ({ _id, position, image, heading, content, redirection }) => {
   return async (dispatch) => {
      dispatch({ type: types.UPDATE_BANNER });

      const formData = new FormData();
      formData.append('position', position);
      formData.append('image', image);
      formData.append('heading', heading);
      formData.append('content', content);
      formData.append('redirection', redirection);

      try {
         const response = await axios.put(`${process.env.REACT_APP_BACKENDURI}/api/banners/${_id}`, formData, {
            headers: {
               'Content-Type': 'multipart/form-data'
            }
         });
         dispatch(updateBannerSuccess(response.data.banner));
         dispatch(showNotification('Banner Updated Successfully'));
         return Promise.resolve(response.data.banner);
      } catch (err) {
         dispatch(updateBannerFailure(err.response ? err.response.data.error : "Network Error"));
         dispatch(showNotification(err.response ? err.response.data.error : "Network Error"));
         return Promise.reject(err.response ? err.response.data.error : "Network Error");
      }
   };
};

export const updateBannerSuccess = (banner) => ({
   type: types.UPDATE_BANNER_SUCCESS,
   payload: banner
});

export const updateBannerFailure = (error) => ({
   type: types.UPDATE_BANNER_FAILURE,
   payload: error
});

export const deleteBanner = (bannerId) => {
   return async (dispatch) => {
      dispatch({ type: types.DELETE_BANNER });
      try {
         const response = await axios.delete(`${process.env.REACT_APP_BACKENDURI}/api/banners/${bannerId}`);
         dispatch(deleteBannerSuccess(bannerId));
         dispatch(showNotification('Banner Deleted Successfully'));
         return Promise.resolve(response);
      } catch (err) {
         dispatch(deleteBannerFailure(err.response ? err.response.data.error : "Network Error"));
         dispatch(showNotification(err.response ? err.response.data.error : err.message));
         return Promise.reject(err);
      }
   };
};

export const deleteBannerSuccess = (bannerId) => ({
   type: types.DELETE_BANNER_SUCCESS,
   payload: bannerId
});

export const deleteBannerFailure = (error) => ({
   type: types.DELETE_BANNER_FAILURE,
   payload: error
});

export const updateBannerStatus = ({ _id, status }) => {
   return async (dispatch) => {
      dispatch({ type: types.UPDATE_BANNER_STATUS });
      try {
         const response = await axios.put(`${process.env.REACT_APP_BACKENDURI}/api/banners/${_id}/status`, { status });
         dispatch(updateBannerStatusSuccess(response.data));
         dispatch(showNotification('Banner Status Updated Successfully'));
         return Promise.resolve(response.data);
      } catch (err) {
         dispatch(updateBannerStatusFailure(err.response ? err.response.data.error : "Network Error"));
         dispatch(showNotification(err.response ? err.response.data.error : "Network Error"));
         return Promise.reject(err.response ? err.response.data.error : "Network Error");
      }
   };
};

export const updateBannerStatusSuccess = (banner) => ({
   type: types.UPDATE_BANNER_STATUS_SUCCESS,
   payload: banner
});

export const updateBannerStatusFailure = (error) => ({
   type: types.UPDATE_BANNER_STATUS_FAILURE,
   payload: error
});
