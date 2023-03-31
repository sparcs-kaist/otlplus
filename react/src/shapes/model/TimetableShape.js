import PropTypes from 'prop-types';

import lectureShape from './LectureShape';


const timetableShape = PropTypes.exact({
  id: PropTypes.number.isRequired,
  lectures: PropTypes.arrayOf(lectureShape).isRequired,
});

export default timetableShape;
