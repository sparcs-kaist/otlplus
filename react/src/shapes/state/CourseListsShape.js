import PropTypes from 'prop-types';

import courseShape from '../model/CourseShape';

const lectureListsShape = PropTypes.shape({
  search: {
    courses: PropTypes.arrayOf(courseShape),
  }.isRequired,
  basic: {
    courses: PropTypes.arrayOf(courseShape),
  }.isRequired,
  humanity: {
    courses: PropTypes.arrayOf(courseShape),
  }.isRequired,
  taken: {
    courses: PropTypes.arrayOf(courseShape),
  }.isRequired,
});

export default lectureListsShape;
