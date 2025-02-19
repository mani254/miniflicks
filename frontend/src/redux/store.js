import { legacy_createStore, applyMiddleware, compose } from "redux";
import rootReducer from "./rootReducer";
import { thunk } from "redux-thunk";
import { saveToLocalStorage } from "./localStorageMiddleware";

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = legacy_createStore(rootReducer, composeEnhancers(applyMiddleware(thunk, saveToLocalStorage)));

export default store;