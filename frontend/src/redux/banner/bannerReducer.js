// bannerReducer.js
import * as types from './bannerActionsTypes';

const initialState = {
   banners: [],
   getLoading: false,
   addLoading: false,
   updateLoading: false,
   deleteLoading: false,
   error: null
};

const bannerReducer = (state = initialState, action) => {
   switch (action.type) {
      case types.ADD_BANNER:
         return {
            ...state,
            addLoading: true
         };
      case types.ADD_BANNER_SUCCESS:
         return {
            ...state,
            banners: [...state.banners, action.payload],
            addLoading: false,
            error: null
         };
      case types.ADD_BANNER_FAILURE:
         return {
            ...state,
            addLoading: false,
            error: action.payload
         };
      case types.GET_BANNERS:
         return {
            ...state,
            getLoading: true
         };
      case types.GET_BANNERS_SUCCESS:
         return {
            ...state,
            banners: action.payload,
            getLoading: false,
            error: null
         };
      case types.GET_BANNERS_FAILURE:
         return {
            ...state,
            getLoading: false,
            error: action.payload
         };
      case types.UPDATE_BANNER:
         return {
            ...state,
            updateLoading: true
         };
      case types.UPDATE_BANNER_SUCCESS:
         const updatedBanners = state.banners.map(banner => {
            if (banner._id === action.payload._id) {
               return action.payload;
            }
            return banner;
         });
         return {
            ...state,
            banners: updatedBanners,
            updateLoading: false,
            error: null
         };
      case types.UPDATE_BANNER_FAILURE:
         return {
            ...state,
            updateLoading: false,
            error: action.payload
         };
      case types.DELETE_BANNER_SUCCESS:
         const changedBanners = state.banners.filter(banner => banner._id !== action.payload);
         return {
            ...state,
            banners: changedBanners,
            deleteLoading: false,
            error: null
         };
      case types.DELETE_BANNER_FAILURE:
         return {
            ...state,
            deleteLoading: false,
            error: action.payload
         };
      case types.UPDATE_BANNER_STATUS:
         return {
            ...state,
            updateLoading: true
         };
      case types.UPDATE_BANNER_STATUS_SUCCESS:
         const updatedStatusBanners = state.banners.map(banner => {
            if (banner._id === action.payload._id) {
               return {
                  ...banner,
                  status: action.payload.status
               };
            }
            return banner;
         });
         return {
            ...state,
            banners: updatedStatusBanners,
            updateLoading: false,
            error: null
         };
      case types.UPDATE_BANNER_STATUS_FAILURE:
         return {
            ...state,
            updateLoading: false,
            error: action.payload
         };
      default:
         return state;
   }
};

export default bannerReducer;
