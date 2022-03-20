import PropTypes from 'prop-types';

import courseShape from '../model/CourseShape';
import lectureShape from '../model/LectureShape';
import reviewShape from '../model/ReviewShape';

const courseFocusShape = PropTypes.shape({
  course: courseShape,
  reviews: PropTypes.arrayOf(reviewShape),
  lectures: PropTypes.arrayOf(lectureShape),
});

export default courseFocusShape;
