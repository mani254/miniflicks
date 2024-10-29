import customerBookingActionTypes from './customerBookingActionTypes';

export const setBookingFromLocalStorage = (data) => {
   return {
      type: customerBookingActionTypes.SET_BOOKING_DATA,
      payload: data,
   };
};

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

export const setBookingScreen = (screen) => {
   return {
      type: customerBookingActionTypes.SET_BOOKING_SCREEN,
      payload: screen
   }
}

export const setBookingDate = (date) => {
   return {
      type: customerBookingActionTypes.SET_BOOKING_DATE,
      payload: date
   }
}

export const setBookingSlot = (slot) => {
   return {
      type: customerBookingActionTypes.SET_BOOKING_SLOT,
      payload: slot
   }
}

export const setBookingPackage = (pack) => {
   return {
      type: customerBookingActionTypes.SET_BOOKING_PACKAGE,
      payload: pack
   }
}
