import PropTypes from 'prop-types';

import classtimeShape from './ClasstimeShape';
import examtimeShape from './ExamtimeShape';
import nestedProfessorShape from './NestedProfessorShape';


const lectureShape = PropTypes.exact({
  id: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  title_en: PropTypes.string.isRequired,
  course: PropTypes.number.isRequired,
  old_code: PropTypes.string.isRequired,
  class_no: PropTypes.string.isRequired,
  year: PropTypes.number.isRequired,
  semester: PropTypes.oneOf([1, 2, 3, 4]).isRequired,
  code: PropTypes.string.isRequired,
  department: PropTypes.number.isRequired,
  department_code: PropTypes.string.isRequired,
  department_name: PropTypes.string.isRequired,
  department_name_en: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  type_en: PropTypes.string.isRequired,
  limit: PropTypes.number.isRequired,
  num_people: PropTypes.number.isRequired,
  is_english: PropTypes.bool.isRequired,
  num_classes: PropTypes.number.isRequired,
  num_labs: PropTypes.number.isRequired,
  credit: PropTypes.number.isRequired,
  credit_au: PropTypes.number.isRequired,
  common_title: PropTypes.string.isRequired,
  common_title_en: PropTypes.string.isRequired,
  class_title: PropTypes.string.isRequired,
  class_title_en: PropTypes.string.isRequired,
  review_total_weight: PropTypes.number.isRequired,
  professors: PropTypes.arrayOf(nestedProfessorShape).isRequired,
  grade: PropTypes.number.isRequired,
  load: PropTypes.number.isRequired,
  speech: PropTypes.number.isRequired,
  classtimes: PropTypes.arrayOf(classtimeShape).isRequired,
  examtimes: PropTypes.arrayOf(examtimeShape).isRequired,
});

export default lectureShape;
