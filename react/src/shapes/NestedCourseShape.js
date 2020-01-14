import PropTypes from 'prop-types';

import departmentShape from './DepartmentShape';


const nestedCourseShape = PropTypes.shape({
  id: PropTypes.number.isRequired,
  old_code: PropTypes.string.isRequired,
  department: departmentShape,
  code_num: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  type_en: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  title_en: PropTypes.string.isRequired,
  summary: PropTypes.string.isRequired,
  comment_num: PropTypes.number.isRequired,
});

export default nestedCourseShape;
