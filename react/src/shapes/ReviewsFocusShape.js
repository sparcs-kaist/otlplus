import PropTypes from 'prop-types';

import { ReviewsFocusFrom } from '../reducers/write-reviews/reviewsFocus';

import lectureShape from './LectureShape';
import reviewShape from './ReviewShape';


const reviewsFocusShape = PropTypes.shape({
  from: PropTypes.oneOf(Object.values(ReviewsFocusFrom)).isRequired,
  lecture: lectureShape,
  reviews: PropTypes.arrayOf(reviewShape),
});

export default reviewsFocusShape;
