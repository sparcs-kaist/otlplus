import PropTypes from 'prop-types';

import courseShape from '../model/CourseShape';


const courseListsShape = PropTypes.shape({
  search: PropTypes.shape({
    courses: PropTypes.arrayOf(courseShape),
  }).isRequired,
  basic: PropTypes.shape({
    courses: PropTypes.arrayOf(courseShape),
  }).isRequired,
  humanity: PropTypes.shape({
    courses: PropTypes.arrayOf(courseShape),
  }).isRequired,
  taken: PropTypes.shape({
    courses: PropTypes.arrayOf(courseShape),
  }).isRequired,
});

export default courseListsShape;
