import { combineReducers } from 'redux';
import itemFocus from './itemFocus';
import list from './list';
import planner from './planner';
import search from './search';

const CombinedReducer = combineReducers({
  itemFocus: itemFocus,
  list: list,
  planner: planner,
  search: search,
});

export default CombinedReducer;
