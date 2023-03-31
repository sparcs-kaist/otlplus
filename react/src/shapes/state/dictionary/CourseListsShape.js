import PropTypes from 'prop-types';

import courseShape from '../../model/subject/CourseShape';


const courseListsShape = PropTypes.shape({
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
