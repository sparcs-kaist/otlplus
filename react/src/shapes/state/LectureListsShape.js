import PropTypes from 'prop-types';

import lectureShape from '../model/LectureShape';


const lectureGroupShape = PropTypes.arrayOf(lectureShape);


const lectureListsShape = PropTypes.shape({
  search: PropTypes.shape({
    lectureGroups: PropTypes.arrayOf(lectureGroupShape),
  }).isRequired,
  basic: PropTypes.shape({
    lectureGroups: PropTypes.arrayOf(lectureGroupShape),
  }).isRequired,
  humanity: PropTypes.shape({
    lectureGroups: PropTypes.arrayOf(lectureGroupShape),
  }).isRequired,
  cart: PropTypes.shape({
    lectureGroups: PropTypes.arrayOf(lectureGroupShape),
  }).isRequired,
});

export default lectureListsShape;
