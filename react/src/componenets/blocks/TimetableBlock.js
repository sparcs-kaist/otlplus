import React from 'react';
import PropTypes from 'prop-types';
import { pure } from 'recompose';

import { timetableBoundClassNames as classNames } from '../../common/boundClassNames';

import lectureShape from '../../shapes/LectureShape';
import classtimeShape from '../../shapes/ClasstimeShape';


const TimetableBlock = ({ lecture, classtime, cellWidth, cellHeight, isClicked, isHover, isListHover, isTemp, blockHover, blockOut, blockClick, deleteLecture }) => {
  const indexOfTime = time => (time / 30 - 16);

  const activeType = (
    isClicked ? classNames('click')
      : isTemp ? classNames('lecture-block-temp', 'active')
        : (isHover || isListHover) ? classNames('active')
          : ''
  );

  return (
      // eslint-disable-next-line react/jsx-indent
      <div
        className={classNames('lecture-block', `color${lecture.course % 16}`, activeType)}
        style={{
          left: (cellWidth + 5) * classtime.day + 28,
          top: cellHeight * indexOfTime(classtime.begin) + 28,
          width: cellWidth + 2,
          height: cellHeight * (indexOfTime(classtime.end) - indexOfTime(classtime.begin)) - 3,
        }}
        onMouseOver={() => blockHover(lecture)()}
        onMouseOut={() => blockOut()}
        onClick={() => blockClick(lecture)()}
      >
        <div className={classNames('lecture-delete')} onClick={event => deleteLecture(lecture)(event)}><i /></div>
        <div
          // onMouseDown={() => onMouseDown()}
          className={classNames('lecture-block-content')}
        >
          <p className={classNames('timetable-lecture-name')}>
            {lecture.title}
          </p>
          <p className={classNames('timetable-lecture-info')}>
            {lecture.professor}
          </p>
          <p className={classNames('timetable-lecture-info')}>
            {classtime.classroom}
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
