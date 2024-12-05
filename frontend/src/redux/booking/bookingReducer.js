import bookingTypes from "./bookingActionTypes";

const initialState = {
   bookings: [],
   booking: null,
   loading: false,
   error: null
};

const bookingReducer = (state = initialState, action) => {
   switch (action.type) {
      case bookingTypes.GET_BOOKINGS_REQUEST:
      case bookingTypes.GET_BOOKING_REQUEST:
      case bookingTypes.CREATE_BOOKING_REQUEST:
      case bookingTypes.UPDATE_BOOKING_SUCCESS:
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
      case bookingTypes.CREATE_BOOKING_SUCCESS:
      case bookingTypes.UPDATE_BOOKING_SUCCESS:
         return {
            ...state,
            loading: false,
            booking: action.payload,
         };
      case bookingTypes.GET_BOOKINGS_FAILURE:
      case bookingTypes.GET_BOOKING_FAILURE:
      case bookingTypes.CREATE_BOOKING_FAILURE:
      case bookingTypes.UPDATE_BOOKING_FAILURE:
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
