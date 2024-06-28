// locationReducer.js
import * as types from './locationActionTypes';

const initialState = {
   locations: [],
   getLoading: false,
   addLoading: false,
   updateLoading: false,
   deleteLoading: false,
   error: null
};

const locationReducer = (state = initialState, action) => {
   switch (action.type) {
      case types.ADD_LOCATION:
         return {
            ...state,
            addLoading: true
         };
      case types.ADD_LOCATION_SUCCESS:
         return {
            ...state,
            locations: [...state.locations, action.payload],
            addLoading: false,
            error: null
         };
      case types.ADD_LOCATION_FAILURE:
         return {
            ...state,
            addLoading: false,
            error: action.payload
         };
      case types.GET_LOCATIONS:
         return {
            ...state,
            getLoading: true
         };
      case types.GET_LOCATIONS_SUCCESS:
         return {
            ...state,
            locations: action.payload,
            getLoading: false,
            error: null
         };
      case types.GET_LOCATIONS_FAILURE:
         return {
            ...state,
            getLoading: false,
            error: action.payload
         };
      case types.UPDATE_LOCATION:
         return {
            ...state,
            updateLoading: true
         };
      case types.UPDATE_LOCATION_SUCCESS:
         const updatedLocations = state.locations.map(location => {
            if (location._id === action.payload._id) {
               return action.payload;
            }
            return location;
         });
         return {
            ...state,
            locations: updatedLocations,
            updateLoading: false,
            error: null
         };
      case types.UPDATE_LOCATION_FAILURE:
         return {
            ...state,
            updateLoading: false,
            error: action.payload
         };
      case types.DELETE_LOCATION_SUCCESS:
         const changedLocations = state.locations.filter(location => location._id !== action.payload);
         return {
            ...state,
            locations: changedLocations,
            deleteLoading: false,
            error: null
         };
      case types.DELETE_LOCATION_FAILURE:
         return {
            ...state,
            deleteLoading: false,
            error: action.payload
         };
      case types.UPDATE_LOCATION_STATUS:
         return {
            ...state,
            updateLoading: true
         };
      case types.UPDATE_LOCATION_STATUS_SUCCESS:
         const updatedStatusLocations = state.locations.map(location => {
            if (location._id === action.payload._id) {
               return {
                  ...location,
                  status: action.payload.status
               };
            }
            return location;
         });
         return {
            ...state,
            locations: updatedStatusLocations,
            updateLoading: false,
            error: null
         };
      case types.UPDATE_LOCATION_STATUS_FAILURE:
         return {
            ...state,
            updateLoading: false,
            error: action.payload
         };
      default:
         return state;
   }
};

export default locationReducer;
