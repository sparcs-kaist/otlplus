import PropTypes from 'prop-types';

import { LectureFocusFrom } from '../../reducers/timetable/lectureFocus';
import lectureShape from '../model/LectureShape';
import reviewShape from '../model/ReviewShape';


const lectureFocusShape = PropTypes.exact({
  from: PropTypes.oneOf(Object.values(LectureFocusFrom)).isRequired,
  clicked: PropTypes.bool.isRequired,
  lecture: lectureShape,
  reviews: PropTypes.arrayOf(reviewShape),
  multipleTitle: PropTypes.string.isRequired,
  multipleDetails: PropTypes.arrayOf(
    PropTypes.exact({
      lecture: lectureShape,
      name: PropTypes.string.isRequired,
      info: PropTypes.string.isRequired,
    }),
  ),
});

export default lectureFocusShape;
