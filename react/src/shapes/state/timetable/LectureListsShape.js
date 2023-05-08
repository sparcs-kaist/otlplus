import PropTypes from 'prop-types';

import lectureShape from '../../model/subject/LectureShape';


const lectureGroupShape = PropTypes.arrayOf(lectureShape);


const lectureListsShape = PropTypes.shape({
  search: PropTypes.exact({
    lectureGroups: PropTypes.arrayOf(lectureGroupShape),
  }).isRequired,
  basic: PropTypes.exact({
    lectureGroups: PropTypes.arrayOf(lectureGroupShape),
  }).isRequired,
  humanity: PropTypes.exact({
    lectureGroups: PropTypes.arrayOf(lectureGroupShape),
  }).isRequired,
  cart: PropTypes.exact({
    lectureGroups: PropTypes.arrayOf(lectureGroupShape),
  }).isRequired,
});

export default lectureListsShape;
