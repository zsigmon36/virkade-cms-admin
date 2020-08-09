import {combineReducers} from 'redux';
import userReducer from './UserReducer';
import sharedFlagsReducer from './SharedFlagsReducer';
import alertReducer from './AleartReducer';

const rootReducer = combineReducers({
    user:userReducer,
    sharedFlags:sharedFlagsReducer,
    alert:alertReducer,
})

export default rootReducer