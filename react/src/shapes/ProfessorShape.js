import PropTypes from 'prop-types';

import NestedCourseShape from './NestedCourseShape';


const ProfessorShape = PropTypes.shape({
  name: PropTypes.string.isRequired,
  professor_id: PropTypes.number.isRequired,
  courses: PropTypes.arrayOf(NestedCourseShape).isRequired,
  has_review: PropTypes.bool.isRequired,
  grade: PropTypes.number.isRequired,
  load: PropTypes.number.isRequired,
  speech: PropTypes.number.isRequired,
  grade_letter: PropTypes.string.isRequired,
  load_letter: PropTypes.string.isRequired,
  speech_letter: PropTypes.string.isRequired,
});

export default ProfessorShape;
