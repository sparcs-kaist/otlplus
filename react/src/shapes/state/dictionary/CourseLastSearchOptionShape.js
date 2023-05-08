import PropTypes from 'prop-types';


const courseLastSearchOptionShape = PropTypes.exact({
  keyword: PropTypes.string,
  type: PropTypes.arrayOf(PropTypes.string),
  department: PropTypes.arrayOf(PropTypes.string),
  grade: PropTypes.arrayOf(PropTypes.string),
  term: PropTypes.arrayOf(PropTypes.string),
});

export default courseLastSearchOptionShape;
