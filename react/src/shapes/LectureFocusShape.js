import PropTypes from 'prop-types';

import { LectureFocusFrom } from '../reducers/timetable/lectureFocus';
import lectureShape from './LectureShape';


const lectureFocusShape = PropTypes.shape({
  from: PropTypes.oneOf(Object.values(LectureFocusFrom)).isRequired,
  clicked: PropTypes.bool.isRequired,
  lecture: lectureShape,
  multipleTitle: PropTypes.string.isRequired,
  multipleDetails: PropTypes.arrayOf(
    PropTypes.shape({
      lecture: lectureShape,
      name: PropTypes.string.isRequired,
      info: PropTypes.string.isRequired,
    }),
  ),
});

export default lectureFocusShape;
