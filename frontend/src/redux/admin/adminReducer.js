// adminReducer.js
import { SIGN_IN_SUCCESS, SIGN_IN_FAILURE, SIGN_IN_START } from "./adminActionTypes";

const initialState = {
   isLoggedIn: false,
   adminData: null,
   loading: false,
   error: null,
   token: localStorage.getItem("adminAuthToken"),
};

const adminReducer = (state = initialState, action) => {
   switch (action.type) {
      case SIGN_IN_START:
         return {
            ...state,
            loading: true,
         };
      case SIGN_IN_SUCCESS:
         return {
            ...state,
            isLoggedIn: action.payload !== null,
            adminData: action.payload,
            loading: false,
            error: null,
            token: action.payload ? action.payload.token : null,
         };
      case SIGN_IN_FAILURE:
         return {
            ...state,
            error: action.payload,
            loading: false,
         };
      default:
         return state;
   }
};

export default adminReducer;
