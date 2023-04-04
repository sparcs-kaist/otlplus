import PropTypes from 'prop-types';
import courseShape from '../subject/CourseShape';


const futurePlannerItemShape = PropTypes.exact({
  id: PropTypes.number.isRequired,
  item_type: PropTypes.oneOf(['FUTURE']).isRequired,
  is_excluded: PropTypes.bool.isRequired,
  year: PropTypes.number.isRequired,
  semester: PropTypes.oneOf([1, 2, 3, 4]).isRequired,
  course: courseShape.isRequired,
});

export default futurePlannerItemShape;
