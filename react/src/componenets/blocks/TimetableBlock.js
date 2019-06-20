import React from 'react';
import PropTypes from 'prop-types';
import { pure } from 'recompose';

import lectureShape from '../../shapes/LectureShape';
import classtimeShape from '../../shapes/ClasstimeShape';


const TimetableBlock = (props) => {
  const indexOfTime = time => (time / 30 - 16);

  const activeType = (
    props.isClicked ? ' click'
      : props.isTemp ? ' lecture-block-temp active'
        : (props.isHover || props.isListHover) ? ' active'
          : ''
  );

  return (
      // eslint-disable-next-line react/jsx-indent
      <div
        className={`lecture-block color${props.lecture.course % 16}${activeType}`}
        style={{
          left: (props.cellWidth + 5) * props.classtime.day + 28,
          top: props.cellHeight * indexOfTime(props.classtime.begin) + 28,
          width: props.cellWidth + 2,
          height: props.cellHeight * (indexOfTime(props.classtime.end) - indexOfTime(props.classtime.begin)) - 3,
        }}
        onMouseOver={() => props.blockHover(props.lecture)()}
        onMouseOut={() => props.blockOut()}
        onClick={() => props.blockClick(props.lecture)()}
      >
        <div className="lecture-delete" onClick={event => props.deleteLecture(props.lecture)(event)}><i /></div>
        <div
          // onMouseDown={() => props.onMouseDown()}
          className="lecture-block-content"
        >
          <p className="timetable-lecture-name">
            {props.lecture.title}
          </p>
          <p className="timetable-lecture-info">
            {props.lecture.professor}
          </p>
          <p className="timetable-lecture-info">
            {props.classtime.classroom}
          </p>
        </div>
      </div>
  );
};

TimetableBlock.propTypes = {
  lecture: lectureShape.isRequired,
  classtime: classtimeShape,
  cellWidth: PropTypes.number.isRequired,
  cellHeight: PropTypes.number.isRequired,
  isClicked: PropTypes.bool.isRequired,
  isHover: PropTypes.bool.isRequired,
  isListHover: PropTypes.bool.isRequired,
  isTemp: PropTypes.bool.isRequired,
  blockHover: PropTypes.func.isRequired,
  blockOut: PropTypes.func.isRequired,
  blockClick: PropTypes.func.isRequired,
  deleteLecture: PropTypes.func.isRequired,
};

export default pure(TimetableBlock);
