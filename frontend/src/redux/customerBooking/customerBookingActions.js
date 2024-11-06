import customerBookingActionTypes from './customerBookingActionTypes';

export const setBookingFromLocalStorage = (data) => {
   return {
      type: customerBookingActionTypes.SET_BOOKING_DATA,
      payload: data,
   };
};

// Action to set booking cityP
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

export const setBookingOccasion = (occasion) => {
   return {
      type: customerBookingActionTypes.SET_BOOKING_OCCASION,
      payload: occasion
   }
}
export const setBookingAddons = (addons) => {
   return {
      type: customerBookingActionTypes.SET_BOOKING_ADDONS,
      payload: addons
   }
}
export const setBookingGifts = (gifts) => {
   return {
      type: customerBookingActionTypes.SET_BOOKING_GIFTS,
      payload: gifts
   }
}

export const setBookingCakes = (cakes) => {
   return {
      type: customerBookingActionTypes.SET_BOOKING_CAKES,
      payload: cakes
   }
}


export const setBookingCustomer = (customer) => {
   return {
      type: customerBookingActionTypes.SET_BOOKING_CUSTOMER,
      payload: customer
   }
}

export const setBookingOtherInfo = (otherInfo) => {
   return {
      type: customerBookingActionTypes.SET_BOOKING_OTHERINFO,
      payload: otherInfo
   }
}

export const setBookingAdvance = (advance) => {
   return {
      type: customerBookingActionTypes.SET_BOOKING_ADVANCE,
      payload: advance
   }
}

export const setBookingNote = (note) => {
   return {
      type: customerBookingActionTypes.SET_BOOKING_NOTE,
      payload: note
   }
}
export const setBookingTotal = (total) => {
   return {
      type: customerBookingActionTypes.SET_BOOKING_TOTAL,
      payload: total
   }
}

