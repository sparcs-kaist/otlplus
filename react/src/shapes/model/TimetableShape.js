import PropTypes from 'prop-types';

import lectureShape from './LectureShape';


const timetableShape = PropTypes.shape({
  id: PropTypes.number.isRequired,
  lectures: PropTypes.arrayOf(lectureShape).isRequired,
});

export default timetableShape;
