import PropTypes from 'prop-types';

import nestedCourseShape from './NestedCourseShape';


const professorShape = PropTypes.shape({
  name: PropTypes.string.isRequired,
  name_en: PropTypes.string.isRequired,
  professor_id: PropTypes.number.isRequired,
  courses: PropTypes.arrayOf(nestedCourseShape).isRequired,
  has_review: PropTypes.bool.isRequired,
  grade: PropTypes.number.isRequired,
  load: PropTypes.number.isRequired,
  speech: PropTypes.number.isRequired,
  grade_letter: PropTypes.string.isRequired,
  load_letter: PropTypes.string.isRequired,
  speech_letter: PropTypes.string.isRequired,
});

export default professorShape;
