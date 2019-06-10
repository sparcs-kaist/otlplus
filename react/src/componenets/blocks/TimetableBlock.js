import React from 'react';

const TimetableBlock = (props) => {
  const indexOfTime = time => (time / 30 - 16);

  let activeType = '';
  if (props.isClicked) {
    activeType = ' click';
  }
  else if (props.isTemp) {
    activeType = ' lecture-block-temp active';
  }
  else if (props.isHover || props.isListHover) {
    activeType = ' active';
  }

  return (
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

export default TimetableBlock;
