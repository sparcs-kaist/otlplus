import PropTypes from 'prop-types';

import { ReviewsFocusFrom } from '../../../reducers/write-reviews/reviewsFocus';

import lectureShape from '../../model/subject/LectureShape';
import reviewShape from '../../model/review/ReviewShape';


const reviewsFocusShape = PropTypes.oneOfType([
  PropTypes.exact({
    from: PropTypes.oneOf([ReviewsFocusFrom.NONE]).isRequired,
    lecture: PropTypes.oneOf([null]),
    reviews: PropTypes.oneOf([null]),
  }),
  PropTypes.exact({
    from: PropTypes.oneOf([ReviewsFocusFrom.LECTURE]).isRequired,
    lecture: lectureShape.isRequired,
    reviews: PropTypes.arrayOf(reviewShape),
  }),
  PropTypes.exact({
    from: PropTypes.oneOf([
      ReviewsFocusFrom.REVIEWS_LATEST,
      ReviewsFocusFrom.REVIEWS_MY,
      ReviewsFocusFrom.REVIEWS_LIKED,
      ReviewsFocusFrom.REVIEWS_RANKED,
    ]).isRequired,
    lecture: PropTypes.oneOf([null]),
    reviews: PropTypes.arrayOf(reviewShape),
  }),
]);

export default reviewsFocusShape;
