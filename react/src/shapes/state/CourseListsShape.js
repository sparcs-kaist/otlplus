import PropTypes from 'prop-types';

import courseShape from '../model/CourseShape';


const courseListsShape = PropTypes.exact({
  search: PropTypes.exact({
    courses: PropTypes.arrayOf(courseShape),
  }).isRequired,
  basic: PropTypes.exact({
    courses: PropTypes.arrayOf(courseShape),
  }).isRequired,
  humanity: PropTypes.exact({
    courses: PropTypes.arrayOf(courseShape),
  }).isRequired,
  taken: PropTypes.exact({
    courses: PropTypes.arrayOf(courseShape),
  }).isRequired,
});

export default courseListsShape;
