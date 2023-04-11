import PropTypes from 'prop-types';

import courseShape from '../../model/subject/CourseShape';
import lectureShape from '../../model/subject/LectureShape';
import reviewShape from '../../model/review/ReviewShape';


const courseFocusShape = PropTypes.oneOfType([
  PropTypes.exact({
    course: PropTypes.oneOf([null]),
    reviews: PropTypes.oneOf([null]),
    lectures: PropTypes.oneOf([null]),
  }),
  PropTypes.exact({
    course: courseShape.isRequired,
    reviews: PropTypes.arrayOf(reviewShape),
    lectures: PropTypes.arrayOf(lectureShape),
  }),
]);

export default courseFocusShape;
