import * as types from './screenActionTypes';

const initialState = {
   screens: [],
   getLoading: false,
   addLoading: false,
   updateLoading: false,
   deleteLoading: false,
   error: null
};

const screenReducer = (state = initialState, action) => {
   switch (action.type) {
      case types.ADD_SCREEN:
         return {
            ...state,
            addLoading: true
         };
      case types.ADD_SCREEN_SUCCESS:
         return {
            ...state,
            screens: [...state.screens, action.payload],
            addLoading: false,
            error: null
         };
      case types.ADD_SCREEN_FAILURE:
         return {
            ...state,
            addLoading: false,
            error: action.payload
         };
      case types.GET_SCREENS:
         return {
            ...state,
            getLoading: true
         };
      case types.GET_SCREENS_SUCCESS:
         return {
            ...state,
            screens: action.payload,
            getLoading: false,
            error: null
         };
      case types.GET_SCREENS_FAILURE:
         return {
            ...state,
            getLoading: false,
            error: action.payload
         };
      case types.UPDATE_SCREEN:
         return {
            ...state,
            updateLoading: true
         };
      case types.UPDATE_SCREEN_SUCCESS:
         const updatedScreens = state.screens.map(screen => {
            if (screen._id === action.payload._id) {
               return action.payload;
            }
            return screen;
         });
         return {
            ...state,
            screens: updatedScreens,
            updateLoading: false,
            error: null
         };
      case types.UPDATE_SCREEN_FAILURE:
         return {
            ...state,
            updateLoading: false,
            error: action.payload
         };
      case types.DELETE_SCREEN_SUCCESS:
         const changedScreens = state.screens.filter(screen => screen._id !== action.payload);
         return {
            ...state,
            screens: changedScreens,
            deleteLoading: false,
            error: null
         };
      case types.DELETE_SCREEN_FAILURE:
         return {
            ...state,
            deleteLoading: false,
            error: action.payload
         };
      case types.UPDATE_SCREEN_STATUS:
         return {
            ...state,
            updateLoading: true
         };
      case types.UPDATE_SCREEN_STATUS_SUCCESS:
         const updatedStatusScreens = state.screens.map(screen => {
            if (screen._id === action.payload._id) {
               return {
                  ...screen,
                  status: action.payload.status
               };
            }
            return screen;
         });
         return {
            ...state,
            screens: updatedStatusScreens,
            updateLoading: false,
            error: null
         };
      case types.UPDATE_SCREEN_STATUS_FAILURE:
         return {
            ...state,
            updateLoading: false,
            error: action.payload
         };
      default:
         return state;
   }
};

export default screenReducer;
