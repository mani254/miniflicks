import giftTypes from "./giftActionTypes";

const initialState = {
   gifts: [],
   loading: false,
   error: null,
};

const giftReducer = (state = initialState, action) => {
   switch (action.type) {
      case giftTypes.ADD_GIFT_REQUEST:
      case giftTypes.GET_GIFTS_REQUEST:
      case giftTypes.UPDATE_GIFT_REQUEST:
      case giftTypes.DELETE_GIFT_REQUEST:
         return {
            ...state,
            loading: true,
            error: null,
         };

      case giftTypes.ADD_GIFT_SUCCESS:
         return {
            ...state,
            loading: false,
            gifts: [...state.gifts, action.payload],
         };

      case giftTypes.GET_GIFTS_SUCCESS:
         return {
            ...state,
            loading: false,
            gifts: action.payload,
         };

      case giftTypes.UPDATE_GIFT_SUCCESS:
         return {
            ...state,
            loading: false,
            gifts: state.gifts.map(gift =>
               gift._id === action.payload._id ? action.payload : gift
            ),
         };

      case giftTypes.DELETE_GIFT_SUCCESS:
         return {
            ...state,
            loading: false,
            gifts: state.gifts.filter(gift => gift._id !== action.payload),
         };

      case giftTypes.ADD_GIFT_FAILURE:
      case giftTypes.GET_GIFTS_FAILURE:
      case giftTypes.UPDATE_GIFT_FAILURE:
      case giftTypes.DELETE_GIFT_FAILURE:
         return {
            ...state,
            loading: false,
            error: action.payload,
         };

      default:
         return state;
   }
};

export default giftReducer;
