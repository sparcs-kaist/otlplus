import PropTypes from 'prop-types';
import courseShape from './CourseShape';
import lectureShape from './LectureShape';


const takenPlannerItemShape = PropTypes.exact({
  id: PropTypes.number.isRequired,
  type: PropTypes.string.isRequired,
  lecture: lectureShape.isRequired,
  course: courseShape.isRequired,
});

export default takenPlannerItemShape;
