import PropTypes from 'prop-types';


const classtimeShape = PropTypes.shape({
  building: PropTypes.string.isRequired,
  classroom: PropTypes.string.isRequired,
  classroom_short: PropTypes.string.isRequired,
  room: PropTypes.string.isRequired,
  day: PropTypes.number.isRequired,
  begin: PropTypes.number.isRequired,
  end: PropTypes.number.isRequired,
});

export default classtimeShape;
