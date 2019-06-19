import PropTypes from 'prop-types';


const lectureShape = PropTypes.shape({
  id: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  course: PropTypes.number.isRequired,
  old_code: PropTypes.string.isRequired,
  class_no: PropTypes.string.isRequired,
  year: PropTypes.number.isRequired,
  semester: PropTypes.number.isRequired,
  code: PropTypes.string.isRequired,
  department: PropTypes.number.isRequired,
  department_code: PropTypes.string.isRequired,
  department_name: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  type_en: PropTypes.string.isRequired,
  limit: PropTypes.number.isRequired,
  num_people: PropTypes.number.isRequired,
  is_english: PropTypes.bool.isRequired,
  credit: PropTypes.number.isRequired,
  credit_au: PropTypes.number.isRequired,
  common_title: PropTypes.string.isRequired,
  class_title: PropTypes.string.isRequired,
  professor_short: PropTypes.string.isRequired,
});

export default lectureShape;
