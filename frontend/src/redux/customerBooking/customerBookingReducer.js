import customerBookingActionTypes from './customerBookingActionTypes';

const initialState = {
   city: '',
   location: '',
   screen: "",
   date: new Date(new Date().setHours(0, 0, 0, 0)),
   slot: {},
   package: "",
   occasion: null,
   addons: [],
   gifts: [],
   cakes: [],
   customer: null,
   otherInfo: {
      numberOfPeople: 0,
      numberOfExtraPeople: 0,
      extraPersonsPrice: 0,
      nameOnCake: "",
      ledName: "",
      ledNumber: "", 
      couponCode: "",
   },
   advance: 0,
   note: "",
   total: 0,
   isEditing:false,
   fullPayment:false,
   id:null,
};

const customerBookingReducer = (state = initialState, action) => {
   switch (action.type) {
      case customerBookingActionTypes.SET_CUSTOMER_BOOKING:
         return action.payload

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
      case customerBookingActionTypes.SET_BOOKING_OCCASION:
         return {
            ...state,
            occasion: action.payload
         }
      case customerBookingActionTypes.SET_BOOKING_ADDONS:
         return {
            ...state,
            addons: action.payload
         }
      case customerBookingActionTypes.SET_BOOKING_GIFTS:
         return {
            ...state,
            gifts: action.payload
         }
      case customerBookingActionTypes.SET_BOOKING_CAKES:
         return {
            ...state,
            cakes: action.payload
         }
      case customerBookingActionTypes.SET_BOOKING_CUSTOMER:
         return {
            ...state,
            customer: action.payload
         }
      case customerBookingActionTypes.SET_BOOKING_OTHERINFO:
         return {
            ...state,
            otherInfo: action.payload
         }
      case customerBookingActionTypes.SET_BOOKING_ADVANCE:
         return {
            ...state,
            advance: action.payload
         }
      case customerBookingActionTypes.SET_BOOKING_NOTE:
         return {
            ...state,
            note: action.payload
         }
      case customerBookingActionTypes.SET_BOOKING_TOTAL:
         return {
            ...state,
            total: action.payload
         }
      case customerBookingActionTypes.SET_BOOKING_FULLPAYMENT:
         return {
            ...state,
            fullPayment: action.payload
         }
      default:
         return state;
   }
};

export default customerBookingReducer;
