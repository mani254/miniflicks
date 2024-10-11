import bookingTypes from "./bookingActionTypes";

const initialState = {
   bookings: [],
   booking: null, // Initialize booking state
   loading: false,
   error: null
};

const bookingReducer = (state = initialState, action) => {
   switch (action.type) {
      case bookingTypes.GET_BOOKINGS_REQUEST:
      case bookingTypes.GET_BOOKING_REQUEST:
         return {
            ...state,
            loading: true,
            error: null,
         };
      case bookingTypes.GET_BOOKINGS_SUCCESS:
         return {
            ...state,
            loading: false,
            bookings: action.payload,
         };
      case bookingTypes.GET_BOOKING_SUCCESS:
         return {
            ...state,
            loading: false,
            booking: action.payload,
         };
      case bookingTypes.GET_BOOKINGS_FAILURE:
      case bookingTypes.GET_BOOKING_FAILURE:
         return {
            ...state,
            loading: false,
            error: action.payload,
         };
      default:
         return state;
   }
};

export default bookingReducer;
