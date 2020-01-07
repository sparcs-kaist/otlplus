import PropTypes from 'prop-types';
import lectureShape from './LectureShape';
import reviewShape from './ReviewShape';
import DepartmentShape from './DepartmentShape';


const userShape = PropTypes.shape({
  id: PropTypes.number.isRequired,
  email: PropTypes.string.isRequired,
  student_id: PropTypes.string.isRequired,
  firstName: PropTypes.string.isRequired,
  lastName: PropTypes.string.isRequired,
  departments: PropTypes.arrayOf(DepartmentShape).isRequired,
  favorite_departments: PropTypes.arrayOf(DepartmentShape),
  taken_lectures: PropTypes.arrayOf(lectureShape).isRequired,
  reviews: PropTypes.arrayOf(reviewShape).isRequired,
});

export default userShape;
