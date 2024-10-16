import customerTypes from "./customerActionTypes";

const initialState = {
   customers: [],
loading: false,
   error: null,
};

const customerReducer = (state = initialState, action) => {
   switch (action.type) {
      case customerTypes.GET_CUSTOMERS_REQUEST:
         return {
            ...state,
            loading: true,
            error: null,
         };
      case customerTypes.GET_CUSTOMERS_SUCCESS:
         return {
            ...state,
            loading: false,
            customers: action.payload,
         };
      case customerTypes.GET_CUSTOMERS_FAILURE:
         return {
            ...state,
            loading: false,
            error: action.payload,
         };
      default:
         return state;
   }
};

export default customerReducer;
