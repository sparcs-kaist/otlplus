import { combineReducers } from 'redux';
import list from './list';

const CombinedReducer = combineReducers({
  list: list,
});

export default CombinedReducer;
