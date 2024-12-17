import bookingTypes from "./bookingActionTypes";
import axios from 'axios';
import { showNotification } from "../notification/notificationActions";

const getBookingsRequest = () => ({
   type: bookingTypes.GET_BOOKINGS_REQUEST,
});

const getBookingsSuccess = (bookings) => ({
   type: bookingTypes.GET_BOOKINGS_SUCCESS,
   payload: bookings,
});

const getBookingsFailure = (error) => ({
   type: bookingTypes.GET_BOOKINGS_FAILURE,
   payload: error,
});

export const getBookings = (params) => async (dispatch) => {
   dispatch(getBookingsRequest());
   try {
      const response = await axios.get(`${import.meta.env.VITE_APP_BACKENDURI}/api/bookings`, { params });
      dispatch(getBookingsSuccess(response.data.bookings));
      return Promise.resolve({ totalDocuments: response.data.totalDocuments });
   } catch (error) {
      let errMessage = error.response ? error.response.data.error : 'Something went wrong';
      dispatch(getBookingsFailure(errMessage));
      dispatch(showNotification(errMessage));
      return Promise.reject(errMessage);
   }
};

const getBookingRequest = () => ({
   type: bookingTypes.GET_BOOKING_REQUEST,
});

const getBookingSuccess = (booking) => ({
   type: bookingTypes.GET_BOOKING_SUCCESS,
   payload: booking,
});

const getBookingFailure = (error) => ({
   type: bookingTypes.GET_BOOKING_FAILURE,
   payload: error,
});

export const getBooking = (id) => async (dispatch) => {
   dispatch(getBookingRequest());
   try {
      const response = await axios.get(`${import.meta.env.VITE_APP_BACKENDURI}/api/bookings/${id}`);
      dispatch(getBookingSuccess(response.data.booking));
      return Promise.resolve(response.data.booking);
   } catch (error) {
      let errMessage = error.response ? error.response.data.error : 'Something went wrong';
      dispatch(getBookingFailure(errMessage));
      dispatch(showNotification(errMessage));
      return Promise.reject(errMessage);
   }
};

const createBookingRequest = (bookingData) => ({
   type: bookingTypes.CREATE_BOOKING_REQUEST,
});

const createBookingSuccess = (booking) => ({
   type: bookingTypes.CREATE_BOOKING_SUCCESS,
   payload: booking,
});

const createBookingFailure = (error) => ({
   type: bookingTypes.CREATE_BOOKING_FAILURE,
   payload: error,
});

export const createBooking = (bookingData) => async (dispatch) => {
   dispatch(createBookingRequest());
   try {
      const response = await axios.post(`${import.meta.env.VITE_APP_BACKENDURI}/api/bookings`, bookingData);
      dispatch(createBookingSuccess(response.data.booking));
      return Promise.resolve(response.data.booking);
   } catch (error) {
      let errMessage = error.response ? error.response.data.error : 'Something went wrong';
      dispatch(createBookingFailure(errMessage));
      dispatch(showNotification(errMessage));
      return Promise.reject(errMessage);
   }
};

const updateBookingRequest = (bookingData) => ({
   type: bookingTypes.UPDATE_BOOKING_REQUEST,
});

const updateBookingSuccess = (booking) => ({
   type: bookingTypes.UPDATE_BOOKING_SUCCESS,
   payload: booking,
});

const updateBookingFailure = (error) => ({
   type: bookingTypes.UPDATE_BOOKING_FAILURE,
   payload: error,
});
export const updateBooking = (bookingData) => async (dispatch) => {
   dispatch(updateBookingRequest());
   try {
      const response = await axios.put(`${import.meta.env.VITE_APP_BACKENDURI}/api/bookings`, bookingData);
      dispatch(updateBookingSuccess(response.data.booking));
      return Promise.resolve(response.data.booking);
   } catch (error) {
      let errMessage = error.response ? error.response.data.error : 'Something went wrong';
      dispatch(updateBookingFailure(errMessage));
      dispatch(showNotification(errMessage));
      return Promise.reject(errMessage);
   }
};

const deleteBookingRequest = () => ({
   type: bookingTypes.DELETE_BOOKING_REQUEST,
});

const deleteBookingSuccess = (bookingId) => ({
   type: bookingTypes.DELETE_BOOKING_SUCCESS,
   payload: bookingId,
});

const deleteBookingFailure = (error) => ({
   type: bookingTypes.DELETE_BOOKING_FAILURE,
   payload: error,
});

export const deleteBooking = (bookingId) => async (dispatch) => {
   dispatch(deleteBookingRequest());
   try {
      await axios.delete(`${import.meta.env.VITE_APP_BACKENDURI}/api/bookings/${bookingId}`);
      dispatch(deleteBookingSuccess(bookingId));
      return Promise.resolve(bookingId);
   } catch (error) {
      let errMessage = error.response ? error.response.data.error : 'Something went wrong';
      dispatch(deleteBookingFailure(errMessage));
      dispatch(showNotification(errMessage));
      return Promise.reject(errMessage);
   }
};


export const getBookedSlots = ({ currentDate, screenId }) => async (dispatch) => {
   try {
      const response = await axios.post(`${import.meta.env.VITE_APP_BACKENDURI}/api/bookings/getBookedSlots`, { currentDate, screenId });
      return Promise.resolve(response.data);
   } catch (error) {
      let errMessage = error.response ? error.response.data.error : 'Something went wrong';
      dispatch(showNotification(errMessage));
      return Promise.reject(errMessage);
   }
}
