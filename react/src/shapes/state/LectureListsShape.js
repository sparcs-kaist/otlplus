import PropTypes from 'prop-types';

import lectureShape from '../model/LectureShape';


const lectureGroupShape = PropTypes.arrayOf(lectureShape);


const lectureListsShape = PropTypes.exact({
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
