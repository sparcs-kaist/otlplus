import PropTypes from 'prop-types';


const arbitraryPlannerItemShape = PropTypes.shape({
  id: PropTypes.number.isRequired,
  type: PropTypes.string.isRequired,
  year: PropTypes.number.isRequired,
  semester: PropTypes.number.isRequired,
});

export default arbitraryPlannerItemShape;
