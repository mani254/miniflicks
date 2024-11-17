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

import aboutEdited from '../assets/about-edited.png'

import cake from '../assets/services/cake.webp';
import candlePath from '../assets/services/candle-path-2.webp';
import coolDrink from '../assets/services/cool-drink.webp'
import decoration from '../assets/services/decoration.webp'
import gift from '../assets/services/gifts.webp'
import ledName from '../assets/services/led-name.webp'
import boquet from '../assets/services/boquet.webp'


import dolby from '../assets/icons/dolby.svg'
import screen from '../assets/icons/hd.svg'
import lighting from '../assets/icons/lighting.svg'
import reception from '../assets/icons/reception.svg'
import sofa from '../assets/icons/sofa.svg'
import wifi from '../assets/icons/wifi.svg'

import contactBalloon from '../assets/contact-balloon.webp'
import contactBreadcrumb from '../assets/contact-breadcrumb.jpg'

import aboutBreadcrumb from '../assets/miniflicks-about-image.webp'

import paperEffectImage from '../assets/home-about-image-1.png'

import googleReview from '../assets/icons/google-reviews.png'
import celebration from '../assets/icons/celebration.webp'

import cta from '../assets/cta.png'

import miniflicksCartoon from '../assets/videos/miniflicks-cartoon.mp4'

export { fingerImage, star, mfLogo }

export { addonAvailable, addonUnavailable }

export { instagramColoured, facebookColoured, twitterColoured, youtbeColoured, whatsappColoured }

export { cake, candlePath, coolDrink, decoration, gift, ledName, boquet }

export { contactBalloon, contactBreadcrumb }

export { aboutBreadcrumb, aboutEdited }

export { dolby, screen, lighting, reception, sofa, wifi }

export { paperEffectImage }

export { googleReview, celebration, cta }

export { miniflicksCartoon }



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


const socialMediaLinks = [
   { href: "https://www.instagram.com/miniflicks_marathahalli", title: "Instagram", src: instagramColoured, alt: "Instagram" },
   { href: "https://youtube.com/miniflicks", title: "YouTube", src: youtbeColoured, alt: "YouTube" },
   { href: "https://facebook.com/miniflicks", title: "Facebook", src: facebookColoured, alt: "Facebook" },
   { href: "https://wa.me/miniflicks", title: "WhatsApp", src: whatsappColoured, alt: "WhatsApp" },
];

export { socialMediaLinks }