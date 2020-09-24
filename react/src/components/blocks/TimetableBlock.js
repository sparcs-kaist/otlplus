import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { appBoundClassNames as classNames } from '../../common/boundClassNames';
import { getProfessorsShortStr, getColorNumber } from '../../common/lectureFunctions';

import lectureShape from '../../shapes/LectureShape';
import classtimeShape from '../../shapes/ClasstimeShape';


const TimetableBlock = ({
  t,
  lecture, classtime,
  dayIndex, beginIndex, endIndex,
  cellWidth, cellHeight,
  isTimetableReadonly, isRaised, isHighlighted, isDimmed, isTemp, isSimple,
  blockHover, blockOut, blockClick, deleteLecture,
  occupiedTimes,
}) => {
  const onDeleteFromTableClick = (event) => {
    event.stopPropagation();
    deleteLecture(lecture);
  };

  return (
    <div
      className={classNames(
        'block',
        'block--timetable',
        `background-color--${getColorNumber(lecture) + 1}`,
        (isRaised ? 'block--raised' : ''),
        (isTemp ? 'block--temp' : ''),
        (isHighlighted ? 'block--highlighted' : ''),
        (isDimmed ? 'block--dimmed' : ''),
      )}
      style={{
        left: (cellWidth + 5) * dayIndex + 17,
        top: cellHeight * beginIndex + 19
          + ((beginIndex >= 32)
            ? ((beginIndex - 32 + 3) / 3 * (cellHeight + 17))
            : 0
          ),
        width: cellWidth + 2,
        height: cellHeight * (endIndex - beginIndex) - 3,
      }}
      onMouseOver={blockHover ? blockHover(lecture) : null}
      onMouseOut={blockOut}
      onClick={blockClick ? blockClick(lecture) : null}
    >
      { !isTemp && !isTimetableReadonly
        ? <button className={classNames('block--timetable__button')} onClick={onDeleteFromTableClick}><i className={classNames('icon', 'icon--delete-lecture')} /></button>
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
          {getProfessorsShortStr(lecture)}
        </p>
        <p className={classNames('block--timetable__content__info', 'mobile-hidden')}>
          {classtime ? classtime[t('js.property.classroom')] : null}
        </p>
      </div>
      {
        occupiedTimes === undefined
          ? null
          : occupiedTimes.map((o) => (
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
  classtime: classtimeShape,
  dayIndex: PropTypes.number.isRequired,
  beginIndex: PropTypes.number.isRequired,
  endIndex: PropTypes.number.isRequired,
  cellWidth: PropTypes.number.isRequired,
  cellHeight: PropTypes.number.isRequired,
  isTimetableReadonly: PropTypes.bool.isRequired,
  isRaised: PropTypes.bool.isRequired,
  isHighlighted: PropTypes.bool.isRequired,
  isDimmed: PropTypes.bool.isRequired,
  isTemp: PropTypes.bool.isRequired,
  isSimple: PropTypes.bool.isRequired,
  blockHover: PropTypes.func,
  blockOut: PropTypes.func,
  blockClick: PropTypes.func,
  deleteLecture: PropTypes.func.isRequired,
  occupiedTimes: PropTypes.arrayOf(PropTypes.array),
};

export default withTranslation()(React.memo(TimetableBlock));
