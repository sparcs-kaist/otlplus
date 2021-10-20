import PropTypes from 'prop-types';

import nestedCourseShape from './NestedCourseShape';
import nestedLectureShape from './NestedLectureShape';


const reviewShape = PropTypes.shape({
  id: PropTypes.number.isRequired,
  course: nestedCourseShape.isRequired,
  lecture: nestedLectureShape.isRequired,
  content: PropTypes.string.isRequired,
  like: PropTypes.number.isRequired,
  is_deleted: PropTypes.number.isRequired,
  grade: PropTypes.number.isRequired,
  load: PropTypes.number.isRequired,
  speech: PropTypes.number.isRequired,
  userspecific_is_liked: PropTypes.bool.isRequired,
});

export default reviewShape;
