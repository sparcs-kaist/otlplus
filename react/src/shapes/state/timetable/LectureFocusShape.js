import PropTypes from 'prop-types';

import { LectureFocusFrom } from '../../../reducers/timetable/lectureFocus';
import lectureShape from '../../model/subject/LectureShape';
import reviewShape from '../../model/review/ReviewShape';


const emptyArrayShape = (props, propName, componentName) => {
  if (props[propName] instanceof Array && props[propName].length === 0) {
    return undefined;
  }
  return new Error(
    `Invalid prop \`${propName}\` supplied to \`${componentName}\`. Validation failed.`
  );
};

const lectureFocusShape = PropTypes.oneOfType([
  PropTypes.exact({
    from: PropTypes.oneOf([LectureFocusFrom.NONE]).isRequired,
    clicked: PropTypes.oneOf([false]).isRequired,
    lecture: PropTypes.oneOf([null]),
    reviews: PropTypes.oneOf([null]),
    multipleTitle: PropTypes.oneOf(['']).isRequired,
    multipleDetails: emptyArrayShape,
  }),
  PropTypes.exact({
    from: PropTypes.oneOf([LectureFocusFrom.LIST]).isRequired,
    clicked: PropTypes.bool.isRequired,
    lecture: lectureShape,
    reviews: PropTypes.arrayOf(reviewShape),
    multipleTitle: PropTypes.oneOf(['']).isRequired,
    multipleDetails: emptyArrayShape,
  }),
  PropTypes.exact({
    from: PropTypes.oneOf([LectureFocusFrom.TABLE]).isRequired,
    clicked: PropTypes.bool.isRequired,
    lecture: lectureShape,
    reviews: PropTypes.arrayOf(reviewShape),
    multipleTitle: PropTypes.oneOf(['']).isRequired,
    multipleDetails: emptyArrayShape,
  }),
  PropTypes.exact({
    from: PropTypes.oneOf([LectureFocusFrom.MULTIPLE]).isRequired,
    clicked: PropTypes.oneOf([false]).isRequired,
    lecture: PropTypes.oneOf([null]),
    reviews: PropTypes.oneOf([null]),
    multipleTitle: PropTypes.string.isRequired,
    multipleDetails: PropTypes.arrayOf(
      PropTypes.exact({
        lecture: lectureShape,
        name: PropTypes.string.isRequired,
        info: PropTypes.string.isRequired,
      }),
    ),
  }),
]);

export default lectureFocusShape;
