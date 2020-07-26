import { createStore } from "redux";
import rootReducer from "../reduxReducers/Index";

export default function configureStore(initialState){
    return createStore(
        rootReducer,
        initialState
    );
}
