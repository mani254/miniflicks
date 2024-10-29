// middleware/localStorageMiddleware.js

export const saveToLocalStorage = (store) => (next) => (action) => {
   const result = next(action);
   const customerBookingState = store.getState().customerBooking;
   localStorage.setItem("customerBooking", JSON.stringify(customerBookingState));
   return result;
};
