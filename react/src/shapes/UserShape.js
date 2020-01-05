import PropTypes from 'prop-types';
import lectureShape from './LectureShape';
import reviewShape from './ReviewShape';


const userShape = PropTypes.shape({
  email: PropTypes.string.isRequired,
  student_id: PropTypes.string.isRequired,
  firstName: PropTypes.string.isRequired,
  lastName: PropTypes.string.isRequired,
  departments: PropTypes.arrayOf(PropTypes.shape({
    code: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    name_en: PropTypes.string.isRequired,
  })).isRequired,
  taken_lectures: PropTypes.arrayOf(lectureShape).isRequired,
  reviews: PropTypes.arrayOf(reviewShape).isRequired,
});

export default userShape;
