// locationActions.js
import * as types from './locationActionTypes';
import axios from 'axios';
import { showNotification } from '../notification/notificationActions.js';

export const addLocation = ({ name, image, status, address, city, location }) => {
   return async (dispatch) => {
      dispatch({ type: types.ADD_LOCATION });

      const formData = new FormData();
      formData.append('name', name);
      formData.append('status', status);
      formData.append('address', address)
      formData.append('image', image);
      formData.append('city', city)
      formData.append('location', location)
   };
};

export const addLocationSuccess = (location) => ({
   type: types.ADD_LOCATION_SUCCESS,
   payload: location
});

export const addLocationFailure = (error) => ({
   type: types.ADD_LOCATION_FAILURE,
   payload: error
});

export const getLocations = () => {
   return async (dispatch) => {
      dispatch({ type: types.GET_LOCATIONS });
      await axios.get(`${process.env.REACT_APP_BACKENDURI}/api/locations`).then(res => {
         dispatch(getLocationsSuccess(res.data));
         return Promise.resolve(res.data)
      }).catch(err => {
         dispatch(getLocationsFailure(err.message));
         return Promise.reject(err)
      })
   };
};

export const getLocationsSuccess = (locations) => ({
   type: types.GET_LOCATIONS_SUCCESS,
   payload: locations
});

export const getLocationsFailure = (error) => ({
   type: types.GET_LOCATIONS_FAILURE,
   payload: error
});

export const updateLocation = ({ _id, name, image, status, address, city, location }) => {

   return async (dispatch) => {
      dispatch({ type: types.UPDATE_LOCATION });
      const formData = new FormData();
      formData.append('name', name);
      formData.append('status', status);
      formData.append('address', address)
      formData.append('image', image);
      formData.append('city', city)
      formData.append('location', location)
      try {
         const response = await axios.put(`${process.env.REACT_APP_BACKENDURI}/api/locations/${_id}`, formData, {
            headers: {
               'Content-Type': 'multipart/form-data'
            }
         });
         dispatch(updateLocationSuccess(response.data.location));
         dispatch(showNotification('Location Updated Successfully'));
         return Promise.resolve(response.data.location)
      } catch (err) {
         dispatch(updateLocationFailure(err.response ? err.response.data.error : "Network Error"));
         dispatch(showNotification(err.response ? err.response.data.error : "Network Error"));
         return Promise.reject(err.response ? err.response.data.error : "Network Error")
      }
   };
};

export const updateLocationSuccess = (location) => ({
   type: types.UPDATE_LOCATION_SUCCESS,
   payload: location
});

export const updateLocationFailure = (error) => ({
   type: types.UPDATE_LOCATION_FAILURE,
   payload: error
});

export const deleteLocation = (locationId) => {
   return async (dispatch) => {
      dispatch({ type: types.DELETE_LOCATION });
      try {
         const response = await axios.delete(`${process.env.REACT_APP_BACKENDURI}/api/locations/${locationId}`);
         dispatch(deleteLocationSuccess(locationId));
         dispatch(showNotification('Location Deleted Successfully'));
         return Promise.resolve(response)
      } catch (err) {
         dispatch(deleteLocationFailure(err.response ? err.response.data.error : "Network Error"));
         dispatch(showNotification(err.response ? err.response.data.error : err.message));
         return Promise.reject(err)
      }
   };
};

export const deleteLocationSuccess = (locationId) => ({
   type: types.DELETE_LOCATION_SUCCESS,
   payload: locationId
});

export const deleteLocationFailure = (error) => ({
   type: types.DELETE_LOCATION_FAILURE,
   payload: error
});

export const updateLocationStatus = ({ _id, status }) => {

   console.log(_id, status)

   return async (dispatch) => {
      dispatch({ type: types.UPDATE_LOCATION_STATUS });
      try {
         const response = await axios.put(`${process.env.REACT_APP_BACKENDURI}/api/locations/${_id}/status`, { status });
         dispatch(updateLocationStatusSuccess(response.data));
         dispatch(showNotification('Location Status Updated Successfully'));
         return Promise.resolve(response.data);
      } catch (err) {
         dispatch(updateLocationStatusFailure(err.response ? err.response.data.error : "Network Error"));
         dispatch(showNotification(err.response ? err.response.data.error : "Network Error"));
         return Promise.reject(err.response ? err.response.data.error : "Network Error");
      }
   };
};

export const updateLocationStatusSuccess = (location) => ({
   type: types.UPDATE_LOCATION_STATUS_SUCCESS,
   payload: location
});

export const updateLocationStatusFailure = (error) => ({
   type: types.UPDATE_LOCATION_STATUS_FAILURE,
   payload: error
});