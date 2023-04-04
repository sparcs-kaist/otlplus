import PropTypes from 'prop-types';
import courseShape from '../subject/CourseShape';
import lectureShape from '../subject/LectureShape';


const takenPlannerItemShape = PropTypes.exact({
  id: PropTypes.number.isRequired,
  item_type: PropTypes.oneOf(['TAKEN']).isRequired,
  is_excluded: PropTypes.bool.isRequired,
  lecture: lectureShape.isRequired,
  course: courseShape.isRequired,
});

export default takenPlannerItemShape;
