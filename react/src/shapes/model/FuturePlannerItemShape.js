import PropTypes from 'prop-types';
import courseShape from './CourseShape';


const futurePlannerItemShape = PropTypes.exact({
  id: PropTypes.number.isRequired,
  type: PropTypes.string.isRequired,
  year: PropTypes.number.isRequired,
  semester: PropTypes.number.isRequired,
  course: courseShape.isRequired,
});

export default futurePlannerItemShape;
