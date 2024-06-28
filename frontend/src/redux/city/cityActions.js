import * as types from './cityActionTypes';
import axios from 'axios';

import { showNotification } from '../notification/notificationActions.js';

export const addCity = ({ name, image, status }) => {
   return async (dispatch) => {
      dispatch({ type: types.ADD_CITY });

      const formData = new FormData();
      formData.append('name', name);
      formData.append('status', status);
      formData.append('image', image);

      await axios.post(`${process.env.REACT_APP_BACKENDURI}/api/cities`, formData, {
         headers: {
            'Content-Type': 'multipart/form-data'
         }
      }).then(res => {
         dispatch(addCitySuccess(res.data));
         dispatch(showNotification('City Added Succefully'))
         return Promise.resolve(res)
      }).catch(err => {
         dispatch(addCityFailure(err.response ? err.response.data.error : "Network Error"));
         dispatch(showNotification(err.response ? err.response.data.error : "Network Error"))
         return Promise.reject(err);
      })
   };
};

export const addCitySuccess = (city) => ({
   type: types.ADD_CITY_SUCCESS,
   payload: city
});

export const addCityFailure = (error) => ({
   type: types.ADD_CITY_FAILURE,
   payload: error
});

export const updateCity = ({ id, name, image, status }) => {

   return async (dispatch) => {
      dispatch({ type: types.UPDATE_CITY });
      const formData = new FormData();
      formData.append('name', name);
      formData.append('status', status);

      if (typeof image == 'string') {
         console.log('normal')
         formData.append('image', image);
      } else {
         console.log('instance')
         formData.append('image', image.get('image'));
      }

      try {
         const response = await axios.put(`${process.env.REACT_APP_BACKENDURI}/api/cities/${id}`, formData, {
            headers: {
               'Content-Type': 'multipart/form-data'
            }
         });
         dispatch(updateCitySuccess(response.data));
         dispatch(showNotification('City Updated Succefully'))
      } catch (err) {
         dispatch(updateCityFailure(err.response ? err.response.data.error : "Network Error"));
         dispatch(showNotification(err.response ? err.response.data.error : "Network Error"));
      }
   };
};

export const updateCitySuccess = (city) => ({
   type: types.UPDATE_CITY_SUCCESS,
   payload: city
});

export const updateCityFailure = (error) => ({
   type: types.UPDATE_CITY_FAILURE,
   payload: error
});

export const getCities = () => {
   return async (dispatch) => {
      dispatch({ type: types.GET_CITIES });
      await axios.get(`${process.env.REACT_APP_BACKENDURI}/api/cities`).then(res => {
         dispatch(getCitiesSuccess(res.data));
         return Promise.resolve(res.data)
      }).catch(err => {
         dispatch(getCitiesFailure(err.message));
         return Promise.reject(err)
      })
   };
};

export const getCitiesSuccess = (cities) => ({
   type: types.GET_CITIES_SUCCESS,
   payload: cities
});

export const getCitiesFailure = (error) => ({
   type: types.GET_CITIES_FAILURE,
   payload: error
});

export const deleteCity = (cityId) => {
   return async (dispatch) => {
      dispatch({ type: types.DELETE_CITY });
      try {
         await axios.delete(`${process.env.REACT_APP_BACKENDURI}/api/cities/${cityId}`);
         dispatch(deleteCitySuccess(cityId));
         dispatch(showNotification('City Deleted Successfully'));
      } catch (err) {
         dispatch(deleteCityFailure(err.response ? err.response.data.error : "Network Error"));
         dispatch(showNotification(err.response ? err.response.data.error : err.message));
      }
   };
};

export const deleteCitySuccess = (cityId) => ({
   type: types.DELETE_CITY_SUCCESS,
   payload: cityId
});

export const deleteCityFailure = (error) => ({
   type: types.DELETE_CITY_FAILURE,
   payload: error
});


