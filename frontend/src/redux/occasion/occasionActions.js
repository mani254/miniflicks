import occasionTypes from './occasionActionTypes'; // Adjust this path as necessary
import axios from 'axios';
import { showNotification } from '../notification/notificationActions';

// Add Occasion Actions
const addOccasionRequest = () => ({
   type: occasionTypes.ADD_OCCASION_REQUEST,
});

const addOccasionSuccess = (occasion) => ({
   type: occasionTypes.ADD_OCCASION_SUCCESS,
   payload: occasion,
});

const addOccasionFailure = (error) => ({
   type: occasionTypes.ADD_OCCASION_FAILURE,
   payload: error,
});

export const addOccasion = (occasionData) => async (dispatch) => {
   dispatch(addOccasionRequest());
   try {
      const response = await axios.post(`${import.meta.env.VITE_APP_BACKENDURI}/api/occasions`, occasionData);
      dispatch(addOccasionSuccess(response.data.occasion));
      dispatch(showNotification('Occasion added successfully!'));
      return Promise.resolve();
   } catch (error) {
      let errMessage = error.response ? error.response.data.error : 'Something went wrong';
      dispatch(addOccasionFailure(errMessage));
      dispatch(showNotification(errMessage));
      return Promise.reject(errMessage);
   }
};

// Get Occasions Actions
const getOccasionsRequest = () => ({
   type: occasionTypes.GET_OCCASIONS_REQUEST,
});

const getOccasionsSuccess = (occasions) => ({
   type: occasionTypes.GET_OCCASIONS_SUCCESS,
   payload: occasions,
});

const getOccasionsFailure = (error) => ({
   type: occasionTypes.GET_OCCASIONS_FAILURE,
   payload: error,
});

export const getOccasions = (params) => async (dispatch) => {
   dispatch(getOccasionsRequest());
   try {
      const response = await axios.get(`${import.meta.env.VITE_APP_BACKENDURI}/api/occasions`, { params });
      dispatch(getOccasionsSuccess(response.data.occasions));
      return Promise.resolve({ totalDocuments: response.data.totalDocuments });
   } catch (error) {
      let errMessage = error.response ? error.response.data.error : 'Something went wrong';
      dispatch(getOccasionsFailure(errMessage));
      dispatch(showNotification(errMessage));
      return Promise.reject(errMessage);
   }
};

export const getAllOccasions = () => async (dispatch) => {
   dispatch(getOccasionsRequest());
   try {
      const response = await axios.get(`${import.meta.env.VITE_APP_BACKENDURI}/api/occasions/getAllOccasions`);
      dispatch(getOccasionsSuccess(response.data.occasions));
      return Promise.resolve();
   } catch (error) {
      let errMessage = error.response ? error.response.data.error : 'Something went wrong';
      dispatch(getOccasionsFailure(errMessage));
      dispatch(showNotification(errMessage));
      return Promise.reject(errMessage);
   }
};

// Update Occasion Actions
const updateOccasionRequest = () => ({
   type: occasionTypes.UPDATE_OCCASION_REQUEST,
});

const updateOccasionSuccess = (occasion) => ({
   type: occasionTypes.UPDATE_OCCASION_SUCCESS,
   payload: occasion,
});

const updateOccasionFailure = (error) => ({
   type: occasionTypes.UPDATE_OCCASION_FAILURE,
   payload: error,
});

export const updateOccasion = (occasionId, occasionData) => async (dispatch) => {
   dispatch(updateOccasionRequest());
   try {
      const response = await axios.put(`${import.meta.env.VITE_APP_BACKENDURI}/api/occasions/${occasionId}`, occasionData);
      dispatch(updateOccasionSuccess(response.data.occasion));
      dispatch(showNotification('Occasion updated successfully!'));
      return Promise.resolve();
   } catch (error) {
      let errMessage = error.response ? error.response.data.error : 'Something went wrong';
      dispatch(updateOccasionFailure(errMessage));
      dispatch(showNotification(errMessage));
      return Promise.reject(errMessage);
   }
};

// Delete Occasion Actions
const deleteOccasionRequest = () => ({
   type: occasionTypes.DELETE_OCCASION_REQUEST,
});

const deleteOccasionSuccess = (occasionId) => ({
   type: occasionTypes.DELETE_OCCASION_SUCCESS,
   payload: occasionId,
});

const deleteOccasionFailure = (error) => ({
   type: occasionTypes.DELETE_OCCASION_FAILURE,
   payload: error,
});

export const deleteOccasion = (occasionId) => async (dispatch) => {
   dispatch(deleteOccasionRequest());
   try {
      await axios.delete(`${import.meta.env.VITE_APP_BACKENDURI}/api/occasions/${occasionId}`);
      dispatch(deleteOccasionSuccess(occasionId));
      dispatch(showNotification('Occasion deleted successfully!'));
      return Promise.resolve(occasionId);
   } catch (error) {
      let errMessage = error.response ? error.response.data.error : 'Something went wrong';
      dispatch(deleteOccasionFailure(errMessage));
      dispatch(showNotification(errMessage));
      return Promise.reject(errMessage);
   }
};
