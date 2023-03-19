import PropTypes from 'prop-types';


const genericPlannerItemShape = PropTypes.shape({
  id: PropTypes.number.isRequired,
  type: PropTypes.string.isRequired,
  year: PropTypes.number.isRequired,
  semester: PropTypes.number.isRequired,
});

export default genericPlannerItemShape;
