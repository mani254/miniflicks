import { SHOW_NOTIFICATION, HIDE_NOTIFICATION } from "./notificationActionTypes";

const initialState = {
   notifications: [],
};

const notificationReducer = (state = initialState, action) => {
   switch (action.type) {
      case SHOW_NOTIFICATION:
         return {
            notifications: [...state.notifications, { id: Date.now(), message: action.payload }],
         };
      case HIDE_NOTIFICATION:
         return {
            notifications: state.notifications.filter((notification) => notification.id !== action.payload),
         };
      default:
         return state;
   }
};

export default notificationReducer;