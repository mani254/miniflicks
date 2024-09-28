import { combineReducers } from "redux";

import modalReducer from "./modal/modalReducer";

const rootReducer = combineReducers({
   modal: modalReducer,
})

export default rootReducer;
