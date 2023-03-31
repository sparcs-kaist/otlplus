import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { appBoundClassNames as classNames } from '../../common/boundClassNames';
import { TIMETABLE_START_HOUR, TIMETABLE_END_HOUR } from '../../common/constants';
import { getProfessorsShortStr } from '../../utils/lectureUtils';

import lectureShape from '../../shapes/model/subject/LectureShape';
import classtimeShape from '../../shapes/model/subject/ClasstimeShape';


const TimetableTile = ({
  t,
  lecture, classtime,
  tableIndex, dayIndex, beginIndex, endIndex,
  color,
  cellWidth, cellHeight,
  isTimetableReadonly, isRaised, isHighlighted, isDimmed, isTemp, isSimple,
  onMouseOver, onMouseOut, onClick, deleteLecture,
  occupiedIndices,
}) => {
  const handleMouseOver = onMouseOver
    ? (event) => {
      onMouseOver(lecture);
    }
    : null;
  const handleMouseOut = onMouseOut
    ? (event) => {
      onMouseOut(lecture);
    }
    : null;
  const handleClick = onClick
    ? (event) => {
      onClick(lecture);
    }
    : null;
  const handleDeleteFromTableClick = (event) => {
    event.stopPropagation();
    deleteLecture(lecture);
  };

  const getTop = () => {
    if (tableIndex === 0) {
      const timedTableOffset = 17 + (cellHeight * beginIndex);
      return timedTableOffset + 2;
    }
    const timedTableHeight = 17 + (cellHeight * ((TIMETABLE_END_HOUR - TIMETABLE_START_HOUR) * 2));
    const untimedTableHeight = 17 + (cellHeight * 3);
    const tableSpacing = cellHeight;
    const untimedTableOffset = 17 + (cellHeight * beginIndex);
    return (
      timedTableHeight
      + untimedTableHeight * (tableIndex - 1)
      + tableSpacing * tableIndex
      + untimedTableOffset
      + 2
    );
  };

  return (
    <div
      className={classNames(
        'tile',
        'tile--timetable',
        `background-color--${color}`,
        (isRaised ? 'tile--raised' : null),
        (isTemp ? 'tile--temp' : null),
        (isHighlighted ? 'tile--highlighted' : null),
        (isDimmed ? 'tile--dimmed' : null),
      )}
      style={{
        left: 18 + (cellWidth + 5) * dayIndex - 1,
        top: getTop(),
        width: cellWidth + 2,
        height: cellHeight * (endIndex - beginIndex) - 3,
      }}
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
      onClick={handleClick}
    >
      { !isTemp && !isTimetableReadonly
        ? <button className={classNames('tile--timetable__button')} onClick={handleDeleteFromTableClick}><i className={classNames('icon', 'icon--delete-lecture')} /></button>
        : null
      }
      <div
        // onMouseDown={() => onMouseDown()}
        className={classNames('tile--timetable__content')}
      >
        <p className={classNames('tile--timetable__content__title', (isSimple ? 'mobile-hidden' : null))}>
          {lecture[t('js.property.title')]}
        </p>
        <p className={classNames('tile--timetable__content__info', 'mobile-hidden')}>
          {getProfessorsShortStr(lecture)}
        </p>
        <p className={classNames('tile--timetable__content__info', 'mobile-hidden')}>
          {classtime ? classtime[t('js.property.classroom')] : null}
        </p>
      </div>
      {
        occupiedIndices === undefined
          ? null
          : occupiedIndices.map((o) => (
            <div
              key={`${o[0]}:${o[1]}`}
              className={classNames('tile--timetable__occupied-area')}
              style={{
                top: cellHeight * (o[0] - beginIndex),
                height: cellHeight * (o[1] - o[0]) - 3,
              }}
            />
          ))
      }
    </div>
  );
};

TimetableTile.propTypes = {
  lecture: lectureShape.isRequired,
  classtime: classtimeShape,
  tableIndex: PropTypes.number.isRequired,
  dayIndex: PropTypes.number.isRequired,
  beginIndex: PropTypes.number.isRequired,
  endIndex: PropTypes.number.isRequired,
  color: PropTypes.number.isRequired,
  cellWidth: PropTypes.number.isRequired,
  cellHeight: PropTypes.number.isRequired,
  isTimetableReadonly: PropTypes.bool.isRequired,
  isRaised: PropTypes.bool.isRequired,
  isHighlighted: PropTypes.bool.isRequired,
  isDimmed: PropTypes.bool.isRequired,
  isTemp: PropTypes.bool.isRequired,
  isSimple: PropTypes.bool.isRequired,
  onMouseOver: PropTypes.func,
  onMouseOut: PropTypes.func,
  onClick: PropTypes.func,
  deleteLecture: PropTypes.func.isRequired,
  occupiedIndices: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
};

export default withTranslation()(
  React.memo(
    TimetableTile
  )
);
