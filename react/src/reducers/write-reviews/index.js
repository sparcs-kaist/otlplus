import { combineReducers } from 'redux';
import lectureSelected from './lectureSelected';
import latestReviews from './latestReviews';

const CombinedReducer = combineReducers({
  lectureSelected: lectureSelected,
  latestReviews: latestReviews,
});

export default CombinedReducer;
