import PropTypes from 'prop-types';


const userShape = PropTypes.shape({
  firstName: PropTypes.string.isRequired,
  lastName: PropTypes.string.isRequired,
  language: PropTypes.string.isRequired,
  departments: PropTypes.object.isRequired,
});

export default userShape;
