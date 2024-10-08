import cityTypes from './cityActionTypes';

const initialState = {
   cities: [],
   loading: false,
   error: null,
};

const cityReducer = (state = initialState, action) => {
   switch (action.type) {
      case cityTypes.ADD_CITY_REQUEST:
      case cityTypes.GET_CITIES_REQUEST:
      case cityTypes.UPDATE_CITY_REQUEST:
      case cityTypes.DELETE_CITY_REQUEST:
         return {
            ...state,
            loading: true,
            error: null,
         };

      case cityTypes.ADD_CITY_SUCCESS:
         return {
            ...state,
            loading: false,
            cities: [...state.cities, action.payload],
         };

      case cityTypes.GET_CITIES_SUCCESS:
         return {
            ...state,
            loading: false,
            cities: action.payload,
         };

      case cityTypes.UPDATE_CITY_SUCCESS:
         return {
            ...state,
            loading: false,
            cities: state.cities.map(city =>
               city._id === action.payload._id ? action.payload : city
            ),
         };

      case cityTypes.DELETE_CITY_SUCCESS:
         return {
            ...state,
            loading: false,
            cities: state.cities.filter(city => city._id !== action.payload),
         };

      case cityTypes.ADD_CITY_FAILURE:
      case cityTypes.GET_CITIES_FAILURE:
      case cityTypes.UPDATE_CITY_FAILURE:
      case cityTypes.DELETE_CITY_FAILURE:
         return {
            ...state,
            loading: false,
            error: action.payload,
         };

      default:
         return state;
   }
};

export default cityReducer;

