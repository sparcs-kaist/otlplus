import PropTypes from 'prop-types';


const genericPlannerItemShape = PropTypes.shape({
  type: PropTypes.string.isRequired,
  year: PropTypes.number.isRequired,
  semester: PropTypes.number.isRequired,
});

export default genericPlannerItemShape;
