import { combineReducers } from 'redux';
import courseFocus from './courseFocus';
import list from './list';
import search from './search';

const CombinedReducer = combineReducers({
  courseFocus: courseFocus,
  list: list,
  search: search,
});

export default CombinedReducer;
