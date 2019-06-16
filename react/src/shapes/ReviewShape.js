import PropTypes from 'prop-types';


const reviewShape = PropTypes.shape({
  grade: PropTypes.string.isRequired,
  load: PropTypes.string.isRequired,
  speech: PropTypes.string.isRequired,
  like: PropTypes.number.isRequired,
  comment: PropTypes.string.isRequired,
  id: PropTypes.number.isRequired,
});

export default reviewShape;
