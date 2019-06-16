import PropTypes from 'prop-types';


const ExamtimeShape = PropTypes.shape({
  day: PropTypes.number.isRequired,
  str: PropTypes.string.isRequired,
  begin: PropTypes.number.isRequired,
  end: PropTypes.number.isRequired,
});

export default ExamtimeShape;