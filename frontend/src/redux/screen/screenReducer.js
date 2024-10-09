import screenTypes from './screenActionTypes';

const initialState = {
   screens: [],
   loading: false,
   error: null,
};

const screenReducer = (state = initialState, action) => {
   switch (action.type) {
      case screenTypes.ADD_SCREEN_REQUEST:
      case screenTypes.GET_SCREENS_REQUEST:
      case screenTypes.UPDATE_SCREEN_REQUEST:
      case screenTypes.DELETE_SCREEN_REQUEST:
         return {
            ...state,
            loading: true,
            error: null,
         };

      case screenTypes.ADD_SCREEN_SUCCESS:
         return {
            ...state,
            loading: false,
            screens: [...state.screens, action.payload],
         };

      case screenTypes.GET_SCREENS_SUCCESS:
         return {
            ...state,
            loading: false,
            screens: action.payload,
         };

      case screenTypes.UPDATE_SCREEN_SUCCESS:
         return {
            ...state,
            loading: false,
            screens: state.screens.map(screen =>
               screen._id === action.payload._id ? action.payload : screen
            ),
         };

      case screenTypes.DELETE_SCREEN_SUCCESS:
         return {
            ...state,
            loading: false,
            screens: state.screens.filter(screen => screen._id !== action.payload),
         };

      case screenTypes.ADD_SCREEN_FAILURE:
      case screenTypes.GET_SCREENS_FAILURE:
      case screenTypes.UPDATE_SCREEN_FAILURE:
      case screenTypes.DELETE_SCREEN_FAILURE:
         return {
            ...state,
            loading: false,
            error: action.payload,
         };

      default:
         return state;
   }
};

export default screenReducer;
