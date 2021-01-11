import PropTypes from 'prop-types';

import {
  NONE, LECTURE, LATEST, MY, LIKED,
} from '../reducers/write-reviews/reviewsFocus';

import lectureShape from './LectureShape';
import reviewShape from './ReviewShape';


const reviewsFocusShape = PropTypes.shape({
  from: PropTypes.oneOf([NONE, LECTURE, LATEST, MY, LIKED]).isRequired,
  lecture: lectureShape,
  reviews: PropTypes.arrayOf(reviewShape),
});

export default reviewsFocusShape;
