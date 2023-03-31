import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { appBoundClassNames as classNames } from '../../common/boundClassNames';
import { getProfessorsShortStr } from '../../utils/lectureUtils';

import lectureShape from '../../shapes/model/subject/LectureShape';
import classtimeShape from '../../shapes/model/subject/ClasstimeShape';


const HorizontalTimetableTile = ({
  t,
  lecture, classtime,
  beginIndex, endIndex,
  color,
  cellWidth, cellHeight,
}) => {
  return (
    <div
      className={classNames('tile', 'tile--horizonatal-timetable', `background-color--${color}`)}
      style={{
        left: 2 + cellWidth * beginIndex + 2,
        top: 15 + 3,
        width: cellWidth * (endIndex - beginIndex) - 3,
        height: cellHeight - 3 * 2,
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
  beginIndex: PropTypes.number.isRequired,
  endIndex: PropTypes.number.isRequired,
  color: PropTypes.number.isRequired,
  cellWidth: PropTypes.number.isRequired,
  cellHeight: PropTypes.number.isRequired,
};

export default withTranslation()(
  React.memo(
    HorizontalTimetableTile
  )
);
