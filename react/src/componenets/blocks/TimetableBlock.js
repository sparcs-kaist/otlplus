import React from 'react';
import PropTypes from 'prop-types';
import { pure } from 'recompose';

import { appBoundClassNames as classNames } from '../../common/boundClassNames';

import lectureShape from '../../shapes/LectureShape';
import classtimeShape from '../../shapes/ClasstimeShape';


const TimetableBlock = ({ lecture, classtime, cellWidth, cellHeight, isClicked, isHover, isListHover, isTemp, blockHover, blockOut, blockClick, deleteLecture }) => {
  const indexOfTime = time => (time / 30 - 16);

  const activeType = (
    isClicked ? classNames('block--clicked')
      : isTemp ? classNames('block--temp', 'block--active')
        : (isHover || isListHover) ? classNames('block--active')
          : ''
  );

  return (
      // eslint-disable-next-line react/jsx-indent
      <div
        className={classNames('block--timetable', `background-color--${lecture.course % 16}`, activeType)}
        style={{
          left: (cellWidth + 5) * classtime.day + 17,
          top: cellHeight * indexOfTime(classtime.begin) + 19,
          width: cellWidth + 2,
          height: cellHeight * (indexOfTime(classtime.end) - indexOfTime(classtime.begin)) - 3,
        }}
        onMouseOver={() => blockHover(lecture)()}
        onMouseOut={() => blockOut()}
        onClick={() => blockClick(lecture)()}
      >
        <div className={classNames('block--timetable__button')} onClick={event => deleteLecture(lecture)(event)}><i className={classNames('icon', 'icon--delete-lecture')} /></div>
        <div
          // onMouseDown={() => onMouseDown()}
          className={classNames('block--timetable__content')}
        >
          <p className={classNames('block--timetable__content__title')}>
            {lecture.title}
          </p>
          <p className={classNames('block--timetable__content__info')}>
            {lecture.professor_short}
          </p>
          <p className={classNames('block--timetable__content__info')}>
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
