import { combineReducers } from 'redux';
import lectureSelected from './lectureSelected';

const CombinedReducer = combineReducers({
  lectureSelected: lectureSelected,
});

export default CombinedReducer;
