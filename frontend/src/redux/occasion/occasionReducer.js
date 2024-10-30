import occasionTypes from "./occasionActionTypes";

const initialState = {
   occasions: [],
   loading: false,
   error: null,
};

const occasionReducer = (state = initialState, action) => {
   switch (action.type) {
      case occasionTypes.ADD_OCCASION_REQUEST:
      case occasionTypes.GET_OCCASIONS_REQUEST:
      case occasionTypes.UPDATE_OCCASION_REQUEST:
      case occasionTypes.DELETE_OCCASION_REQUEST:
         return {
            ...state,
            loading: true,
            error: null,
         };

      case occasionTypes.ADD_OCCASION_SUCCESS:
         return {
            ...state,
            loading: false,
            occasions: [...state.occasions, action.payload],
         };

      case occasionTypes.GET_OCCASIONS_SUCCESS:
         console.log(state)
         return {
            ...state,
            loading: false,
            occasions: action.payload,
         };

      case occasionTypes.UPDATE_OCCASION_SUCCESS:
         return {
            ...state,
            loading: false,
            occasions: state.occasions.map(occasion =>
               occasion._id === action.payload._id ? action.payload : occasion
            ),
         };

      case occasionTypes.DELETE_OCCASION_SUCCESS:
         return {
            ...state,
            loading: false,
            occasions: state.occasions.filter(occasion => occasion._id !== action.payload),
         };

      case occasionTypes.ADD_OCCASION_FAILURE:
      case occasionTypes.GET_OCCASIONS_FAILURE:
      case occasionTypes.UPDATE_OCCASION_FAILURE:
      case occasionTypes.DELETE_OCCASION_FAILURE:
         return {
            ...state,
            loading: false,
            error: action.payload,
         };

      default:
         return state;
   }
};

export default occasionReducer;
