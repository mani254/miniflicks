import { combineReducers } from "redux";

import modalReducer from "./modal/modalReducer";
import notificationReducer from "./notification/notificationReducer";
import cityReducer from "./citiy/cityReducer";
import locationReducer from "./location/locationReducer";
import couponReducer from "./coupon/couponReducer";
import bannerReducer from "./banner/bannerReducer";
import giftReducer from "./gift/giftReducer";
import addonReducer from "./addon/addonReducer";

const rootReducer = combineReducers({
   modal: modalReducer,
   notification: notificationReducer,
   cities: cityReducer,
   locations: locationReducer,
   coupons: couponReducer,
   banners: bannerReducer,
   gifts: giftReducer,
   addons: addonReducer,
})

export default rootReducer;
