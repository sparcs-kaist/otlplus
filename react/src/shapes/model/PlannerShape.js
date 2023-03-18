import PropTypes from 'prop-types';


// This shape is arbitrary and should be updated after back-end implemented

const plannerShape = PropTypes.shape({
  id: PropTypes.number.isRequired,
  start_year: PropTypes.number.isRequired,
  end_year: PropTypes.number.isRequired,
});

export default plannerShape;
