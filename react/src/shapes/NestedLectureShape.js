import PropTypes from 'prop-types';
import nestedProfessorShape from './NestedProfessorShape';


const lectureShape = PropTypes.shape({
  id: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  title_en: PropTypes.string.isRequired_en,
  course: PropTypes.number.isRequired,
  old_code: PropTypes.string.isRequired,
  class_no: PropTypes.string.isRequired,
  year: PropTypes.number.isRequired,
  semester: PropTypes.number.isRequired,
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
  credit: PropTypes.number.isRequired,
  credit_au: PropTypes.number.isRequired,
  common_title: PropTypes.string.isRequired,
  common_title_en: PropTypes.string.isRequired,
  class_title: PropTypes.string.isRequired,
  class_title_en: PropTypes.string.isRequired,
  professors_str_short: PropTypes.string.isRequired,
  professors_str_short_en: PropTypes.string.isRequired,
  professors: PropTypes.arrayOf(nestedProfessorShape).isRequired,
});

export default lectureShape;
