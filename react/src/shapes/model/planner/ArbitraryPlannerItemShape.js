import PropTypes from 'prop-types';
import departmentShape from '../subject/DepartmentShape';


const arbitraryPlannerItemShape = PropTypes.exact({
  id: PropTypes.number.isRequired,
  item_type: PropTypes.oneOf(['ARBITRARY']).isRequired,
  is_excluded: PropTypes.bool.isRequired,
  year: PropTypes.number.isRequired,
  semester: PropTypes.oneOf([1, 2, 3, 4]).isRequired,
  department: departmentShape,
  type: PropTypes.string.isRequired,
  type_en: PropTypes.string.isRequired,
  credit: PropTypes.number.isRequired,
  credit_au: PropTypes.number.isRequired,
});

export default arbitraryPlannerItemShape;
