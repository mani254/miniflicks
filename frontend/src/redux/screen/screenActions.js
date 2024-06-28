import * as types from './screenActionTypes.js';
import axios from 'axios';
import { showNotification } from '../notification/notificationActions.js';

export const addScreen = (screenData) => {
   return async (dispatch) => {
      dispatch({ type: types.ADD_SCREEN });

      const formData = new FormData();
      formData.append('name', screenData.name);
      formData.append('smallDescription', screenData.smallDescription);
      formData.append('longDescription', screenData.longDescription);
      formData.append('allowed', screenData.allowed);
      formData.append('price', screenData.price);
      formData.append('capacity', screenData.capacity);
      formData.append('extraPrice', screenData.extraPrice);
      screenData.images.forEach((file, index) => {
         formData.append(`images[${index}]`, file);
      });
      screenData.slots.forEach((slot, index) => {
         formData.append(`slots[${index}][startTime]`, slot.startTime);
         formData.append(`slots[${index}][endTime]`, slot.endTime);
      });
      screenData.reservedSlots.forEach((reservedSlot, index) => {
         formData.append(`reservedSlots[${index}][date]`, reservedSlot.date);
         formData.append(`reservedSlots[${index}][slot][startTime]`, reservedSlot.slot.startTime);
         formData.append(`reservedSlots[${index}][slot][endTime]`, reservedSlot.slot.endTime);
         formData.append(`reservedSlots[${index}][price]`, reservedSlot.price);
      });
      formData.append('location', screenData.location);

      try {
         const response = await axios.post(`${process.env.REACT_APP_BACKENDURI}/api/screens`, formData, {
            headers: {
               'Content-Type': 'multipart/form-data'
            }
         });
         dispatch(addScreenSuccess(response.data.screen));
         dispatch(showNotification('Screen Added Successfully'));
         return Promise.resolve(response.data.screen);
      } catch (err) {
         dispatch(addScreenFailure(err.response ? err.response.data.error : "Network Error"));
         dispatch(showNotification(err.response ? err.response.data.error : "Network Error"));
         return Promise.reject(err.response ? err.response.data.error : "Network Error");
      }
   };
};

export const addScreenSuccess = (screen) => ({
   type: types.ADD_SCREEN_SUCCESS,
   payload: screen
});

export const addScreenFailure = (error) => ({
   type: types.ADD_SCREEN_FAILURE,
   payload: error
});

export const getScreens = () => {
   return async (dispatch) => {
      dispatch({ type: types.GET_SCREENS });
      try {
         const response = await axios.get(`${process.env.REACT_APP_BACKENDURI}/api/screens`);
         dispatch(getScreensSuccess(response.data));
         return Promise.resolve(response.data);
      } catch (err) {
         dispatch(getScreensFailure(err.message));
         return Promise.reject(err);
      }
   };
};

export const getScreensSuccess = (screens) => ({
   type: types.GET_SCREENS_SUCCESS,
   payload: screens
});

export const getScreensFailure = (error) => ({
   type: types.GET_SCREENS_FAILURE,
   payload: error
});

export const updateScreen = (screenData) => {
   return async (dispatch) => {
      dispatch({ type: types.UPDATE_SCREEN });

      const formData = new FormData();
      formData.append('name', screenData.name);
      formData.append('smallDescription', screenData.smallDescription);
      formData.append('longDescription', screenData.longDescription);
      formData.append('allowed', screenData.allowed);
      formData.append('price', screenData.price);
      formData.append('capacity', screenData.capacity);
      formData.append('extraPrice', screenData.extraPrice);
      screenData.images.forEach((file, index) => {
         formData.append(`images[${index}]`, file);
      });
      screenData.slots.forEach((slot, index) => {
         formData.append(`slots[${index}][startTime]`, slot.startTime);
         formData.append(`slots[${index}][endTime]`, slot.endTime);
      });
      screenData.reservedSlots.forEach((reservedSlot, index) => {
         formData.append(`reservedSlots[${index}][date]`, reservedSlot.date);
         formData.append(`reservedSlots[${index}][slot][startTime]`, reservedSlot.slot.startTime);
         formData.append(`reservedSlots[${index}][slot][endTime]`, reservedSlot.slot.endTime);
         formData.append(`reservedSlots[${index}][price]`, reservedSlot.price);
      });
      formData.append('location', screenData.location);

      try {
         const response = await axios.put(`${process.env.REACT_APP_BACKENDURI}/api/screens/${screenData._id}`, formData, {
            headers: {
               'Content-Type': 'multipart/form-data'
            }
         });
         dispatch(updateScreenSuccess(response.data.screen));
         dispatch(showNotification('Screen Updated Successfully'));
         return Promise.resolve(response.data.screen);
      } catch (err) {
         dispatch(updateScreenFailure(err.response ? err.response.data.error : "Network Error"));
         dispatch(showNotification(err.response ? err.response.data.error : "Network Error"));
         return Promise.reject(err.response ? err.response.data.error : "Network Error");
      }
   };
};

export const updateScreenSuccess = (screen) => ({
   type: types.UPDATE_SCREEN_SUCCESS,
   payload: screen
});

export const updateScreenFailure = (error) => ({
   type: types.UPDATE_SCREEN_FAILURE,
   payload: error
});

export const deleteScreen = (screenId) => {
   return async (dispatch) => {
      dispatch({ type: types.DELETE_SCREEN });
      try {
         const response = await axios.delete(`${process.env.REACT_APP_BACKENDURI}/api/screens/${screenId}`);
         dispatch(deleteScreenSuccess(screenId));
         dispatch(showNotification('Screen Deleted Successfully'));
         return Promise.resolve(response);
      } catch (err) {
         dispatch(deleteScreenFailure(err.response ? err.response.data.error : "Network Error"));
         dispatch(showNotification(err.response ? err.response.data.error : err.message));
         return Promise.reject(err);
      }
   };
};

export const deleteScreenSuccess = (screenId) => ({
   type: types.DELETE_SCREEN_SUCCESS,
   payload: screenId
});

export const deleteScreenFailure = (error) => ({
   type: types.DELETE_SCREEN_FAILURE,
   payload: error
});

export const updateScreenStatus = (screenData) => {
   return async (dispatch) => {
      dispatch({ type: types.UPDATE_SCREEN_STATUS });
      try {
         const response = await axios.put(`${process.env.REACT_APP_BACKENDURI}/api/screens/${screenData._id}/status`, { status: screenData.status });
         dispatch(updateScreenStatusSuccess(response.data.screen));
         dispatch(showNotification('Screen Status Updated Successfully'));
         return Promise.resolve(response.data);
      } catch (err) {
         dispatch(updateScreenStatusFailure(err.response ? err.response.data.error : "Network Error"));
         dispatch(showNotification(err.response ? err.response.data.error : "Network Error"));
         return Promise.reject(err.response ? err.response.data.error : "Network Error");
      }
   };
};

export const updateScreenStatusSuccess = (screen) => ({
   type: types.UPDATE_SCREEN_STATUS_SUCCESS,
   payload: screen
});

export const updateScreenStatusFailure = (error) => ({
   type: types.UPDATE_SCREEN_STATUS_FAILURE,
   payload: error
});
