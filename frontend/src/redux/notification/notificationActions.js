// notificationActions.js
import { SHOW_NOTIFICATION, HIDE_NOTIFICATION } from "./notificationActionTypes";

export const showNotification = (message) => ({
   type: SHOW_NOTIFICATION,
   payload: message,
});

export const hideNotification = (id) => ({
   type: HIDE_NOTIFICATION,
   payload: id,
});