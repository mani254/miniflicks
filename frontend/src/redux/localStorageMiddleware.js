// middleware/localStorageMiddleware.js

export const saveToLocalStorage = (store) => (next) => (action) => {
   const result = next(action);
   const customerBookingState = store.getState().customerBooking;

   // Check if the customerBookingState has meaningful data
   if (customerBookingState && customerBookingState.city) {
      localStorage.setItem("customerBooking", JSON.stringify(customerBookingState));
   }
   return result;
};

