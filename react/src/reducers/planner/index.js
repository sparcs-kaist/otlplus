import { combineReducers } from 'redux';
import courseFocus from './courseFocus';
import list from './list';
import planner from './planner';
import search from './search';

const CombinedReducer = combineReducers({
  courseFocus: courseFocus,
  list: list,
  planner: planner,
  search: search,
});

export default CombinedReducer;
