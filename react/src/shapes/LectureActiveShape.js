import PropTypes from 'prop-types';

import { NONE, LIST, TABLE, MULTIPLE } from '../reducers/timetable/lectureActive';
import lectureShape from './LectureShape';
import reviewShape from './ReviewShape';


const lectureActiveShape = PropTypes.shape({
  from: PropTypes.oneOf([NONE, LIST, TABLE, MULTIPLE]).isRequired,
  clicked: PropTypes.bool.isRequired,
  lecture: lectureShape.isRequired,
  comments: PropTypes.arrayOf(reviewShape).isRequired,
  title: PropTypes.string.isRequired,
  lectures: PropTypes.arrayOf(lectureShape).isRequired,
});

export default lectureActiveShape;
