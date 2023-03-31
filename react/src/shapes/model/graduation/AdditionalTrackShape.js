import PropTypes from 'prop-types';
import departmentShape from '../subject/DepartmentShape';


const additionalTrackShape = PropTypes.exact({
  id: PropTypes.number.isRequired,
  start_year: PropTypes.number.isRequired,
  end_year: PropTypes.number.isRequired,
  type: PropTypes.oneOf(['DOUBLE', 'MINOR', 'ADVANCED', 'INTERDISCIPLINARY']).isRequired,
  department: departmentShape,
  major_required: PropTypes.number.isRequired,
  major_elective: PropTypes.number.isRequired,
});

export default additionalTrackShape;
