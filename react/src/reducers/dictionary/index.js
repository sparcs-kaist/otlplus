import { combineReducers } from 'redux';
import list from './list';
import courseActive from './courseActive';

const CombinedReducer = combineReducers({
  list: list,
  courseActive: courseActive,
});

export default CombinedReducer;
