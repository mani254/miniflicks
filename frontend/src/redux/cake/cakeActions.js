import cakeTypes from './cakeActionTypes'; // Adjust this path as necessary
import axios from 'axios';
import { showNotification } from '../notification/notificationActions';

// Add Cake Actions
const addCakeRequest = () => ({
   type: cakeTypes.ADD_CAKE_REQUEST,
});

const addCakeSuccess = (cake) => ({
   type: cakeTypes.ADD_CAKE_SUCCESS,
   payload: cake,
});

const addCakeFailure = (error) => ({
   type: cakeTypes.ADD_CAKE_FAILURE,
   payload: error,
});

export const addCake = (cakeData) => async (dispatch) => {
   dispatch(addCakeRequest());
   try {
      const response = await axios.post(`${import.meta.env.VITE_APP_BACKENDURI}/api/cakes`, cakeData);
      dispatch(addCakeSuccess(response.data.cake));
      dispatch(showNotification('Cake added successfully!'));
      return Promise.resolve();
   } catch (error) {
      let errMessage = error.response ? error.response.data.error : 'Something went wrong';
      dispatch(addCakeFailure(errMessage));
      dispatch(showNotification(errMessage));
      return Promise.reject(errMessage);
   }
};

// Get Cakes Actions
const getCakesRequest = () => ({
   type: cakeTypes.GET_CAKES_REQUEST,
});

const getCakesSuccess = (cakes) => ({
   type: cakeTypes.GET_CAKES_SUCCESS,
   payload: cakes,
});

const getCakesFailure = (error) => ({
   type: cakeTypes.GET_CAKES_FAILURE,
   payload: error,
});

export const getCakes = (params) => async (dispatch) => {
   dispatch(getCakesRequest());
   try {
      const response = await axios.get(`${import.meta.env.VITE_APP_BACKENDURI}/api/cakes`, { params });
      dispatch(getCakesSuccess(response.data.cakes));
      return Promise.resolve({ totalDocuments: response.data.totalDocuments });
   } catch (error) {
      let errMessage = error.response ? error.response.data.error : 'Something went wrong';
      dispatch(getCakesFailure(errMessage));
      dispatch(showNotification(errMessage));
      return Promise.reject(errMessage);
   }
};

export const getAllCakes = () => async (dispatch) => {
   dispatch(getCakesRequest());
   try {
      const response = await axios.get(`${import.meta.env.VITE_APP_BACKENDURI}/api/cakes/getAllCakes`);
      dispatch(getCakesSuccess(response.data.cakes));
      return Promise.resolve();
   } catch (error) {
      let errMessage = error.response ? error.response.data.error : 'Something went wrong';
      dispatch(getCakesFailure(errMessage));
      dispatch(showNotification(errMessage));
      return Promise.reject(errMessage);
   }
};

// Update Cake Actions
const updateCakeRequest = () => ({
   type: cakeTypes.UPDATE_CAKE_REQUEST,
});

const updateCakeSuccess = (cake) => ({
   type: cakeTypes.UPDATE_CAKE_SUCCESS,
   payload: cake,
});

const updateCakeFailure = (error) => ({
   type: cakeTypes.UPDATE_CAKE_FAILURE,
   payload: error,
});

export const updateCake = (cakeId, cakeData) => async (dispatch) => {
   dispatch(updateCakeRequest());
   try {
      const response = await axios.put(`${import.meta.env.VITE_APP_BACKENDURI}/api/cakes/${cakeId}`, cakeData);
      dispatch(updateCakeSuccess(response.data.cake));
      dispatch(showNotification('Cake updated successfully!'));
      return Promise.resolve();
   } catch (error) {
      let errMessage = error.response ? error.response.data.error : 'Something went wrong';
      dispatch(updateCakeFailure(errMessage));
      dispatch(showNotification(errMessage));
      return Promise.reject(errMessage);
   }
};

// Delete Cake Actions
const deleteCakeRequest = () => ({
   type: cakeTypes.DELETE_CAKE_REQUEST,
});

const deleteCakeSuccess = (cakeId) => ({
   type: cakeTypes.DELETE_CAKE_SUCCESS,
   payload: cakeId,
});

const deleteCakeFailure = (error) => ({
   type: cakeTypes.DELETE_CAKE_FAILURE,
   payload: error,
});

export const deleteCake = (cakeId) => async (dispatch) => {
   dispatch(deleteCakeRequest());
   try {
      await axios.delete(`${import.meta.env.VITE_APP_BACKENDURI}/api/cakes/${cakeId}`);
      dispatch(deleteCakeSuccess(cakeId));
      dispatch(showNotification('Cake deleted successfully!'));
      return Promise.resolve(cakeId);
   } catch (error) {
      let errMessage = error.response ? error.response.data.error : 'Something went wrong';
      dispatch(deleteCakeFailure(errMessage));
      dispatch(showNotification(errMessage));
      return Promise.reject(errMessage);
   }
};
