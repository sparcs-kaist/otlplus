import PropTypes from 'prop-types';

import { ItemFocusFrom } from '../../reducers/planner/itemFocus';
import courseShape from '../model/CourseShape';
import lectureShape from '../model/LectureShape';
import reviewShape from '../model/ReviewShape';


const itemFocusShape = PropTypes.shape({
  from: PropTypes.oneOf(Object.values(ItemFocusFrom)).isRequired,
  course: courseShape,
  reviews: PropTypes.arrayOf(reviewShape),
  lectures: PropTypes.arrayOf(lectureShape),
});

export default itemFocusShape;
