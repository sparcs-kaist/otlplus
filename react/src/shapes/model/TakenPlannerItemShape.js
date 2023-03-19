import PropTypes from 'prop-types';
import nestedLectureShape from './NestedLectureShape';


const takenPlannerItemShape = PropTypes.shape({
  lecture: nestedLectureShape.isRequired,
});

export default takenPlannerItemShape;
