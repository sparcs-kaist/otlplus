import PropTypes from 'prop-types';


const arbitraryPlannerItemShape = PropTypes.exact({
  id: PropTypes.number.isRequired,
  item_type: PropTypes.string.isRequired,
  year: PropTypes.number.isRequired,
  semester: PropTypes.number.isRequired,
});

export default arbitraryPlannerItemShape;
