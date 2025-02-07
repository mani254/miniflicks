import couponTypes from "./couponActionTypes";

const initialState = {
   coupons: [],
   loading: false,
   error: null,
};

const couponReducer = (state = initialState, action) => {
   switch (action.type) {
      case couponTypes.ADD_COUPON_REQUEST:
      case couponTypes.GET_COUPONS_REQUEST:
      case couponTypes.GET_USERCOUPONS_REQUEST:
      case couponTypes.UPDATE_COUPON_REQUEST:
      case couponTypes.DELETE_COUPON_REQUEST:
         return {
            ...state,
            loading: true,
            error: null,
         };

      case couponTypes.ADD_COUPON_SUCCESS:
         return {
            ...state,
            loading: false,
            coupons: [...state.coupons, action.payload],
         };

      case couponTypes.GET_COUPONS_SUCCESS:
         return {
            ...state,
            loading: false,
            coupons: action.payload,
         };
      case couponTypes.GET_USERCOUPONS_SUCCESS:
         return {
            ...state,
            loading: false,
            coupons: action.payload,
         };

      case couponTypes.UPDATE_COUPON_SUCCESS:
         return {
            ...state,
            loading: false,
            coupons: state.coupons.map(coupon =>
               coupon._id === action.payload._id ? action.payload : coupon
            ),
         };

      case couponTypes.DELETE_COUPON_SUCCESS:
         return {
            ...state,
            loading: false,
            coupons: state.coupons.filter(coupon => coupon._id !== action.payload),
         };

      case couponTypes.ADD_COUPON_FAILURE:
      case couponTypes.GET_COUPONS_FAILURE:
      case couponTypes.GET_USERCOUPONS_FAILURE:
      case couponTypes.UPDATE_COUPON_FAILURE:
      case couponTypes.DELETE_COUPON_FAILURE:
         return {
            ...state,
            loading: false,
            error: action.payload,
         };

      default:
         return state;
   }
};

export default couponReducer;
