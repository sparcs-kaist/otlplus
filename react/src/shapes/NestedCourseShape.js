import PropTypes from 'prop-types';

import DepartmentShape from './DepartmentShape';


const NestedCourseShape = PropTypes.shape({
  old_code: PropTypes.string.isRequired,
  department: DepartmentShape,
  code_num: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  type_en: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  title_en: PropTypes.string.isRequired,
  summary: PropTypes.string.isRequired,
  comment_num: PropTypes.number.isRequired,
});

export default NestedCourseShape;
