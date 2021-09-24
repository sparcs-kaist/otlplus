import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { appBoundClassNames as classNames } from '../../common/boundClassNames';
import { getProfessorsShortStr, getColorNumber } from '../../utils/lectureUtils';

import lectureShape from '../../shapes/LectureShape';
import classtimeShape from '../../shapes/ClasstimeShape';


const HorizontalTimetableTile = ({
  t,
  lecture, classtime,
  cellWidth, cellHeight,
}) => {
  const indexOfTime = (time) => (time / 30 - 16);

  return (
    <div
      className={classNames('tile--horizonatal-timetable', `background-color--${getColorNumber(lecture)}`)}
      style={{
        left: cellWidth * indexOfTime(classtime.begin) + 2 + 2,
        top: 11 + 4 + 3,
        width: cellWidth * (indexOfTime(classtime.end) - indexOfTime(classtime.begin)) - 3,
        height: cellHeight,
      }}
    >
      <div className={classNames('tile--horizonatal-timetable__content')}>
        <p className={classNames('tile--horizonatal-timetable__content__title')}>
          {lecture[t('js.property.title')]}
        </p>
        <p className={classNames('tile--horizonatal-timetable__content__info')}>
          {getProfessorsShortStr(lecture)}
        </p>
        <p className={classNames('tile--horizonatal-timetable__content__info')}>
          {classtime[t('js.property.classroom')]}
        </p>
      </div>
    </div>
  );
};

HorizontalTimetableTile.propTypes = {
  lecture: lectureShape.isRequired,
  classtime: classtimeShape,
  cellWidth: PropTypes.number.isRequired,
  cellHeight: PropTypes.number.isRequired,
};

export default withTranslation()(React.memo(HorizontalTimetableTile));
