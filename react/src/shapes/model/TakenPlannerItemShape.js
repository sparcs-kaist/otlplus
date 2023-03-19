import PropTypes from 'prop-types';
import nestedLectureShape from './NestedLectureShape';


const takenPlannerItemShape = PropTypes.shape({
  type: PropTypes.string.isRequired,
  lecture: nestedLectureShape.isRequired,
});

export default takenPlannerItemShape;
