import authTypes from "./authActionTypes";
import axios from 'axios';
import { showNotification } from "../notification/notificationActions";

export const loginRequest = () => ({
   type: authTypes.LOGIN_REQUEST,
});

export const loginSuccess = (user) => ({
   type: authTypes.LOGIN_SUCCESS,
   payload: user
});

export const loginFailure = (error) => ({
   type: authTypes.LOGIN_FAILURE,
   payload: error,
});

export const login = (logInDetails) => {
   return async (dispatch) => {
      dispatch(loginRequest());
      try {
         const res = await axios.post(`${import.meta.env.VITE_APP_BACKENDURI}/api/auth/login`, logInDetails);
         dispatch(loginSuccess(res.data));
         localStorage.setItem('authToken', res.data.token);
         dispatch(showNotification('Login successful'));
         return Promise.resolve(res.data.admin);
      } catch (err) {
         const errorMessage = err.response ? err.response.data.error : 'Network Error';
         dispatch(loginFailure(errorMessage));
         dispatch(showNotification(errorMessage));
         return Promise.reject(err);
      }
   };
};

export const regRequest = () => ({
   type: authTypes.REG_REQUEST,
});

export const regSuccess = (user) => ({
   type: authTypes.REG_SUCCESS,
   payload: user
});

export const regFailure = (error) => ({
   type: authTypes.REG_FAILURE,
   payload: error,
});

export const registerSuperAdmin = (token) => {
   return async (dispatch) => {
      dispatch(regRequest());
      try {
         const res = await axios.post(`${import.meta.env.VITE_APP_BACKENDURI}/api/auth/register`, token);
         dispatch(regSuccess(res.data));
         dispatch(showNotification('Registraion successful'));
         return Promise.resolve();
      } catch (err) {
         const errorMessage = err.response ? err.response.data.error : 'Network Error';
         dispatch(regFailure(errorMessage));
         dispatch(showNotification(errorMessage));
         return Promise.reject(err);
      }
   };
};

export const initialLoginRequest = () => ({
   type: authTypes.INITIAL_LOGIN_REQUEST,
});

export const initialLoginSuccess = (user) => ({
   type: authTypes.INITIAL_LOGIN_SUCCESS,
   payload: user
});

export const initialLoginFailure = (error) => ({
   type: authTypes.INITIAL_LOGIN_FAILURE,
   payload: error,
});

export const initialLogin = (token) => {
   return async (dispatch) => {
      dispatch(initialLoginRequest());
      try {
         const res = await axios.post(`${import.meta.env.VITE_APP_BACKENDURI}/api/auth/initialLogin`, { token });
         dispatch(initialLoginSuccess(res.data));
         return Promise.resolve(res.data);
      } catch (err) {
         const errorMessage = err.response ? err.response.data.error : 'Network Error';
         dispatch(initialLoginFailure(errorMessage));
         // dispatch(showNotification(errorMessage));
         return Promise.reject(err)
      }
   };
};

export const logOutSuccess = () => ({
   type: 'LOGOUT_SUCCESS',
})

export const logout = () => {
   return async (dispatch) => {
      dispatch(loginRequest());
      try {
         localStorage.setItem('authToken', "");
         const res = await axios.post(`${import.meta.env.VITE_APP_BACKENDURI}/api/auth/logout`);
         dispatch(logOutSuccess())
         return Promise.resolve(res.data.admin);
      } catch (err) {
         const errorMessage = err.response ? err.response.data.error : 'Network Error';
         dispatch(showNotification(errorMessage));
         return Promise.reject(err);
      }
   };
};


