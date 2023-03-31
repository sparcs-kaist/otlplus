import PropTypes from 'prop-types';

import courseShape from '../../model/subject/CourseShape';
import lectureShape from '../../model/subject/LectureShape';
import reviewShape from '../../model/review/ReviewShape';


const courseFocusShape = PropTypes.exact({
  course: courseShape,
  reviews: PropTypes.arrayOf(reviewShape),
  lectures: PropTypes.arrayOf(lectureShape),
});

export default courseFocusShape;
