import { combineReducers } from 'redux';
import user from './user';

const CombinedReducer = combineReducers({
    user: user,
});

export default CombinedReducer;
