import * as types from './cityActionTypes';

const initialState = {
   cities: [],
   getLoading: false,
   addLoading: false,
   updateLoading: false,
   deleteLoading: false,
   error: null
};

const cityReducer = (state = initialState, action) => {
   switch (action.type) {
      case types.ADD_CITY:
         return {
            ...state,
            addLoading: true
         };
      case types.ADD_CITY_SUCCESS:
         return {
            ...state,
            cities: [...state.cities, action.payload],
            addLoading: false,
            error: null
         };
      case types.ADD_CITY_FAILURE:
         return {
            ...state,
            addLoading: false,
            error: action.payload
         };
      case types.UPDATE_CITY:
         return {
            ...state,
            updateLoading: true
         };
      case types.UPDATE_CITY_SUCCESS:
         const updatedCities = state.cities.map(city => {
            if (city._id === action.payload._id) {
               return action.payload;
            }
            return city;
         });
         return {
            ...state,
            cities: updatedCities,
            updateLoading: false,
            error: null
         };
      case types.UPDATE_CITY_FAILURE:
         return {
            ...state,
            updateLoading: false,
            error: action.payload
         };
      case types.GET_CITIES:
         return {
            ...state,
            getLoading: true
         };
      case types.GET_CITIES_SUCCESS:
         return {
            ...state,
            cities: action.payload,
            getLoading: false,
            error: null
         };
      case types.GET_CITIES_FAILURE:
         return {
            ...state,
            getLoading: false,
            error: action.payload
         };
      case types.DELETE_CITY_SUCCESS:
         const changedCities = state.cities.filter(city => city._id !== action.payload);
         return {
            ...state,
            cities: changedCities,
            deleteLoading: false,
            error: null
         };
      case types.DELETE_CITY_FAILURE:
         return {
            ...state,
            deleteLoading: false,
            error: action.payload
         };
      default:
         return state;
   }
};

export default cityReducer;
