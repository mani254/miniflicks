import customerBookingActionTypes from './customerBookingActionTypes';

const initialState = {
   city: '',
   location: '',
   screen: "",
   date: new Date(new Date().setHours(0, 0, 0, 0)),
   slot: {},
   package: "",
};

const customerBookingReducer = (state = initialState, action) => {
   switch (action.type) {
      case customerBookingActionTypes.SET_BOOKING_DATA:
         return action.payload

      case customerBookingActionTypes.SET_BOOKING_CITY:
         return {
            ...initialState,
            city: action.payload,
         };
      case customerBookingActionTypes.SET_BOOKING_LOCATION:
         return {
            ...initialState,
            city: state.city,
            location: action.payload,
         };
      case customerBookingActionTypes.SET_BOOKING_SCREEN:
         return {
            ...initialState,
            city: state.city,
            location: state.location,
            screen: action.payload
         };
      case customerBookingActionTypes.SET_BOOKING_DATE:
         return {
            ...initialState,
            city: state.city,
            location: state.location,
            screen: state.screen,
            date: action.payload
         }
      case customerBookingActionTypes.SET_BOOKING_SLOT:
         return {
            ...state,
            slot: action.payload
         }
      case customerBookingActionTypes.SET_BOOKING_PACKAGE:
         return {
            ...state,
            package: action.payload
         }
      default:
         return state;
   }
};

export default customerBookingReducer;
