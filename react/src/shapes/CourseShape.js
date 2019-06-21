import PropTypes from 'prop-types';

import DepartmentShape from './DepartmentShape';
import NestedCourseShape from './NestedCourseShape';
import NestedProfessorShape from './NestedProfessorShape';


const CourseShape = PropTypes.shape({
  id: PropTypes.number.isRequired,
  old_code: PropTypes.string.isRequired,
  department: DepartmentShape,
  code_num: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  type_en: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  title_en: PropTypes.string.isRequired,
  summary: PropTypes.string.isRequired,
  comment_num: PropTypes.number.isRequired,
  related_courses_prior: PropTypes.arrayOf(NestedCourseShape).isRequired,
  related_courses_posterior: PropTypes.arrayOf(NestedCourseShape).isRequired,
  professors_str: PropTypes.string.isRequired,
  professors: PropTypes.arrayOf(NestedProfessorShape).isRequired,
  has_review: PropTypes.bool.isRequired,
  grade: PropTypes.number.isRequired,
  load: PropTypes.number.isRequired,
  speech: PropTypes.number.isRequired,
  grade_letter: PropTypes.string.isRequired,
  load_letter: PropTypes.string.isRequired,
  speech_letter: PropTypes.string.isRequired,
  userspecific_is_read: PropTypes.bool.isRequired,
});

export default CourseShape;
