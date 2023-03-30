import PropTypes from 'prop-types';

import { ItemFocusFrom } from '../../reducers/planner/itemFocus';
import courseShape from '../model/CourseShape';
import futurePlannerItemShape from '../model/FuturePlannerItemShape';
import arbitraryPlannerItemShape from '../model/ArbitraryPlannerItemShape';
import lectureShape from '../model/LectureShape';
import reviewShape from '../model/ReviewShape';
import takenPlannerItemShape from '../model/TakenPlannerItemShape';


const itemFocusShape = PropTypes.shape({
  from: PropTypes.oneOf(Object.values(ItemFocusFrom)).isRequired,
  clicked: PropTypes.bool.isRequired,
  item: PropTypes.oneOfType([
    takenPlannerItemShape, futurePlannerItemShape, arbitraryPlannerItemShape,
  ]),
  course: courseShape,
  reviews: PropTypes.arrayOf(reviewShape),
  lectures: PropTypes.arrayOf(lectureShape),
});

export default itemFocusShape;
