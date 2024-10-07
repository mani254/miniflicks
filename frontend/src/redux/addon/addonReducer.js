import addonTypes from "./addonActionTypes";

const initialState = {
   addons: [],
   loading: false,
   error: null,
};

const addonReducer = (state = initialState, action) => {
   switch (action.type) {
      case addonTypes.ADD_ADDON_REQUEST:
      case addonTypes.GET_ADDONS_REQUEST:
      case addonTypes.UPDATE_ADDON_REQUEST:
      case addonTypes.DELETE_ADDON_REQUEST:
         return {
            ...state,
            loading: true,
            error: null,
         };

      case addonTypes.ADD_ADDON_SUCCESS:
         return {
            ...state,
            loading: false,
            addons: [...state.addons, action.payload],
         };

      case addonTypes.GET_ADDONS_SUCCESS:
         return {
            ...state,
            loading: false,
            addons: action.payload,
         };

      case addonTypes.UPDATE_ADDON_SUCCESS:
         return {
            ...state,
            loading: false,
            addons: state.addons.map(addon =>
               addon._id === action.payload._id ? action.payload : addon
            ),
         };

      case addonTypes.DELETE_ADDON_SUCCESS:
         return {
            ...state,
            loading: false,
            addons: state.addons.filter(addon => addon._id !== action.payload),
         };

      case addonTypes.ADD_ADDON_FAILURE:
      case addonTypes.GET_ADDONS_FAILURE:
      case addonTypes.UPDATE_ADDON_FAILURE:
      case addonTypes.DELETE_ADDON_FAILURE:
         return {
            ...state,
            loading: false,
            error: action.payload,
         };

      default:
         return state;
   }
};

export default addonReducer;
