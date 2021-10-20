import PropTypes from 'prop-types';

import courseShape from './CourseShape';
import lectureShape from './LectureShape';
import reviewShape from './ReviewShape';


const courseFocusShape = PropTypes.shape({
  course: courseShape,
  reviews: PropTypes.arrayOf(reviewShape),
  lectures: PropTypes.arrayOf(lectureShape),
});

export default courseFocusShape;
