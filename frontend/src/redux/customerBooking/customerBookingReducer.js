import customerBookingActionTypes from './customerBookingActionTypes';

const initialState = {
   city: '',
   location: '',
   screen: "",
};

const customerBookingReducer = (state = initialState, action) => {
   switch (action.type) {
      case customerBookingActionTypes.SET_BOOKING_CITY:
         return {
            ...state,
            city: action.payload,
         };
      case customerBookingActionTypes.SET_BOOKING_LOCATION:
         return {
            ...state,
            location: action.payload,
         };
      case customerBookingActionTypes.SET_BOOKING_SCREEN:
         return {
            ...state,
            screen: action.payload
         }
      default:
         return state;
   }
};

export default customerBookingReducer;
