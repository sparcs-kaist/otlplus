import PropTypes from 'prop-types';


const classtimeShape = PropTypes.exact({
  building_code: PropTypes.string.isRequired,
  classroom: PropTypes.string.isRequired,
  classroom_en: PropTypes.string.isRequired,
  classroom_short: PropTypes.string.isRequired,
  classroom_short_en: PropTypes.string.isRequired,
  room_name: PropTypes.string.isRequired,
  day: PropTypes.number.isRequired,
  begin: PropTypes.number.isRequired,
  end: PropTypes.number.isRequired,
});

export default classtimeShape;
