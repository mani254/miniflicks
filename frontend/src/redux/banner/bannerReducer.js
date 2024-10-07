import bannerTypes from "./bannerActionTypes";

const initialState = {
   banners: [],
   loading: false,
   error: null,
};

const bannerReducer = (state = initialState, action) => {
   switch (action.type) {
      case bannerTypes.ADD_BANNER_REQUEST:
      case bannerTypes.GET_BANNERS_REQUEST:
      case bannerTypes.UPDATE_BANNER_REQUEST:
      case bannerTypes.DELETE_BANNER_REQUEST:
         return {
            ...state,
            loading: true,
            error: null,
         };

      case bannerTypes.ADD_BANNER_SUCCESS:
         return {
            ...state,
            loading: false,
            banners: [...state.banners, action.payload],
         };

      case bannerTypes.GET_BANNERS_SUCCESS:
         return {
            ...state,
            loading: false,
            banners: action.payload,
         };

      case bannerTypes.UPDATE_BANNER_SUCCESS:
         return {
            ...state,
            loading: false,
            banners: state.banners.map(banner =>
               banner._id === action.payload._id ? action.payload : banner
            ),
         };

      case bannerTypes.DELETE_BANNER_SUCCESS:
         return {
            ...state,
            loading: false,
            banners: state.banners.filter(banner => banner._id !== action.payload),
         };

      case bannerTypes.ADD_BANNER_FAILURE:
      case bannerTypes.GET_BANNERS_FAILURE:
      case bannerTypes.UPDATE_BANNER_FAILURE:
      case bannerTypes.DELETE_BANNER_FAILURE:
         return {
            ...state,
            loading: false,
            error: action.payload,
         };

      default:
         return state;
   }
};

export default bannerReducer;
