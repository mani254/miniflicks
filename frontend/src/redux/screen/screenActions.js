import screenTypes from './screenActionTypes';
import axios from 'axios';
import { showNotification } from '../notification/notificationActions';

// Add Screen Actions
const addScreenRequest = () => ({
   type: screenTypes.ADD_SCREEN_REQUEST,
});

const addScreenSuccess = (screen) => ({
   type: screenTypes.ADD_SCREEN_SUCCESS,
   payload: screen,
});

const addScreenFailure = (error) => ({
   type: screenTypes.ADD_SCREEN_FAILURE,
   payload: error,
});

export const addScreen = (screenData) => async (dispatch) => {
   dispatch(addScreenRequest());
   try {
      const response = await axios.post(`${import.meta.env.VITE_APP_BACKENDURI}/api/screens`, screenData);
      dispatch(addScreenSuccess(response.data.screen));
      dispatch(showNotification('Screen added successfully!'));
      return Promise.resolve();
   } catch (error) {
      let errMessage = error.response ? error.response.data.error : 'Something went wrong';
      dispatch(addScreenFailure(errMessage));
      dispatch(showNotification(errMessage));
      return Promise.reject(errMessage);
   }
};

// Get Screens Actions
const getScreensRequest = () => ({
   type: screenTypes.GET_SCREENS_REQUEST,
});

const getScreensSuccess = (screens) => ({
   type: screenTypes.GET_SCREENS_SUCCESS,
   payload: screens,
});

const getScreensFailure = (error) => ({
   type: screenTypes.GET_SCREENS_FAILURE,
   payload: error,
});

export const getScreens = () => async (dispatch) => {
   dispatch(getScreensRequest());
   try {
      const response = await axios.get(`${import.meta.env.VITE_APP_BACKENDURI}/api/screens`);
      dispatch(getScreensSuccess(response.data.screens));
      return Promise.resolve();
   } catch (error) {
      let errMessage = error.response ? error.response.data.error : 'Something went wrong';
      dispatch(getScreensFailure(errMessage));
      dispatch(showNotification(errMessage));
      return Promise.reject(errMessage);
   }
};

// Update Screen Actions
const updateScreenRequest = () => ({
   type: screenTypes.UPDATE_SCREEN_REQUEST,
});

const updateScreenSuccess = (screen) => ({
   type: screenTypes.UPDATE_SCREEN_SUCCESS,
   payload: screen,
});

const updateScreenFailure = (error) => ({
   type: screenTypes.UPDATE_SCREEN_FAILURE,
   payload: error,
});

export const updateScreen = (screenId, screenData) => async (dispatch) => {
   dispatch(updateScreenRequest());
   try {
      const response = await axios.put(`${import.meta.env.VITE_APP_BACKENDURI}/api/screens/${screenId}`, screenData);
      dispatch(updateScreenSuccess(response.data.screen));
      dispatch(showNotification('Screen updated successfully!'));
      return Promise.resolve();
   } catch (error) {
      let errMessage = error.response ? error.response.data.error : 'Something went wrong';
      dispatch(updateScreenFailure(errMessage));
      dispatch(showNotification(errMessage));
      return Promise.reject(errMessage);
   }
};

// Delete Screen Actions
const deleteScreenRequest = () => ({
   type: screenTypes.DELETE_SCREEN_REQUEST,
});

const deleteScreenSuccess = (screenId) => ({
   type: screenTypes.DELETE_SCREEN_SUCCESS,
   payload: screenId,
});

const deleteScreenFailure = (error) => ({
   type: screenTypes.DELETE_SCREEN_FAILURE,
   payload: error,
});

export const deleteScreen = (screenId) => async (dispatch) => {
   dispatch(deleteScreenRequest());
   try {
      await axios.delete(`${import.meta.env.VITE_APP_BACKENDURI}/api/screens/${screenId}`);
      dispatch(deleteScreenSuccess(screenId));
      dispatch(showNotification('Screen deleted successfully!'));
      return Promise.resolve(screenId);
   } catch (error) {
      let errMessage = error.response ? error.response.data.error : 'Something went wrong';
      dispatch(deleteScreenFailure(errMessage));
      dispatch(showNotification(errMessage));
      return Promise.reject(errMessage);
   }
};
