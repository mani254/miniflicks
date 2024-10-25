import locationTypes from './locationActionTypes';
import axios from 'axios';
import { showNotification } from '../notification/notificationActions';

// Add Location Actions
const addLocationRequest = () => ({
   type: locationTypes.ADD_LOCATION_REQUEST,
});

const addLocationSuccess = (location) => ({
   type: locationTypes.ADD_LOCATION_SUCCESS,
   payload: location,
});

const addLocationFailure = (error) => ({
   type: locationTypes.ADD_LOCATION_FAILURE,
   payload: error,
});

export const addLocation = (locationData) => async (dispatch) => {
   dispatch(addLocationRequest());
   try {
      const response = await axios.post(`${import.meta.env.VITE_APP_BACKENDURI}/api/locations`, locationData);
      dispatch(addLocationSuccess(response.data.location));
      dispatch(showNotification('Location added successfully!'));
      return Promise.resolve();
   } catch (error) {
      let errMessage = error.response ? error.response.data.error : 'Something went wrong';
      dispatch(addLocationFailure(errMessage));
      dispatch(showNotification(errMessage));
      return Promise.reject(errMessage);
   }
};

// Get Locations Actions
const getLocationsRequest = () => ({
   type: locationTypes.GET_LOCATIONS_REQUEST,
});

const getLocationsSuccess = (locations) => ({
   type: locationTypes.GET_LOCATIONS_SUCCESS,
   payload: locations,
});

const getLocationsFailure = (error) => ({
   type: locationTypes.GET_LOCATIONS_FAILURE,
   payload: error,
});

export const getLocations = (city) => async (dispatch) => {
   dispatch(getLocationsRequest());
   try {
      const response = await axios.get(`${import.meta.env.VITE_APP_BACKENDURI}/api/locations`, {
         params: { city },
      });
      dispatch(getLocationsSuccess(response.data.locations));
      return Promise.resolve();
   } catch (error) {
      let errMessage = error.response ? error.response.data.error : 'Something went wrong';
      dispatch(getLocationsFailure(errMessage));
      dispatch(showNotification(errMessage));
      return Promise.reject(errMessage);
   }
};

// Update Location Actions
const updateLocationRequest = () => ({
   type: locationTypes.UPDATE_LOCATION_REQUEST,
});

const updateLocationSuccess = (location) => ({
   type: locationTypes.UPDATE_LOCATION_SUCCESS,
   payload: location,
});

const updateLocationFailure = (error) => ({
   type: locationTypes.UPDATE_LOCATION_FAILURE,
   payload: error,
});

export const updateLocation = (locationId, locationData) => async (dispatch) => {
   dispatch(updateLocationRequest());
   try {
      const response = await axios.put(`${import.meta.env.VITE_APP_BACKENDURI}/api/locations/${locationId}`, locationData);
      dispatch(updateLocationSuccess(response.data.location));
      dispatch(showNotification('Location updated successfully!'));
      return Promise.resolve();
   } catch (error) {
      let errMessage = error.response ? error.response.data.error : 'Something went wrong';
      dispatch(updateLocationFailure(errMessage));
      dispatch(showNotification(errMessage));
      return Promise.reject(errMessage);
   }
};

// Delete Location Actions
const deleteLocationRequest = () => ({
   type: locationTypes.DELETE_LOCATION_REQUEST,
});

const deleteLocationSuccess = (locationId) => ({
   type: locationTypes.DELETE_LOCATION_SUCCESS,
   payload: locationId,
});

const deleteLocationFailure = (error) => ({
   type: locationTypes.DELETE_LOCATION_FAILURE,
   payload: error,
});

export const deleteLocation = (locationId) => async (dispatch) => {
   dispatch(deleteLocationRequest());
   try {
      await axios.delete(`${import.meta.env.VITE_APP_BACKENDURI}/api/locations/${locationId}`);
      dispatch(deleteLocationSuccess(locationId));
      dispatch(showNotification('Location deleted successfully!'));
      return Promise.resolve(locationId);
   } catch (error) {
      let errMessage = error.response ? error.response.data.error : 'Something went wrong';
      dispatch(deleteLocationFailure(errMessage));
      dispatch(showNotification(errMessage));
      return Promise.reject(errMessage);
   }
};

export const changeLocationStatus = (locationId, status) => async (dispatch) => {
   try {
      const response = await axios.put(`${import.meta.env.VITE_APP_BACKENDURI}/api/locations/status/${locationId}`, { status });
      dispatch(updateLocationSuccess(response.data.location));
      return Promise.resolve();
   } catch (error) {
      console.log(error.message)
      let errMessage = error.response ? error.response.data.error : 'Something went wrong';
      dispatch(updateLocationFailure(errMessage));
      dispatch(showNotification(errMessage));
      return Promise.reject(errMessage);
   }
};

const getLocationRequest = () => ({
   type: locationTypes.GET_LOCATION_REQUEST,
});

const getLocationSuccess = (location) => ({
   type: locationTypes.GET_LOCATION_SUCCESS,
   payload: location,
});

const getLocationFailure = (error) => ({
   type: locationTypes.GET_LOCATION_FAILURE,
   payload: error,
});

export const getLocation = (id) => async (dispatch) => {
   dispatch(getLocationRequest());
   try {
      const response = await axios.get(`${import.meta.env.VITE_APP_BACKENDURI}/api/locations/${id}`,);
      dispatch(getLocationSuccess(response.data.location));
      return Promise.resolve();
   } catch (error) {
      let errMessage = error.response ? error.response.data.error : 'Something went wrong';
      dispatch(getLocationFailure(errMessage));
      dispatch(showNotification(errMessage));
      return Promise.reject(errMessage);
   }
};