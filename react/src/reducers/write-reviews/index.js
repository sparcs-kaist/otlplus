import { combineReducers } from 'redux';
import reviewsFocus from './reviewsFocus';
import latestReviews from './latestReviews';

const CombinedReducer = combineReducers({
  reviewsFocus: reviewsFocus,
  latestReviews: latestReviews,
});

export default CombinedReducer;
