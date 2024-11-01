import cakeTypes from "./cakeActionTypes";

const initialState = {
   cakes: [],
   loading: false,
   error: null,
};

const cakeReducer = (state = initialState, action) => {
   switch (action.type) {
      case cakeTypes.ADD_CAKE_REQUEST:
      case cakeTypes.GET_CAKES_REQUEST:
      case cakeTypes.UPDATE_CAKE_REQUEST:
      case cakeTypes.DELETE_CAKE_REQUEST:
         return {
            ...state,
            loading: true,
            error: null,
         };

      case cakeTypes.ADD_CAKE_SUCCESS:
         return {
            ...state,
            loading: false,
            cakes: [...state.cakes, action.payload],
         };

      case cakeTypes.GET_CAKES_SUCCESS:
         return {
            ...state,
            loading: false,
            cakes: action.payload,
         };

      case cakeTypes.UPDATE_CAKE_SUCCESS:
         return {
            ...state,
            loading: false,
            cakes: state.cakes.map(cake =>
               cake._id === action.payload._id ? action.payload : cake
            ),
         };

      case cakeTypes.DELETE_CAKE_SUCCESS:
         return {
            ...state,
            loading: false,
            cakes: state.cakes.filter(cake => cake._id !== action.payload),
         };

      case cakeTypes.ADD_CAKE_FAILURE:
      case cakeTypes.GET_CAKES_FAILURE:
      case cakeTypes.UPDATE_CAKE_FAILURE:
      case cakeTypes.DELETE_CAKE_FAILURE:
         return {
            ...state,
            loading: false,
            error: action.payload,
         };

      default:
         return state;
   }
};

export default cakeReducer;
