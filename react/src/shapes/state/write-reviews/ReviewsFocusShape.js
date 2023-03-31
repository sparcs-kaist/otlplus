import PropTypes from 'prop-types';

import { ReviewsFocusFrom } from '../../../reducers/write-reviews/reviewsFocus';

import lectureShape from '../../model/subject/LectureShape';
import reviewShape from '../../model/review/ReviewShape';


const reviewsFocusShape = PropTypes.exact({
  from: PropTypes.oneOf(Object.values(ReviewsFocusFrom)).isRequired,
  lecture: lectureShape,
  reviews: PropTypes.arrayOf(reviewShape),
});

export default reviewsFocusShape;
