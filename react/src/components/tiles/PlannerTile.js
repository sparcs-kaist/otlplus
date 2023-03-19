import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { appBoundClassNames as classNames } from '../../common/boundClassNames';

import takenPlannerItemShape from '../../shapes/model/TakenPlannerItemShape';
import futurePlannerItemShape from '../../shapes/model/FuturePlannerItemShape';
import genericPlannerItemShape from '../../shapes/model/GenericPlannerItemShape';


const PlannerTile = ({
  t,
  item,
  yearIndex, semesterIndex, beginIndex, endIndex,
  cellWidth, cellHeight,
  isRaised, isHighlighted, isDimmed, isSimple,
  onMouseOver, onMouseOut, onClick, deleteLecture,
}) => {
  const handleMouseOver = onMouseOver
    ? (event) => {
      onMouseOver(item);
    }
    : null;
  const handleMouseOut = onMouseOut
    ? (event) => {
      onMouseOut(item);
    }
    : null;
  const handleClick = onClick
    ? (event) => {
      onClick(item);
    }
    : null;
  const handleDeleteFromTableClick = (event) => {
    event.stopPropagation();
    deleteLecture(item);
  };

  const getTop = () => {
    const base = 17 + (cellHeight * 24);
    if (semesterIndex === 0) {
      return base - (cellHeight * endIndex) + 2;
    }
    if (semesterIndex === 1) {
      return (base + cellHeight * 2 + 11) + (cellHeight * beginIndex) + 1;
    }
    return base;
  };
  const getTitle = () => {
    if (item.lecture) {
      return item.lecture.course[t('js.property.title')];
    }
    if (item.course) {
      return item.course[t('js.property.title')];
    }
    return 'Generic';
  };

  return (
    <div
      className={classNames(
        'tile',
        'tile--planner',
        `background-color--${1}`,
        (isRaised ? 'tile--raised' : null),
        (isHighlighted ? 'tile--highlighted' : null),
        (isDimmed ? 'tile--dimmed' : null),
      )}
      style={{
        left: 26 + (cellWidth + 15) * yearIndex - 1,
        top: getTop(),
        width: cellWidth + 2,
        height: cellHeight * (endIndex - beginIndex) - 3,
      }}
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
      onClick={handleClick}
    >
      <button
        className={classNames('tile--planner__button')}
        onClick={handleDeleteFromTableClick}
      >
        <i className={classNames('icon', 'icon--delete-lecture')} />
      </button>
      <div
        className={classNames('tile--planner__content')}
      >
        <p className={classNames('tile--planner__content__title', (isSimple ? 'mobile-hidden' : null))}>
          {getTitle()}
        </p>
      </div>
    </div>
  );
};

PlannerTile.propTypes = {
  item: PropTypes.oneOfType([
    takenPlannerItemShape, futurePlannerItemShape, genericPlannerItemShape,
  ]).isRequired,
  yearIndex: PropTypes.number.isRequired,
  semesterIndex: PropTypes.oneOf(0, 1).isRequired,
  beginIndex: PropTypes.number.isRequired,
  endIndex: PropTypes.number.isRequired,
  cellWidth: PropTypes.number.isRequired,
  cellHeight: PropTypes.number.isRequired,
  isRaised: PropTypes.bool.isRequired,
  isHighlighted: PropTypes.bool.isRequired,
  isDimmed: PropTypes.bool.isRequired,
  isSimple: PropTypes.bool.isRequired,
  onMouseOver: PropTypes.func,
  onMouseOut: PropTypes.func,
  onClick: PropTypes.func,
  deleteLecture: PropTypes.func.isRequired,
};

export default withTranslation()(
  React.memo(
    PlannerTile
  )
);
