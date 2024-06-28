import { SIGN_IN_SUCCESS, SIGN_IN_FAILURE, SIGN_IN_START } from "./adminActionTypes";
import axios from "axios";

export const signInSuccess = (admin) => ({
   type: SIGN_IN_SUCCESS,
   payload: admin,
});

export const signInFailure = (error) => ({
   type: SIGN_IN_FAILURE,
   payload: error,
});

export const signInStart = () => ({
   type: SIGN_IN_START,
});


export const adminLogin = ({ email, password }) => {
   return async (dispatch) => {
      dispatch(signInStart());
      try {
         const res = await axios.post(`${process.env.REACT_APP_BACKENDURI}/api/auth/loginAdmin`, { email, password });
         dispatch(signInSuccess(res.data.admin));
         localStorage.setItem("adminAuthToken", res.data.token);
         return Promise.resolve();
      } catch (err) {
         dispatch(signInFailure(err.response ? err.response.data.error : "Network Error"));
         return Promise.reject(err);
      }
   };
};


export const initialSignIn = (token) => {
   return async (dispatch) => {
      dispatch(signInStart());
      try {
         const res = await axios.post(`/api/auth/initialLogin`, { token });
         dispatch(signInSuccess(res.data));
         return Promise.resolve();
      } catch (err) {
         dispatch(signInFailure(err.response ? err.response.data.error : "Network Error"));
         return Promise.reject(err);
      }
   };
};

export const adminLogout = () => {
   return (dispatch) => {
      localStorage.removeItem("adminAuthToken");
      dispatch(signInSuccess(null));
   };
};
