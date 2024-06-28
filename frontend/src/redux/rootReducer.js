import { combineReducers } from "redux";

import adminReducer from "./admin/adminReducer";
import modalReducer from "./modal/modalReducer";
import notificationReducer from "./notification/notificationReducer";
import cityReducer from "./city/cityReducer";
import locationReducer from "./location/locationReducer";
import bannerReducer from "./banner/bannerReducer";

const rootReducer = combineReducers(
   {
      admin: adminReducer,
      modal: modalReducer,
      notification: notificationReducer,
      city: cityReducer,
      location: locationReducer,
      banner: bannerReducer
   }
);


export default rootReducer;