import PropTypes from 'prop-types';
import departmentShape from '../subject/DepartmentShape';


const majorTrackShape = PropTypes.exact({
  id: PropTypes.number.isRequired,
  start_year: PropTypes.number.isRequired,
  end_year: PropTypes.number.isRequired,
  department: departmentShape.isRequired,
  basic_elective_doublemajor: PropTypes.number.isRequired,
  major_required: PropTypes.number.isRequired,
  major_elective: PropTypes.number.isRequired,
});

export default majorTrackShape;
