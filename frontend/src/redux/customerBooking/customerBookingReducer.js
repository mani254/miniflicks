import customerBookingActionTypes from './customerBookingActionTypes';

const initialState = {
   city: '',
   location: '',
   screen: "",
   date: new Date(new Date().setHours(0, 0, 0, 0)),
   slot: {},
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
         };
      case customerBookingActionTypes.SET_BOOKING_DATE:
         return {
            ...state,
            date: action.payload
         }
      case customerBookingActionTypes.SET_BOOKING_SLOT:
         return {
            ...state,
            slot: action.payload
         }
      default:
         return state;
   }
};

export default customerBookingReducer;
