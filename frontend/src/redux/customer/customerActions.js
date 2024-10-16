import customerTypes from "./customerActionTypes";
import axios from 'axios';
import { showNotification } from "../notification/notificationActions";

const getCustomersRequest = () => ({
   type: customerTypes.GET_CUSTOMERS_REQUEST,
});

const getCustomersSuccess = (customers) => ({
   type: customerTypes.GET_CUSTOMERS_SUCCESS,
   payload: customers,
});

const getCustomersFailure = (error) => ({
   type: customerTypes.GET_CUSTOMERS_FAILURE,
   payload: error,
});

export const getCustomers = (params) => async (dispatch) => {
   dispatch(getCustomersRequest());
   try {
      const response = await axios.get(`${import.meta.env.VITE_APP_BACKENDURI}/api/customers`, { params });
      dispatch(getCustomersSuccess(response.data.customers));
      return Promise.resolve({ totalDocuments: response.data.totalDocuments });
   } catch (error) {
      let errMessage = error.response ? error.response.data.error : 'Something went wrong';
      dispatch(getCustomersFailure(errMessage));
      dispatch(showNotification(errMessage));
      return Promise.reject(errMessage);
   }
};
