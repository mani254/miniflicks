import cityTypes from './cityActionTypes';
import axios from 'axios';
import { showNotification } from '../notification/notificationActions';

// Add City Actions
const addCityRequest = () => ({
   type: cityTypes.ADD_CITY_REQUEST,
});

const addCitySuccess = (city) => ({
   type: cityTypes.ADD_CITY_SUCCESS,
   payload: city,
});

const addCityFailure = (error) => ({
   type: cityTypes.ADD_CITY_FAILURE,
   payload: error,
});

export const addCity = (cityData) => async (dispatch) => {
   dispatch(addCityRequest());
   try {
      const response = await axios.post(`${import.meta.env.VITE_APP_BACKENDURI}/api/cities`, cityData);
      dispatch(addCitySuccess(response.data.city));
      dispatch(showNotification('City added successfully!'));
      return Promise.resolve();
   } catch (error) {
      let errMessage = error.response ? error.response.data.error : 'Something went wrong';
      dispatch(addCityFailure(errMessage));
      dispatch(showNotification(errMessage));
      return Promise.reject(errMessage);
   }
};



// Get Cities Actions
const getCitiesRequest = () => ({
   type: cityTypes.GET_CITIES_REQUEST,
});

const getCitiesSuccess = (cities) => ({
   type: cityTypes.GET_CITIES_SUCCESS,
   payload: cities,
});

const getCitiesFailure = (error) => ({
   type: cityTypes.GET_CITIES_FAILURE,
   payload: error,
});

export const getCities = () => async (dispatch) => {
   dispatch(getCitiesRequest());
   try {
      const response = await axios.get(`${import.meta.env.VITE_APP_BACKENDURI}/api/cities`);
      dispatch(getCitiesSuccess(response.data));
      return Promise.resolve();
   } catch (error) {
      let errMessage = error.response ? error.response.data.error : 'Something went wrong';
      dispatch(getCitiesFailure(errMessage));
      dispatch(showNotification(errMessage));
      return Promise.reject(errMessage);
   }
};



// Update City Actions
const updateCityRequest = () => ({
   type: cityTypes.UPDATE_CITY_REQUEST,
});

const updateCitySuccess = (city) => ({
   type: cityTypes.UPDATE_CITY_SUCCESS,
   payload: city,
});

const updateCityFailure = (error) => ({
   type: cityTypes.UPDATE_CITY_FAILURE,
   payload: error,
});

export const updateCity = (cityId, cityData) => async (dispatch) => {
   dispatch(updateCityRequest());
   try {
      const response = await axios.put(`${import.meta.env.VITE_APP_BACKENDURI}/api/cities/${cityId}`, cityData);
      dispatch(updateCitySuccess(response.data.city));
      dispatch(showNotification('City updated successfully!'));
      return Promise.resolve();
   } catch (error) {
      let errMessage = error.response ? error.response.data.error : 'Something went wrong';
      dispatch(updateCityFailure(errMessage));
      dispatch(showNotification(errMessage));
      return Promise.reject(errMessage);
   }
};

export const updateCityStatus = (cityId, cityData) => async (dispatch) => {
   try {
      const response = await axios.put(`${import.meta.env.VITE_APP_BACKENDURI}/api/cities/${cityId}`, cityData);
      dispatch(updateCitySuccess(response.data.city));
      return Promise.resolve();
   } catch (error) {
      let errMessage = error.response ? error.response.data.error : 'Something went wrong';
      dispatch(updateCityFailure(errMessage));
      dispatch(showNotification(errMessage));
      return Promise.reject(errMessage);
   }
};


// Delete City Actions
const deleteCityRequest = () => ({
   type: cityTypes.DELETE_CITY_REQUEST,
});

const deleteCitySuccess = (cityId) => ({
   type: cityTypes.DELETE_CITY_SUCCESS,
   payload: cityId,
});

const deleteCityFailure = (error) => ({
   type: cityTypes.DELETE_CITY_FAILURE,
   payload: error,
});

export const deleteCity = (cityId) => async (dispatch) => {
   dispatch(deleteCityRequest());
   try {
      await axios.delete(`${import.meta.env.VITE_APP_BACKENDURI}/api/cities/${cityId}`);
      dispatch(deleteCitySuccess(cityId));
      dispatch(showNotification('City deleted successfully!'));
      return Promise.resolve(cityId);
   } catch (error) {
      let errMessage = error.response ? error.response.data.error : 'Something went wrong';
      dispatch(deleteCityFailure(errMessage));
      dispatch(showNotification(errMessage));
      return Promise.reject(errMessage);
   }
};

