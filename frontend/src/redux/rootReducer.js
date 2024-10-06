import { combineReducers } from "redux";

import modalReducer from "./modal/modalReducer";
import notificationReducer from "./notification/notificationReducer";
import cityReducer from "./citiy/cityReducer";
import locationReducer from "./location/locationReducer";
import couponReducer from "./coupon/couponReducer";

const rootReducer = combineReducers({
   modal: modalReducer,
   notification: notificationReducer,
   cities: cityReducer,
   locations: locationReducer,
   coupons: couponReducer
})

export default rootReducer;
