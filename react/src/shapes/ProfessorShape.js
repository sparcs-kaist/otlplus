import PropTypes from 'prop-types';

import nestedCourseShape from './NestedCourseShape';


const professorShape = PropTypes.shape({
  name: PropTypes.string.isRequired,
  name_en: PropTypes.string.isRequired,
  professor_id: PropTypes.number.isRequired,
  review_num: PropTypes.number.isRequired,
  courses: PropTypes.arrayOf(nestedCourseShape).isRequired,
  grade: PropTypes.number.isRequired,
  load: PropTypes.number.isRequired,
  speech: PropTypes.number.isRequired,
});

export default professorShape;
