import cityTypes from './cityActionTypes';

const initialState = {
   cities: [
      { id: 1, name: "New York", status: true },
      { id: 2, name: "Los Angeles", status: false },
      { id: 3, name: "Chicago", status: true },
      { id: 4, name: "Houston", status: false },
      { id: 5, name: "Phoenix", status: true },
      { id: 6, name: "Philadelphia", status: false },
      { id: 7, name: "San Antonio", status: true },
      { id: 8, name: "San Diego", status: false },
   ],
   loading: false,
   error: null,
};

const cityReducer = (state = initialState, action) => {
   switch (action.type) {
      case cityTypes.ADD_CITY_REQUEST:
      case cityTypes.GET_CITIES_REQUEST:
      case cityTypes.UPDATE_CITY_REQUEST:
      case cityTypes.DELETE_CITY_REQUEST:
         return {
            ...state,
            loading: true,
            error: null,
         };

      case cityTypes.ADD_CITY_SUCCESS:
         return {
            ...state,
            loading: false,
            cities: [...state.cities, action.payload],
         };

      case cityTypes.GET_CITIES_SUCCESS:
         return {
            ...state,
            loading: false,
            cities: action.payload,
         };

      case cityTypes.UPDATE_CITY_SUCCESS:
         return {
            ...state,
            loading: false,
            cities: state.cities.map(city =>
               city.id === action.payload.id ? action.payload : city
            ),
         };

      case cityTypes.DELETE_CITY_SUCCESS:
         return {
            ...state,
            loading: false,
            cities: state.cities.filter(city => city.id !== action.payload),
         };

      case cityTypes.ADD_CITY_FAILURE:
      case cityTypes.GET_CITIES_FAILURE:
      case cityTypes.UPDATE_CITY_FAILURE:
      case cityTypes.DELETE_CITY_FAILURE:
         return {
            ...state,
            loading: false,
            error: action.payload,
         };

      default:
         return state;
   }
};

export default cityReducer;

