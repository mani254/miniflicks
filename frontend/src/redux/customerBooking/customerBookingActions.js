import customerBookingActionTypes from './customerBookingActionTypes';

// Action to set booking city
export const setBookingCity = (city) => {
   return {
      type: customerBookingActionTypes.SET_BOOKING_CITY,
      payload: city,
   };
};

// Action to set booking location
export const setBookingLocation = (location) => {
   return {
      type: customerBookingActionTypes.SET_BOOKING_LOCATION,
      payload: location,
   };
};
