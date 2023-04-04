import PropTypes from 'prop-types';

import lectureShape from '../subject/LectureShape';


export const myPseudoTimetableShape = PropTypes.exact({
  id: PropTypes.number.isRequired,
  lectures: PropTypes.arrayOf(lectureShape).isRequired,
  isReadOnly: PropTypes.oneOf([true]).isRequired,
});

const timetableShape = PropTypes.exact({
  id: PropTypes.number.isRequired,
  lectures: PropTypes.arrayOf(lectureShape).isRequired,
  arrange_order: PropTypes.number.isRequired,
});

export default timetableShape;
