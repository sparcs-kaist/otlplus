import PropTypes from 'prop-types';

import { NONE, LIST, TABLE, MULTIPLE } from '../reducers/timetable/lectureActive';
import lectureShape from './LectureShape';
import reviewShape from './ReviewShape';


const lectureActiveShape = PropTypes.shape({
  from: PropTypes.oneOf([NONE, LIST, TABLE, MULTIPLE]).isRequired,
  clicked: PropTypes.bool.isRequired,
  lecture: lectureShape,
  comments: PropTypes.arrayOf(reviewShape).isRequired,
  title: PropTypes.string.isRequired,
  multipleDetail: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      title: PropTypes.string.isRequired,
      info: PropTypes.string.isRequired,
    }),
  ),
});

export default lectureActiveShape;
