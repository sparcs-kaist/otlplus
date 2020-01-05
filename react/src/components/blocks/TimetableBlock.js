import React from 'react';
import PropTypes from 'prop-types';
import { pure } from 'recompose';
import { withTranslation } from 'react-i18next';

import { appBoundClassNames as classNames } from '../../common/boundClassNames';

import lectureShape from '../../shapes/LectureShape';
import classtimeShape from '../../shapes/ClasstimeShape';


const TimetableBlock = ({ t, lecture, classtime, cellWidth, cellHeight, isTimetableReadonly, isClicked, isHover, isInactive, isTemp, isSimple, blockHover, blockOut, blockClick, deleteLecture, occupiedTime }) => {
  const indexOfTime = time => (time / 30 - 16);

  const activeType = (
    isClicked ? classNames('block--clicked')
      : isTemp ? classNames('block--temp', 'block--active')
        : isHover ? classNames('block--active')
          : isInactive ? classNames('block--inactive')
            : ''
  );

  return (
    <div
      className={classNames('block--timetable', `background-color--${(lecture.course % 16) + 1}`, activeType)}
      style={{
        left: (cellWidth + 5) * classtime.day + 17,
        top: cellHeight * indexOfTime(classtime.begin) + 19,
        width: cellWidth + 2,
        height: cellHeight * (indexOfTime(classtime.end) - indexOfTime(classtime.begin)) - 3,
      }}
      onMouseOver={blockHover ? blockHover(lecture) : null}
      onMouseOut={blockOut}
      onClick={blockClick ? blockClick(lecture) : null}
    >
      { !isTemp && !isTimetableReadonly
        ? <button className={classNames('block--timetable__button')} onClick={deleteLecture ? deleteLecture(lecture) : null}><i className={classNames('icon', 'icon--delete-lecture')} /></button>
        : null
      }
      <div
        // onMouseDown={() => onMouseDown()}
        className={classNames('block--timetable__content')}
      >
        <p className={classNames('block--timetable__content__title', (isSimple ? 'mobile-hidden' : ''))}>
          {lecture[t('js.property.title')]}
        </p>
        <p className={classNames('block--timetable__content__info', 'mobile-hidden')}>
          {lecture[t('js.property.professors_str_short')]}
        </p>
        <p className={classNames('block--timetable__content__info', 'mobile-hidden')}>
          {classtime[t('js.property.classroom')]}
        </p>
      </div>
      {
        occupiedTime === undefined
          ? null
          : occupiedTime.map(o => (
            <div
              key={`${o[0]}:${o[1]}`}
              className={classNames('block--timetable__occupied-area')}
              style={{
                top: cellHeight * o[0],
                height: cellHeight * (o[1] - o[0]) - 3,
              }}
            />
          ))
      }
    </div>
  );
};

TimetableBlock.propTypes = {
  lecture: lectureShape.isRequired,
  classtime: classtimeShape.isRequired,
  cellWidth: PropTypes.number.isRequired,
  cellHeight: PropTypes.number.isRequired,
  isTimetableReadonly: PropTypes.bool.isRequired,
  isClicked: PropTypes.bool.isRequired,
  isHover: PropTypes.bool.isRequired,
  isInactive: PropTypes.bool.isRequired,
  isTemp: PropTypes.bool.isRequired,
  isSimple: PropTypes.bool.isRequired,
  blockHover: PropTypes.func,
  blockOut: PropTypes.func,
  blockClick: PropTypes.func,
  deleteLecture: PropTypes.func,
  occupiedTime: PropTypes.arrayOf(PropTypes.array),
};

export default withTranslation()(pure(TimetableBlock));
