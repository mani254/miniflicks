import authTypes from "./authActionTypes";

const initialState = {
   isLoggedIn: false,
   admin: null,
   loading: false,
   error: null,
};

const authReducer = (state = initialState, action) => {
   switch (action.type) {
      case authTypes.LOGIN_REQUEST:
      case authTypes.REG_REQUEST:
      case authTypes.INITIAL_LOGIN_REQUEST:
         return {
            ...state,
            loading: true,
            error: null,
         };
      case authTypes.LOGIN_SUCCESS:
      case authTypes.INITIAL_LOGIN_SUCCESS:
         return {
            ...state,
            isLoggedIn: true,
            admin: action.payload.admin,
            loading: false,
            error: null,
         };
      case authTypes.REG_SUCCESS:
         return {
            ...state,
            loading: false
         }
      case authTypes.LOGIN_FAILURE:
      case authTypes.REG_FAILURE:
      case authTypes.INITIAL_LOGIN_FAILURE:
         return {
            ...state,
            loading: false,
            error: action.payload,
         };
      case authTypes.LOGOUT:
         return initialState;
      default:
         return state;
   }
};

export default authReducer;
