import PropTypes from 'prop-types';

import { ReviewsFocusFrom } from '../../reducers/write-reviews/reviewsFocus';

import lectureShape from '../model/LectureShape';
import reviewShape from '../model/ReviewShape';


const reviewsFocusShape = PropTypes.exact({
  from: PropTypes.oneOf(Object.values(ReviewsFocusFrom)).isRequired,
  lecture: lectureShape,
  reviews: PropTypes.arrayOf(reviewShape),
});

export default reviewsFocusShape;
