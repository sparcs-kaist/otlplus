import PropTypes from 'prop-types';

import departmentShape from './DepartmentShape';
import nestedCourseShape from './NestedCourseShape';
import nestedProfessorShape from './NestedProfessorShape';


const courseShape = PropTypes.exact({
  id: PropTypes.number.isRequired,
  old_code: PropTypes.string.isRequired,
  department: departmentShape,
  type: PropTypes.string.isRequired,
  type_en: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  title_en: PropTypes.string.isRequired,
  summary: PropTypes.string.isRequired,
  review_total_weight: PropTypes.number.isRequired,
  credit: PropTypes.number.isRequired,
  credit_au: PropTypes.number.isRequired,
  num_classes: PropTypes.number.isRequired,
  num_labs: PropTypes.number.isRequired,
  related_courses_prior: PropTypes.arrayOf(nestedCourseShape).isRequired,
  related_courses_posterior: PropTypes.arrayOf(nestedCourseShape).isRequired,
  professors: PropTypes.arrayOf(nestedProfessorShape).isRequired,
  grade: PropTypes.number.isRequired,
  load: PropTypes.number.isRequired,
  speech: PropTypes.number.isRequired,
  userspecific_is_read: PropTypes.bool.isRequired,
});

export default courseShape;
