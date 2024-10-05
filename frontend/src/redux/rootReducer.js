import { combineReducers } from "redux";

import modalReducer from "./modal/modalReducer";
import notificationReducer from "./notification/notificationReducer";
import cityReducer from "./citiy/cityReducer";
import locationReducer from "./location/locationReducer";

const rootReducer = combineReducers({
   modal: modalReducer,
   notification: notificationReducer,
   cities: cityReducer,
   locations: locationReducer
})

export default rootReducer;
