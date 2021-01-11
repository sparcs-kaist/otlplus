import { combineReducers } from 'redux';
import reviewsFocus from './reviewsFocus';
import latestReviews from './latestReviews';
import likedReviews from './likedReviews';

const CombinedReducer = combineReducers({
  reviewsFocus: reviewsFocus,
  latestReviews: latestReviews,
  likedReviews: likedReviews,
});

export default CombinedReducer;
