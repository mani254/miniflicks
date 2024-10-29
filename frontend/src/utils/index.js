import fingerImage from '../assets/finger.webp'
import star from '../assets/star.png'
import mfLogo from '../assets/mf-logo.png';

import addonAvailable from '../assets/addon-available.svg'
import addonUnavailable from '../assets/addon-unavailable.svg'

export { fingerImage, star, mfLogo }

export { addonAvailable, addonUnavailable }

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
