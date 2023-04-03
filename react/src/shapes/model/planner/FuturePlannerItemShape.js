import PropTypes from 'prop-types';
import courseShape from '../subject/CourseShape';


const futurePlannerItemShape = PropTypes.exact({
  id: PropTypes.number.isRequired,
  item_type: PropTypes.oneOf(['FUTURE']).isRequired,
  year: PropTypes.number.isRequired,
  semester: PropTypes.number.isRequired,
  course: courseShape.isRequired,
});

export default futurePlannerItemShape;
