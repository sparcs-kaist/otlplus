import PropTypes from 'prop-types';
import courseShape from '../subject/CourseShape';
import lectureShape from '../subject/LectureShape';


const takenPlannerItemShape = PropTypes.exact({
  id: PropTypes.number.isRequired,
  type: PropTypes.string.isRequired,
  lecture: lectureShape.isRequired,
  course: courseShape.isRequired,
});

export default takenPlannerItemShape;
