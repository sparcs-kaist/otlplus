import PropTypes from 'prop-types';


const genericPlannerItemShape = PropTypes.shape({
  year: PropTypes.number.isRequired,
  semester: PropTypes.number.isRequired,
});

export default genericPlannerItemShape;
