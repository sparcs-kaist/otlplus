import { combineReducers } from 'redux';
import user from './user';
import semester from './semester';

const CombinedReducer = combineReducers({
  user: user,
  semester: semester,
});

export default CombinedReducer;
