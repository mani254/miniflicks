import giftTypes from './giftActionTypes'; // Adjust this path as necessary
import axios from 'axios';
import { showNotification } from '../notification/notificationActions';

// Add Gift Actions
const addGiftRequest = () => ({
   type: giftTypes.ADD_GIFT_REQUEST,
});

const addGiftSuccess = (gift) => ({
   type: giftTypes.ADD_GIFT_SUCCESS,
   payload: gift,
});

const addGiftFailure = (error) => ({
   type: giftTypes.ADD_GIFT_FAILURE,
   payload: error,
});

export const addGift = (giftData) => async (dispatch) => {
   dispatch(addGiftRequest());
   try {
      const response = await axios.post(`${import.meta.env.VITE_APP_BACKENDURI}/api/gifts`, giftData);
      dispatch(addGiftSuccess(response.data.gift));
      dispatch(showNotification('Gift added successfully!'));
      return Promise.resolve();
   } catch (error) {
      let errMessage = error.response ? error.response.data.error : 'Something went wrong';
      dispatch(addGiftFailure(errMessage));
      dispatch(showNotification(errMessage));
      return Promise.reject(errMessage);
   }
};

// Get Gifts Actions
const getGiftsRequest = () => ({
   type: giftTypes.GET_GIFTS_REQUEST,
});

const getGiftsSuccess = (gifts) => ({
   type: giftTypes.GET_GIFTS_SUCCESS,
   payload: gifts,
});

const getGiftsFailure = (error) => ({
   type: giftTypes.GET_GIFTS_FAILURE,
   payload: error,
});

export const getGifts = (params) => async (dispatch) => {
   dispatch(getGiftsRequest());
   try {
      const response = await axios.get(`${import.meta.env.VITE_APP_BACKENDURI}/api/gifts`, { params });
      dispatch(getGiftsSuccess(response.data.gifts));
      return Promise.resolve({ totalDocuments: response.data.totalDocuments });
   } catch (error) {
      let errMessage = error.response ? error.response.data.error : 'Something went wrong';
      dispatch(getGiftsFailure(errMessage));
      dispatch(showNotification(errMessage));
      return Promise.reject(errMessage);
   }
};

export const getAllGifts = () => async (dispatch) => {
   dispatch(getGiftsRequest());
   try {
      const response = await axios.get(`${import.meta.env.VITE_APP_BACKENDURI}/api/gifts/getAllGifts`);
      dispatch(getGiftsSuccess(response.data.gifts));
      return Promise.resolve({ totalDocuments: response.data.totalDocuments });
   } catch (error) {
      let errMessage = error.response ? error.response.data.error : 'Something went wrong';
      dispatch(getGiftsFailure(errMessage));
      dispatch(showNotification(errMessage));
      return Promise.reject(errMessage);
   }
};

// Update Gift Actions
const updateGiftRequest = () => ({
   type: giftTypes.UPDATE_GIFT_REQUEST,
});

const updateGiftSuccess = (gift) => ({
   type: giftTypes.UPDATE_GIFT_SUCCESS,
   payload: gift,
});

const updateGiftFailure = (error) => ({
   type: giftTypes.UPDATE_GIFT_FAILURE,
   payload: error,
});

export const updateGift = (giftId, giftData) => async (dispatch) => {
   dispatch(updateGiftRequest());
   try {
      const response = await axios.put(`${import.meta.env.VITE_APP_BACKENDURI}/api/gifts/${giftId}`, giftData);
      dispatch(updateGiftSuccess(response.data.gift));
      dispatch(showNotification('Gift updated successfully!'));
      return Promise.resolve();
   } catch (error) {
      let errMessage = error.response ? error.response.data.error : 'Something went wrong';
      dispatch(updateGiftFailure(errMessage));
      dispatch(showNotification(errMessage));
      return Promise.reject(errMessage);
   }
};

// Delete Gift Actions
const deleteGiftRequest = () => ({
   type: giftTypes.DELETE_GIFT_REQUEST,
});

const deleteGiftSuccess = (giftId) => ({
   type: giftTypes.DELETE_GIFT_SUCCESS,
   payload: giftId,
});

const deleteGiftFailure = (error) => ({
   type: giftTypes.DELETE_GIFT_FAILURE,
   payload: error,
});

export const deleteGift = (giftId) => async (dispatch) => {
   dispatch(deleteGiftRequest());
   try {
      await axios.delete(`${import.meta.env.VITE_APP_BACKENDURI}/api/gifts/${giftId}`);
      dispatch(deleteGiftSuccess(giftId));
      dispatch(showNotification('Gift deleted successfully!'));
      return Promise.resolve(giftId);
   } catch (error) {
      let errMessage = error.response ? error.response.data.error : 'Something went wrong';
      dispatch(deleteGiftFailure(errMessage));
      dispatch(showNotification(errMessage));
      return Promise.reject(errMessage);
   }
};


