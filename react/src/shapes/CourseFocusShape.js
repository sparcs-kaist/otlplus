import PropTypes from 'prop-types';

import courseShape from './CourseShape';


const courseFocusShape = PropTypes.shape({
  course: courseShape,
});

export default courseFocusShape;
