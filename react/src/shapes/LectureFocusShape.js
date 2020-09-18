import PropTypes from 'prop-types';

import { NONE, LIST, TABLE, MULTIPLE } from '../reducers/timetable/lectureFocus';
import lectureShape from './LectureShape';


const lectureFocusShape = PropTypes.shape({
  from: PropTypes.oneOf([NONE, LIST, TABLE, MULTIPLE]).isRequired,
  clicked: PropTypes.bool.isRequired,
  lecture: lectureShape,
  title: PropTypes.string.isRequired,
  multipleDetail: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      title: PropTypes.string.isRequired,
      info: PropTypes.string.isRequired,
    }),
  ),
});

export default lectureFocusShape;
