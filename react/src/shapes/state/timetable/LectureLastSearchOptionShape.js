import PropTypes from 'prop-types';


const lectureLastSearchOptionShape = PropTypes.exact({
  keyword: PropTypes.string,
  type: PropTypes.arrayOf(PropTypes.string),
  department: PropTypes.arrayOf(PropTypes.string),
  grade: PropTypes.arrayOf(PropTypes.string),
  day: PropTypes.number,
  begin: PropTypes.number,
  end: PropTypes.number,
});

export default lectureLastSearchOptionShape;
