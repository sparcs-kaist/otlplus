import PropTypes from 'prop-types';

import courseShape from './CourseShape';


const courseFocusShape = PropTypes.shape({
  clicked: PropTypes.bool.isRequired,
  course: courseShape,
});

export default courseFocusShape;
