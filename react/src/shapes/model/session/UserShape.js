import PropTypes from 'prop-types';
import lectureShape from '../subject/LectureShape';
import reviewShape from '../review/ReviewShape';
import departmentShape from '../subject/DepartmentShape';


const userShape = PropTypes.exact({
  id: PropTypes.number.isRequired,
  email: PropTypes.string.isRequired,
  student_id: PropTypes.string.isRequired,
  firstName: PropTypes.string.isRequired,
  lastName: PropTypes.string.isRequired,
  majors: PropTypes.arrayOf(departmentShape).isRequired,
  department: departmentShape,
  departments: PropTypes.arrayOf(departmentShape).isRequired,
  favorite_departments: PropTypes.arrayOf(departmentShape),
  review_writable_lectures: PropTypes.arrayOf(lectureShape).isRequired,
  my_timetable_lectures: PropTypes.arrayOf(lectureShape).isRequired,
  reviews: PropTypes.arrayOf(reviewShape).isRequired,
});

export default userShape;
