import PropTypes from 'prop-types';

import { ItemFocusFrom } from '../../../reducers/planner/itemFocus';
import courseShape from '../../model/subject/CourseShape';
import departmentShape from '../../model/subject/DepartmentShape';
import futurePlannerItemShape from '../../model/planner/FuturePlannerItemShape';
import arbitraryPlannerItemShape from '../../model/planner/ArbitraryPlannerItemShape';
import lectureShape from '../../model/subject/LectureShape';
import reviewShape from '../../model/review/ReviewShape';
import takenPlannerItemShape from '../../model/planner/TakenPlannerItemShape';


export const arbitraryCourseShape = PropTypes.exact({
  id: PropTypes.number.isRequired,
  isArbitrary: PropTypes.oneOf([true]).isRequired,
  department: departmentShape,
  type: PropTypes.string.isRequired,
  type_en: PropTypes.string.isRequired,
  credit: PropTypes.number.isRequired,
  credit_au: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  title_en: PropTypes.string.isRequired,
  old_code: PropTypes.string.isRequired,
});


const itemFocusShape = PropTypes.exact({
  from: PropTypes.oneOf(Object.values(ItemFocusFrom)).isRequired,
  clicked: PropTypes.bool.isRequired,
  item: PropTypes.oneOfType([
    takenPlannerItemShape, futurePlannerItemShape, arbitraryPlannerItemShape,
  ]),
  course: PropTypes.oneOfType([
    courseShape, arbitraryCourseShape,
  ]),
  reviews: PropTypes.arrayOf(reviewShape),
  lectures: PropTypes.arrayOf(lectureShape),
});

export default itemFocusShape;
