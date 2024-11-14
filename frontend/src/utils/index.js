import fingerImage from '../assets/finger.webp'
import star from '../assets/star.png'
import mfLogo from '../assets/mf-logo.png';

import addonAvailable from '../assets/addon-available.svg'
import addonUnavailable from '../assets/addon-unavailable.svg'

import instagramColoured from '../assets/icons/instagram-coloured.svg'
import facebookColoured from '../assets/icons/facebook-coloured.svg'
import twitterColoured from '../assets/icons/twitter-coloured.svg'
import youtbeColoured from '../assets/icons/youtube-coloured.svg'
import whatsappColoured from '../assets/icons/whatsapp-coloured.svg'


import cake from '../assets/services/cake.webp';
import candlePath from '../assets/services/candle-path-2.webp';
import coolDrink from '../assets/services/cool-drink.webp'
import decoration from '../assets/services/decoration.webp'
import gift from '../assets/services/gifts.webp'
import ledName from '../assets/services/led-name.webp'
import boquet from '../assets/services/boquet.webp'

export { fingerImage, star, mfLogo }

export { addonAvailable, addonUnavailable }

export { instagramColoured, facebookColoured, twitterColoured, youtbeColoured, whatsappColoured }

export { cake, candlePath, coolDrink, decoration, gift, ledName, boquet }



export function validation(action, value) {
   switch (action) {
      case "name":
      case "admin.name":
         if (!value || value.trim() === '') {
            return "Name is required.";
         }
         return "";

      case "email":
      case "admin.email":
         const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
         if (!emailRegex.test(value)) {
            return "Invalid email address";
         }
         return "";

      case "password":
      case "admin.password":
         const passwordRegex = /^(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{6,}$/;
         if (!passwordRegex.test(value)) {
            return "Atleast 6 charecters and 1 special symbol";
         }
         return "";

      case "number":
      case "admin.number":
         if (value.length !== 10 || !/^\d+$/.test(value)) {
            return "Phone number must be exactly 10 digits.";
         }
         return "";

      default:
         return "";
   }
}
