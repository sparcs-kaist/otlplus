import PropTypes from 'prop-types';
import lectureShape from './LectureShape';
import reviewShape from './ReviewShape';
import departmentShape from './DepartmentShape';


const userShape = PropTypes.shape({
  id: PropTypes.number.isRequired,
  email: PropTypes.string.isRequired,
  student_id: PropTypes.string.isRequired,
  firstName: PropTypes.string.isRequired,
  lastName: PropTypes.string.isRequired,
  majors: PropTypes.arrayOf(departmentShape).isRequired,
  departments: PropTypes.arrayOf(departmentShape).isRequired,
  favorite_departments: PropTypes.arrayOf(departmentShape),
  review_writable_lectures: PropTypes.arrayOf(lectureShape).isRequired,
  my_timetable_lectures: PropTypes.arrayOf(lectureShape).isRequired,
  reviews: PropTypes.arrayOf(reviewShape).isRequired,
});

export default userShape;
