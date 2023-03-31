import PropTypes from 'prop-types';

import nestedCourseShape from './NestedCourseShape';


const professorShape = PropTypes.exact({
  name: PropTypes.string.isRequired,
  name_en: PropTypes.string.isRequired,
  professor_id: PropTypes.number.isRequired,
  review_total_weight: PropTypes.number.isRequired,
  courses: PropTypes.arrayOf(nestedCourseShape).isRequired,
  grade: PropTypes.number.isRequired,
  load: PropTypes.number.isRequired,
  speech: PropTypes.number.isRequired,
});

export default professorShape;
