import couponTypes from './couponActionTypes';
import axios from 'axios';
import { showNotification } from '../notification/notificationActions';

// Add Coupon Actions
const addCouponRequest = () => ({
   type: couponTypes.ADD_COUPON_REQUEST,
});

const addCouponSuccess = (coupon) => ({
   type: couponTypes.ADD_COUPON_SUCCESS,
   payload: coupon,
});

const addCouponFailure = (error) => ({
   type: couponTypes.ADD_COUPON_FAILURE,
   payload: error,
});

export const addCoupon = (couponData) => async (dispatch) => {
   dispatch(addCouponRequest());
   try {
      const response = await axios.post(`${import.meta.env.VITE_APP_BACKENDURI}/api/coupons`, couponData);
      dispatch(addCouponSuccess(response.data.coupon));
      dispatch(showNotification('Coupon added successfully!'));
      return Promise.resolve();
   } catch (error) {
      let errMessage = error.response ? error.response.data.error : 'Something went wrong';
      dispatch(addCouponFailure(errMessage));
      dispatch(showNotification(errMessage));
      return Promise.reject(errMessage);
   }
};

// Get Coupons Actions
const getCouponsRequest = () => ({
   type: couponTypes.GET_COUPONS_REQUEST,
});

const getCouponsSuccess = (coupons) => ({
   type: couponTypes.GET_COUPONS_SUCCESS,
   payload: coupons,
});

const getCouponsFailure = (error) => ({
   type: couponTypes.GET_COUPONS_FAILURE,
   payload: error,
});

export const getCoupons = () => async (dispatch) => {
   dispatch(getCouponsRequest());
   try {
      const response = await axios.get(`${import.meta.env.VITE_APP_BACKENDURI}/api/coupons`);
      dispatch(getCouponsSuccess(response.data.coupons));
      return Promise.resolve();
   } catch (error) {
      let errMessage = error.response ? error.response.data.error : 'Something went wrong';
      dispatch(getCouponsFailure(errMessage));
      dispatch(showNotification(errMessage));
      return Promise.reject(errMessage);
   }
};

// Update Coupon Actions
const updateCouponRequest = () => ({
   type: couponTypes.UPDATE_COUPON_REQUEST,
});

const updateCouponSuccess = (coupon) => ({
   type: couponTypes.UPDATE_COUPON_SUCCESS,
   payload: coupon,
});

const updateCouponFailure = (error) => ({
   type: couponTypes.UPDATE_COUPON_FAILURE,
   payload: error,
});

export const updateCoupon = (couponId, couponData) => async (dispatch) => {
   dispatch(updateCouponRequest());
   try {
      const response = await axios.put(`${import.meta.env.VITE_APP_BACKENDURI}/api/coupons/${couponId}`, couponData);
      dispatch(updateCouponSuccess(response.data.coupon));
      dispatch(showNotification('Coupon updated successfully!'));
      return Promise.resolve();
   } catch (error) {
      let errMessage = error.response ? error.response.data.error : 'Something went wrong';
      dispatch(updateCouponFailure(errMessage));
      dispatch(showNotification(errMessage));
      return Promise.reject(errMessage);
   }
};
export const updateCouponStatus = (couponId, couponData) => async (dispatch) => {
   try {
      const response = await axios.put(`${import.meta.env.VITE_APP_BACKENDURI}/api/coupons/${couponId}`, couponData);
      dispatch(updateCouponSuccess(response.data.coupon));
      dispatch(showNotification('Status updated'));
      return Promise.resolve();
   } catch (error) {
      let errMessage = error.response ? error.response.data.error : 'Something went wrong';
      dispatch(updateCouponFailure(errMessage));
      dispatch(showNotification(errMessage));
      return Promise.reject(errMessage);
   }
};

// Delete Coupon Actions
const deleteCouponRequest = () => ({
   type: couponTypes.DELETE_COUPON_REQUEST,
});

const deleteCouponSuccess = (couponId) => ({
   type: couponTypes.DELETE_COUPON_SUCCESS,
   payload: couponId,
});

const deleteCouponFailure = (error) => ({
   type: couponTypes.DELETE_COUPON_FAILURE,
   payload: error,
});

export const deleteCoupon = (couponId) => async (dispatch) => {
   dispatch(deleteCouponRequest());
   try {
      await axios.delete(`${import.meta.env.VITE_APP_BACKENDURI}/api/coupons/${couponId}`);
      dispatch(deleteCouponSuccess(couponId));
      dispatch(showNotification('Coupon deleted successfully!'));
      return Promise.resolve(couponId);
   } catch (error) {
      let errMessage = error.response ? error.response.data.error : 'Something went wrong';
      dispatch(deleteCouponFailure(errMessage));
      dispatch(showNotification(errMessage));
      return Promise.reject(errMessage);
   }
};

// Change Coupon Status Actions
export const changeCouponStatus = (couponId, status) => async (dispatch) => {
   try {
      const response = await axios.put(`${import.meta.env.VITE_APP_BACKENDURI}/api/coupons/status/${couponId}`, { status });
      dispatch(updateCouponSuccess(response.data.coupon));
      return Promise.resolve();
   } catch (error) {
      let errMessage = error.response ? error.response.data.error : 'Something went wrong';
      dispatch(updateCouponFailure(errMessage));
      dispatch(showNotification(errMessage));
      return Promise.reject(errMessage);
   }
};
