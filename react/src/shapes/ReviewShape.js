import PropTypes from 'prop-types';

import NestedCourseShape from './NestedCourseShape';
import NestedLectureShape from './NestedLectureShape';


const reviewShape = PropTypes.shape({
  id: PropTypes.number.isRequired,
  course: NestedCourseShape.isRequired,
  lecture: NestedLectureShape.isRequired,
  comment: PropTypes.string.isRequired,
  like: PropTypes.number.isRequired,
  is_deleted: PropTypes.number.isRequired,
  grade: PropTypes.number.isRequired,
  load: PropTypes.number.isRequired,
  speech: PropTypes.number.isRequired,
  grade_letter: PropTypes.string.isRequired,
  load_letter: PropTypes.string.isRequired,
  speech_letter: PropTypes.string.isRequired,
});

export default reviewShape;
