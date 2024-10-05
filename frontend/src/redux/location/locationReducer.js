import locationTypes from './locationActionTypes';

const initialState = {
   locations: [],
   loading: false,
   error: null,
};

const locationReducer = (state = initialState, action) => {
   switch (action.type) {
      case locationTypes.ADD_LOCATION_REQUEST:
      case locationTypes.GET_LOCATIONS_REQUEST:
      case locationTypes.UPDATE_LOCATION_REQUEST:
      case locationTypes.DELETE_LOCATION_REQUEST:
         return {
            ...state,
            loading: true,
            error: null,
         };

      case locationTypes.ADD_LOCATION_SUCCESS:
         return {
            ...state,
            loading: false,
            locations: [...state.locations, action.payload],
         };

      case locationTypes.GET_LOCATIONS_SUCCESS:
         return {
            ...state,
            loading: false,
            locations: action.payload,
         };

      case locationTypes.UPDATE_LOCATION_SUCCESS:
         return {
            ...state,
            loading: false,
            locations: state.locations.map(location =>
               location._id === action.payload._id ? action.payload : location
            ),
         };

      case locationTypes.DELETE_LOCATION_SUCCESS:
         return {
            ...state,
            loading: false,
            locations: state.locations.filter(location => location._id !== action.payload),
         };

      case locationTypes.ADD_LOCATION_FAILURE:
      case locationTypes.GET_LOCATIONS_FAILURE:
      case locationTypes.UPDATE_LOCATION_FAILURE:
      case locationTypes.DELETE_LOCATION_FAILURE:
         return {
            ...state,
            loading: false,
            error: action.payload,
         };

      default:
         return state;
   }
};

export default locationReducer;
