import PropTypes from 'prop-types';

import courseShape from './CourseShape';


const courseActiveShape = PropTypes.shape({
  clicked: PropTypes.bool.isRequired,
  course: courseShape,
});

export default courseActiveShape;
