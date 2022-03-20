import PropTypes from 'prop-types';

const examtimeShape = PropTypes.shape({
  day: PropTypes.number.isRequired,
  str: PropTypes.string.isRequired,
  str_en: PropTypes.string.isRequired,
  begin: PropTypes.number.isRequired,
  end: PropTypes.number.isRequired,
});

export default examtimeShape;
