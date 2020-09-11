import PropTypes from 'prop-types';

import departmentShape from './DepartmentShape';
import nestedCourseShape from './NestedCourseShape';
import nestedProfessorShape from './NestedProfessorShape';


const courseShape = PropTypes.shape({
  id: PropTypes.number.isRequired,
  old_code: PropTypes.string.isRequired,
  department: departmentShape,
  type: PropTypes.string.isRequired,
  type_en: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  title_en: PropTypes.string.isRequired,
  summary: PropTypes.string.isRequired,
  review_num: PropTypes.number.isRequired,
  related_courses_prior: PropTypes.arrayOf(nestedCourseShape).isRequired,
  related_courses_posterior: PropTypes.arrayOf(nestedCourseShape).isRequired,
  professors_str: PropTypes.string.isRequired,
  professors_str_en: PropTypes.string.isRequired,
  professors: PropTypes.arrayOf(nestedProfessorShape).isRequired,
  has_review: PropTypes.bool.isRequired,
  grade: PropTypes.number.isRequired,
  load: PropTypes.number.isRequired,
  speech: PropTypes.number.isRequired,
  userspecific_is_read: PropTypes.bool.isRequired,
});

export default courseShape;
