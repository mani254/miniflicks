import addonTypes from './addonActionTypes'; // Adjust this path as necessary
import axios from 'axios';
import { showNotification } from '../notification/notificationActions';

// Add Addon Actions
const addAddonRequest = () => ({
   type: addonTypes.ADD_ADDON_REQUEST,
});

const addAddonSuccess = (addon) => ({
   type: addonTypes.ADD_ADDON_SUCCESS,
   payload: addon,
});

const addAddonFailure = (error) => ({
   type: addonTypes.ADD_ADDON_FAILURE,
   payload: error,
});

export const addAddon = (addonData) => async (dispatch) => {
   dispatch(addAddonRequest());
   try {
      const response = await axios.post(`${import.meta.env.VITE_APP_BACKENDURI}/api/addons`, addonData);
      dispatch(addAddonSuccess(response.data.addon));
      dispatch(showNotification('Addon added successfully!'));
      return Promise.resolve();
   } catch (error) {
      let errMessage = error.response ? error.response.data.error : 'Something went wrong';
      dispatch(addAddonFailure(errMessage));
      dispatch(showNotification(errMessage));
      return Promise.reject(errMessage);
   }
};

// Get Addons Actions
const getAddonsRequest = () => ({
   type: addonTypes.GET_ADDONS_REQUEST,
});

const getAddonsSuccess = (addons) => ({
   type: addonTypes.GET_ADDONS_SUCCESS,
   payload: addons,
});

const getAddonsFailure = (error) => ({
   type: addonTypes.GET_ADDONS_FAILURE,
   payload: error,
});

export const getAddons = () => async (dispatch) => {
   dispatch(getAddonsRequest());
   try {
      const response = await axios.get(`${import.meta.env.VITE_APP_BACKENDURI}/api/addons`);
      dispatch(getAddonsSuccess(response.data.addons));
      return Promise.resolve();
   } catch (error) {
      let errMessage = error.response ? error.response.data.error : 'Something went wrong';
      dispatch(getAddonsFailure(errMessage));
      dispatch(showNotification(errMessage));
      return Promise.reject(errMessage);
   }
};

// Update Addon Actions
const updateAddonRequest = () => ({
   type: addonTypes.UPDATE_ADDON_REQUEST,
});

const updateAddonSuccess = (addon) => ({
   type: addonTypes.UPDATE_ADDON_SUCCESS,
   payload: addon,
});

const updateAddonFailure = (error) => ({
   type: addonTypes.UPDATE_ADDON_FAILURE,
   payload: error,
});

export const updateAddon = (addonId, addonData) => async (dispatch) => {
   dispatch(updateAddonRequest());
   try {
      const response = await axios.put(`${import.meta.env.VITE_APP_BACKENDURI}/api/addons/${addonId}`, addonData);
      dispatch(updateAddonSuccess(response.data.addon));
      dispatch(showNotification('Addon updated successfully!'));
      return Promise.resolve();
   } catch (error) {
      let errMessage = error.response ? error.response.data.error : 'Something went wrong';
      dispatch(updateAddonFailure(errMessage));
      dispatch(showNotification(errMessage));
      return Promise.reject(errMessage);
   }
};

// Delete Addon Actions
const deleteAddonRequest = () => ({
   type: addonTypes.DELETE_ADDON_REQUEST,
});

const deleteAddonSuccess = (addonId) => ({
   type: addonTypes.DELETE_ADDON_SUCCESS,
   payload: addonId,
});

const deleteAddonFailure = (error) => ({
   type: addonTypes.DELETE_ADDON_FAILURE,
   payload: error,
});

export const deleteAddon = (addonId) => async (dispatch) => {
   dispatch(deleteAddonRequest());
   try {
      await axios.delete(`${import.meta.env.VITE_APP_BACKENDURI}/api/addons/${addonId}`);
      dispatch(deleteAddonSuccess(addonId));
      dispatch(showNotification('Addon deleted successfully!'));
      return Promise.resolve(addonId);
   } catch (error) {
      let errMessage = error.response ? error.response.data.error : 'Something went wrong';
      dispatch(deleteAddonFailure(errMessage));
      dispatch(showNotification(errMessage));
      return Promise.reject(errMessage);
   }
};
