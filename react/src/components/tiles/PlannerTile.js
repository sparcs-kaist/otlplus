import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { appBoundClassNames as classNames } from '../../common/boundClassNames';

import takenPlannerItemShape from '../../shapes/model/planner/TakenPlannerItemShape';
import futurePlannerItemShape from '../../shapes/model/planner/FuturePlannerItemShape';
import arbitraryPlannerItemShape from '../../shapes/model/planner/ArbitraryPlannerItemShape';
import { getCourseOfItem, getSemesterOfItem } from '../../utils/itemUtils';


const PlannerTile = ({
  t,
  item,
  yearIndex, semesterIndex, beginIndex, endIndex,
  color,
  tableSize, cellWidth, cellHeight,
  isPlannerWithSummer, isPlannerWithWinter,
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
    const base = 17 + (isPlannerWithSummer ? 15 : 0) + (cellHeight * tableSize);
    if (semesterIndex === 0) {
      return base - (cellHeight * endIndex) + 2;
    }
    if (semesterIndex === 1) {
      return (base + cellHeight * 2 + 11) + (cellHeight * beginIndex) + 1;
    }
    return base;
  };

  return (
    <div
      className={classNames(
        'tile',
        'tile--planner',
        `background-color--${color}`,
        (item.item_type === 'TAKEN' ? null : 'background-color--stripe'),
        (isRaised ? 'tile--raised' : null),
        (isHighlighted ? 'tile--highlighted' : null),
        (isDimmed ? 'tile--dimmed' : null),
        (item.is_excluded ? 'tile--planner--excluded' : null),
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
      { item.item_type !== 'TAKEN'
        ? (
          <button
            className={classNames('tile--planner__button')}
            onClick={handleDeleteFromTableClick}
          >
            <i className={classNames('icon', 'icon--delete-lecture')} />
          </button>
        )
        : null
      }
      <div
        className={classNames('tile--planner__content')}
      >
        <p className={classNames('tile--planner__content__title', (isSimple ? 'mobile-hidden' : null))}>
          {getCourseOfItem(item)[t('js.property.title')]}
        </p>
        {
          (getSemesterOfItem(item) % 2 === 0) && (
            <p
              className={classNames(
                'tile--planner__content__label',
                isSimple ? 'mobile-hidden' : null,
                `background-color--${color}`,
                'background-color--dark'
              )}
            >
              S
            </p>
          )
        }
        {
          (item.item_type === 'ARBITRARY') && (
            <p
              className={classNames(
                'tile--planner__content__label',
                isSimple ? 'mobile-hidden' : null,
                `background-color--${color}`,
                'background-color--dark'
              )}
            >
              ?
            </p>
          )
        }
        {
          (item.is_excluded) && (
            <p
              className={classNames(
                'tile--planner__content__label',
                isSimple ? 'mobile-hidden' : null,
                `background-color--${color}`,
                'background-color--dark'
              )}
            >
              X
            </p>
          )
        }
      </div>
    </div>
  );
};

PlannerTile.propTypes = {
  item: PropTypes.oneOfType([
    takenPlannerItemShape, futurePlannerItemShape, arbitraryPlannerItemShape,
  ]).isRequired,
  yearIndex: PropTypes.number.isRequired,
  semesterIndex: PropTypes.oneOf([0, 1]).isRequired,
  beginIndex: PropTypes.number.isRequired,
  endIndex: PropTypes.number.isRequired,
  color: PropTypes.number.isRequired,
  tableSize: PropTypes.number.isRequired,
  cellWidth: PropTypes.number.isRequired,
  cellHeight: PropTypes.number.isRequired,
  isPlannerWithSummer: PropTypes.bool.isRequired,
  isPlannerWithWinter: PropTypes.bool.isRequired,
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
