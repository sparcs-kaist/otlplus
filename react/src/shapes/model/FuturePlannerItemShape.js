import PropTypes from 'prop-types';
import nestedCourseShape from './NestedCourseShape';


const futurePlannerItemShape = PropTypes.exact({
  id: PropTypes.number.isRequired,
  type: PropTypes.string.isRequired,
  year: PropTypes.number.isRequired,
  semester: PropTypes.number.isRequired,
  course: nestedCourseShape.isRequired,
});

export default futurePlannerItemShape;
