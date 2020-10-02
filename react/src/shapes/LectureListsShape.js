import PropTypes from 'prop-types';

import lectureShape from './NestedLectureShape';


const lectureGroupShape = PropTypes.arrayOf(lectureShape);


const lectureListsShape = PropTypes.shape({
  search: {
    lectureGroups: PropTypes.arrayOf(lectureGroupShape),
  }.isRequired,
  basic: {
    lectureGroups: PropTypes.arrayOf(lectureGroupShape),
  }.isRequired,
  humanity: {
    lectureGroups: PropTypes.arrayOf(lectureGroupShape),
  }.isRequired,
  cart: {
    lectureGroups: PropTypes.arrayOf(lectureGroupShape),
  }.isRequired,
});

export default lectureListsShape;
