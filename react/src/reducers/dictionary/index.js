import { combineReducers } from 'redux';
import list from './list';
import courseActive from './courseActive';
import search from './search';

const CombinedReducer = combineReducers({
  list: list,
  courseActive: courseActive,
  search: search,
});

export default CombinedReducer;
