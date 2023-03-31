import PropTypes from 'prop-types';
import nestedCourseShape from './NestedCourseShape';
import nestedLectureShape from './NestedLectureShape';


const takenPlannerItemShape = PropTypes.exact({
  id: PropTypes.number.isRequired,
  type: PropTypes.string.isRequired,
  lecture: nestedLectureShape.isRequired,
  course: nestedCourseShape.isRequired,
});

export default takenPlannerItemShape;
