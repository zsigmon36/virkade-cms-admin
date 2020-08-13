import {combineReducers} from 'redux';
import userReducer from './UserReducer';
import sharedFlagsReducer from './SharedFlagsReducer';
import alertReducer from './AleartReducer';
import searchFilterReducer from './SearchFilterReducer';

const rootReducer = combineReducers({
    user:userReducer,
    sharedFlags:sharedFlagsReducer,
    alert:alertReducer,
    searchFilter:searchFilterReducer,
})

export default rootReducer