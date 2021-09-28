import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { appBoundClassNames as classNames } from '../../common/boundClassNames';
import {
  isListClicked, isListFocused, isDimmedListLectureGroup,
  inTimetable, inCart,
} from '../../utils/lectureUtils';

import LectureGroupBlockRow from './LectureGroupBlockRow';

import lectureShape from '../../shapes/LectureShape';
import lectureFocusShape from '../../shapes/LectureFocusShape';
import timetableShape from '../../shapes/TimetableShape';


const LectureGroupBlock = ({
  t,
  lectureGroup, selectedTimetable, cart, lectureFocus,
  isTaken, fromCart,
  addToCart, addToTable, deleteFromCart,
  listHover, listOut, listClick,
}) => {
  return (
    <div
      className={classNames(
        'block',
        'block--lecture-group',
        (lectureGroup.some((l) => isListClicked(l, lectureFocus)) ? 'block--raised' : ''),
        (isDimmedListLectureGroup(lectureGroup, lectureFocus) ? 'block--dimmed' : ''),
        (isTaken ? 'block--completed' : ''),
      )}
    >
      <div className={classNames('block__completed-text')}>{t('ui.others.taken')}</div>
      <div className={classNames('block--lecture-group__title')}>
        <strong>{lectureGroup[0][t('js.property.common_title')]}</strong>
        {' '}
        {lectureGroup[0].old_code}
      </div>
      {lectureGroup.map((l) => (
        <LectureGroupBlockRow
          lecture={l}
          key={l.id}
          isRaised={isListClicked(l, lectureFocus)}
          isHighlighted={isListFocused(l, lectureFocus)}
          inTimetable={inTimetable(l, selectedTimetable)}
          isTimetableReadonly={!selectedTimetable || Boolean(selectedTimetable.isReadOnly)}
          inCart={inCart(l, cart)}
          fromCart={fromCart}
          addToCart={addToCart}
          addToTable={addToTable}
          deleteFromCart={deleteFromCart}
          listHover={listHover}
          listOut={listOut}
          listClick={listClick}
        />
      ))}
    </div>
  );
};

LectureGroupBlock.propTypes = {
  lectureGroup: PropTypes.arrayOf(lectureShape).isRequired,
  selectedTimetable: timetableShape,
  cart: PropTypes.shape({
    lectureGroups: PropTypes.arrayOf(PropTypes.arrayOf(lectureShape)),
  }).isRequired,
  lectureFocus: lectureFocusShape.isRequired,
  isTaken: PropTypes.bool.isRequired,
  fromCart: PropTypes.bool.isRequired,
  addToCart: PropTypes.func.isRequired,
  addToTable: PropTypes.func.isRequired,
  deleteFromCart: PropTypes.func.isRequired,
  listHover: PropTypes.func.isRequired,
  listOut: PropTypes.func.isRequired,
  listClick: PropTypes.func.isRequired,
};

export default withTranslation()(
  React.memo(
    LectureGroupBlock
  )
);
