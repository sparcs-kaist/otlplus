import PropTypes from 'prop-types';

import { ItemFocusFrom } from '../../../reducers/planner/itemFocus';
import courseShape from '../../model/subject/CourseShape';
import departmentShape from '../../model/subject/DepartmentShape';
import futurePlannerItemShape from '../../model/planner/FuturePlannerItemShape';
import arbitraryPlannerItemShape from '../../model/planner/ArbitraryPlannerItemShape';
import lectureShape from '../../model/subject/LectureShape';
import reviewShape from '../../model/review/ReviewShape';
import takenPlannerItemShape from '../../model/planner/TakenPlannerItemShape';


export const arbitraryPseudoCourseShape = PropTypes.exact({
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


const itemFocusShape = PropTypes.oneOfType([
  PropTypes.exact({
    from: PropTypes.oneOf([ItemFocusFrom.NONE]).isRequired,
    clicked: PropTypes.oneOf([false]).isRequired,
    item: PropTypes.oneOf([null]),
    course: PropTypes.oneOf([null]),
    category: PropTypes.oneOf([null]),
    reviews: PropTypes.oneOf([null]),
    lectures: PropTypes.oneOf([null]),
  }),
  PropTypes.exact({
    from: PropTypes.oneOf([ItemFocusFrom.LIST]).isRequired,
    clicked: PropTypes.bool.isRequired,
    item: PropTypes.oneOf([null]),
    course: PropTypes.oneOfType([
      courseShape, arbitraryPseudoCourseShape,
    ]),
    category: PropTypes.oneOf([null]),
    reviews: PropTypes.arrayOf(reviewShape),
    lectures: PropTypes.arrayOf(lectureShape),
  }),
  PropTypes.exact({
    from: PropTypes.oneOf([
      ItemFocusFrom.TABLE_TAKEN, ItemFocusFrom.TABLE_FUTURE, ItemFocusFrom.TABLE_ARBITRARY,
    ]).isRequired,
    clicked: PropTypes.bool.isRequired,
    item: PropTypes.oneOfType([
      takenPlannerItemShape, futurePlannerItemShape, arbitraryPlannerItemShape,
    ]),
    course: PropTypes.oneOfType([
      courseShape, arbitraryPseudoCourseShape,
    ]),
    category: PropTypes.oneOf([null]),
    reviews: PropTypes.arrayOf(reviewShape),
    lectures: PropTypes.arrayOf(lectureShape),
  }),
  PropTypes.exact({
    from: PropTypes.oneOf([
      ItemFocusFrom.CATEGORY,
    ]).isRequired,
    clicked: PropTypes.bool.isRequired,
    item: PropTypes.oneOf([null]),
    course: PropTypes.oneOf([null]),
    category: PropTypes.arrayOf(PropTypes.number).isRequired,
    reviews: PropTypes.oneOf([null]),
    lectures: PropTypes.oneOf([null]),
  }),
]);

export default itemFocusShape;
