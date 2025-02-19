import { combineReducers } from "redux";

import modalReducer from "./modal/modalReducer";
import notificationReducer from "./notification/notificationReducer";
import cityReducer from "./citiy/cityReducer";
import locationReducer from "./location/locationReducer";
import couponReducer from "./coupon/couponReducer";
import bannerReducer from "./banner/bannerReducer";
import giftReducer from "./gift/giftReducer";
import addonReducer from "./addon/addonReducer";
import screenReducer from "./screen/screenReducer";
import bookingReducer from "./booking/bookingReducer";
import customerReducer from "./customer/customerReducer";
import authReducer from './auth/authReducer'
import customerBookingReducer from "./customerBooking/customerBookingReducer";
import occasionReducer from "./occasion/occasionReducer";
import cakeReducer from './cake/cakeReducer'

const rootReducer = combineReducers({
   modal: modalReducer,
   notification: notificationReducer,
   cities: cityReducer,
   locations: locationReducer,
   coupons: couponReducer,
   banners: bannerReducer,
   gifts: giftReducer,
   addons: addonReducer,
   occasions: occasionReducer,
   screens: screenReducer,
   bookings: bookingReducer,
   customers: customerReducer,
   auth: authReducer,
   customerBooking: customerBookingReducer,
   cakes: cakeReducer
})

export default rootReducer;
