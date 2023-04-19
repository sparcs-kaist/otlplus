import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import axios from 'axios';
import { withTranslation } from 'react-i18next';
import {
  range, sortBy, sum, sumBy,
} from 'lodash';

import { appBoundClassNames as classNames } from '../../../../common/boundClassNames';
import { PLANNER_DEFAULT_CREDIT } from '../../../../common/constants';

import { setItemFocus, clearItemFocus } from '../../../../actions/planner/itemFocus';
import { removeItemFromPlanner, updateCellSize } from '../../../../actions/planner/planner';

import { ItemFocusFrom } from '../../../../reducers/planner/itemFocus';

import userShape from '../../../../shapes/model/session/UserShape';
import plannerShape from '../../../../shapes/model/planner/PlannerShape';
import itemFocusShape from '../../../../shapes/state/planner/ItemFocusShape';

import {
  getCourseOfItem,
  getCreditOfItem, getAuOfItem, getCreditAndAuOfItem,
} from '../../../../utils/itemUtils';
import { getCategoryOfItem, getColorOfItem } from '../../../../utils/itemCategoryUtils';
import {
  isDimmedItem, isFocusedItem, isTableClickedItem,
} from '../../../../utils/itemFocusUtils';
import PlannerTile from '../../../tiles/PlannerTile';
import { getSemesterName } from '../../../../utils/semesterUtils';


class PlannerSubSection extends Component {
  componentDidMount() {
    this.resize();
    window.addEventListener('resize', this.resize);
  }

  componentDidUpdate() {
    this.resize();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resize);
  }

  _getItemsForSemester = (planner, year, semester) => {
    if (!planner) {
      return [];
    }

    return sortBy(
      [
        ...planner.taken_items.filter((i) => (
          i.lecture.year === year && i.lecture.semester === semester
        )),
        ...planner.future_items.filter((i) => (
          i.year === year && i.semester === semester
        )),
        ...planner.arbitrary_items.filter((i) => (
          i.year === year && i.semester === semester
        )),
      ],
      (i) => {
        const category = getCategoryOfItem(planner, i);
        return i.is_excluded ? (100 ** 4) : 0
        + category[0] * (100 ** 3)
        + category[1] * (100 ** 2)
        + category[2] * 100
        + (100 - getCreditAndAuOfItem(i));
      }
    );
  }

  resize = () => {
    const { updateCellSizeDispatch } = this.props;

    const cell = document.getElementsByClassName(classNames('subsection--planner__table__body__cell'))[0].getBoundingClientRect();
    updateCellSizeDispatch(cell.width, cell.height + 1);
  }

  _getFromOfItem = (item) => {
    if (item.item_type === 'TAKEN') {
      return ItemFocusFrom.TABLE_TAKEN;
    }
    if (item.item_type === 'FUTURE') {
      return ItemFocusFrom.TABLE_FUTURE;
    }
    if (item.item_type === 'ARBITRARY') {
      return ItemFocusFrom.TABLE_ARBITRARY;
    }
    return '';
  }

  _getTileSizeOfItem = (item) => {
    return getCreditAndAuOfItem(item);
  }

  focusItemWithHover = (item) => {
    const { itemFocus, isDragging, setItemFocusDispatch } = this.props;

    if (!itemFocus.clicked && !isDragging) {
      setItemFocusDispatch(item, getCourseOfItem(item), this._getFromOfItem(item), false);
    }
  }

  unfocusItemWithHover = (item) => {
    const { itemFocus, clearItemFocusDispatch } = this.props;

    if (!itemFocus.clicked) {
      clearItemFocusDispatch();
    }
  }

  focusItemWithClick = (item) => {
    const { itemFocus, setItemFocusDispatch } = this.props;

    if (isTableClickedItem(item, itemFocus)) {
      setItemFocusDispatch(item, getCourseOfItem(item), this._getFromOfItem(item), false);
    }
    else {
      setItemFocusDispatch(item, getCourseOfItem(item), this._getFromOfItem(item), true);
    }
  }

  deleteItemFromPlanner = (item) => {
    const {
      selectedPlanner, user,
      removeItemFromPlannerDispatch, clearItemFocusDispatch,
    } = this.props;

    if (!selectedPlanner) {
      return;
    }

    if (!user) {
      removeItemFromPlannerDispatch(item);
      clearItemFocusDispatch();
    }
    else {
      axios.post(
        `/api/users/${user.id}/planners/${selectedPlanner.id}/remove-item`,
        {
          item: item.id,
          item_type: item.item_type,
        },
        {
          metadata: {
            gaCategory: 'Planner',
            gaVariable: 'POST Update / Instance',
          },
        },
      )
        .then((response) => {
          const newProps = this.props;
          if (!newProps.selectedPlanner || newProps.selectedPlanner.id !== selectedPlanner.id) {
            return;
          }
          removeItemFromPlannerDispatch(item);
          clearItemFocusDispatch();
        })
        .catch((error) => {
        });
    }
  }

  render() {
    const {
      t,
      selectedPlanner, itemFocus,
      cellWidth, cellHeight,
      // mobileIsLectureListOpen,
    } = this.props;

    const mobileIsLectureListOpen = false;

    const currentYear = (new Date()).getFullYear();
    const plannerStartYear = selectedPlanner ? selectedPlanner.start_year : currentYear;
    const plannerEndYear = selectedPlanner ? selectedPlanner.end_year : currentYear + 3;
    const plannerYears = range(plannerStartYear, plannerEndYear + 1);

    const tableSize = Math.max(
      ...plannerYears.map((y) => (
        [1, 3].map((s) => {
          const regularItems = this._getItemsForSemester(selectedPlanner, y, s);
          const seasonalItems = this._getItemsForSemester(selectedPlanner, y, s + 1);
          const requiredSize = (
            sumBy(regularItems, (i) => this._getTileSizeOfItem(i))
            + sumBy(seasonalItems, (i) => this._getTileSizeOfItem(i))
          );
          return Math.floor(requiredSize / 3) * 3;
        })
      )).flat(),
      PLANNER_DEFAULT_CREDIT,
    );
    const hasSummerSemester = plannerYears
      .map((y) => this._getItemsForSemester(selectedPlanner, y, 2).length)
      .some((l) => (l > 0));
    const hasWinterSemester = plannerYears
      .map((y) => this._getItemsForSemester(selectedPlanner, y, 4).length)
      .some((l) => (l > 0));

    const getTitleForSemester = (year, semester) => {
      const items = this._getItemsForSemester(selectedPlanner, year, semester);
      const credit = sumBy(items, (i) => getCreditOfItem(i));
      const au = sumBy(items, (i) => getAuOfItem(i));

      if ((semester % 2 === 0) && (credit === 0) && (au === 0)) {
        return null;
      }

      return (
        <>
          <span>
            {
              `${year} ${getSemesterName(semester)}`
            }
          </span>
          <span>
            {
              au === 0
                ? `${t('ui.others.creditCount', { count: credit })}`
                : `${t('ui.others.creditCount', { count: credit })} ${t('ui.others.auCount', { count: au })}`
            }
          </span>
        </>
      );
    };

    const plannerCreditunits = range(0, tableSize / 3);
    const getHeadColumn = () => {
      const springArea = [
        hasSummerSemester && (
          <div className={classNames('subsection--planner__table__label__toptitle')} key="title:summer" />
        ),
        <div className={classNames('subsection--planner__table__label__toptitle')} key="title:spring" />,
        <div className={classNames('subsection--planner__table__label__line')} key={`line:${tableSize}`}>
          <strong>{tableSize}</strong>
        </div>,
        ...(
          // eslint-disable-next-line fp/no-mutating-methods
          plannerCreditunits.slice().reverse().map((c) => {
            const CreditTag = ((3 * c) % 12 === 0 && c !== 0) ? 'strong' : 'span';
            return [
              <div className={classNames('subsection--planner__table__label__cell')} key={`cell:${3 * c + 3}`} />,
              <div className={classNames('subsection--planner__table__label__line')} key={`line:${3 * c + 2}`} />,
              <div className={classNames('subsection--planner__table__label__cell')} key={`cell:${3 * c + 2}`} />,
              <div className={classNames('subsection--planner__table__label__line')} key={`line:${3 * c + 1}`} />,
              <div className={classNames('subsection--planner__table__label__cell')} key={`cell:${3 * c + 1}`} />,
              <div className={classNames('subsection--planner__table__label__line')} key={`line:${3 * c}`}>
                <CreditTag>{3 * c}</CreditTag>
              </div>,
            ];
          })
            .flat(1)
        ),
      ];
      const fallArea = [
        ...(
          plannerCreditunits.map((c) => {
            const CreditTag = ((3 * c) % 12 === 0 && c !== 0) ? 'strong' : 'span';
            return [
              <div className={classNames('subsection--planner__table__label__line')} key={`line:${3 * c}`}>
                <CreditTag>{3 * c}</CreditTag>
              </div>,
              <div className={classNames('subsection--planner__table__label__cell')} key={`cell:${3 * c + 1}`} />,
              <div className={classNames('subsection--planner__table__label__line')} key={`line:${3 * c + 1}`} />,
              <div className={classNames('subsection--planner__table__label__cell')} key={`cell:${3 * c + 2}`} />,
              <div className={classNames('subsection--planner__table__label__line')} key={`line:${3 * c + 2}`} />,
              <div className={classNames('subsection--planner__table__label__cell')} key={`cell:${3 * c + 3}`} />,
            ];
          })
            .flat(1)
        ),
        <div className={classNames('subsection--planner__table__label__line')} key={`line:${tableSize}`}>
          <strong>{tableSize}</strong>
        </div>,
        <div className={classNames('subsection--planner__table__label__bottomtitle')} key="title:fall" />,
        hasWinterSemester && (
          <div className={classNames('subsection--planner__table__label__bottomtitle')} key="title:winter" />
        ),
      ];
      return (
        <div className={classNames('subsection--planner__table__label')}>
          {springArea}
          <div className={classNames('subsection--planner__table__label__cell')} />
          <div className={classNames('subsection--planner__table__label__year')} />
          <div className={classNames('subsection--planner__table__label__cell')} />
          {fallArea}
        </div>
      );
    };
    const getYearColumn = (year) => {
      const springArea = [
        hasSummerSemester && (
          <div className={classNames('subsection--planner__table__body__toptitle')} key="title:summer">
            { getTitleForSemester(year, 2) }
          </div>
        ),
        <div className={classNames('subsection--planner__table__body__toptitle')} key="title:spring">
          { getTitleForSemester(year, 1) }
        </div>,
        <div
          className={classNames(
            'subsection--planner__table__body__line',
            'subsection--planner__table__body__line--bold',
          )}
          key={`line:${tableSize}`}
        />,
        ...(
          // eslint-disable-next-line fp/no-mutating-methods
          plannerCreditunits.slice().reverse().map((c) => {
            return [
              <div
                className={classNames(
                  'subsection--planner__table__body__cell',
                )}
                key={`cell:${3 * c + 3}`}
              />,
              <div
                className={classNames(
                  'subsection--planner__table__body__line',
                  'subsection--planner__table__body__line--dashed',
                  (mobileIsLectureListOpen ? 'subsection--planner__table__body__line--mobile-noline' : null),
                )}
                key={`line:${3 * c + 2}`}
              />,
              <div
                className={classNames(
                  'subsection--planner__table__body__cell',
                )}
                key={`cell:${3 * c + 2}`}
              />,
              <div
                className={classNames(
                  'subsection--planner__table__body__line',
                  'subsection--planner__table__body__line--dashed',
                  (mobileIsLectureListOpen ? 'subsection--planner__table__body__line--mobile-noline' : null),
                )}
                key={`line:${3 * c + 1}`}
              />,
              <div
                className={classNames(
                  'subsection--planner__table__body__cell',
                )}
                key={`cell:${3 * c + 1}`}
              />,
              <div
                className={classNames(
                  'subsection--planner__table__body__line',
                  ((3 * c) % 12 === 0 && c !== 0) ? 'subsection--planner__table__body__line--bold' : null,
                )}
                key={`line:${3 * c}`}
              />,
            ];
          })
            .flat(1)
        ),
      ];
      const fallArea = [
        ...(
          plannerCreditunits.map((c) => {
            return [
              <div
                className={classNames(
                  'subsection--planner__table__body__line',
                  ((3 * c) % 12 === 0 && c !== 0) ? 'subsection--planner__table__body__line--bold' : null,
                )}
                key={`line:${3 * c}`}
              />,
              <div
                className={classNames(
                  'subsection--planner__table__body__cell',
                )}
                key={`cell:${3 * c + 1}`}
              />,
              <div
                className={classNames(
                  'subsection--planner__table__body__line',
                  'subsection--planner__table__body__line--dashed',
                  (mobileIsLectureListOpen ? 'subsection--planner__table__body__line--mobile-noline' : null),
                )}
                key={`line:${3 * c + 1}`}
              />,
              <div
                className={classNames(
                  'subsection--planner__table__body__cell',
                )}
                key={`cell:${3 * c + 2}`}
              />,
              <div
                className={classNames(
                  'subsection--planner__table__body__line',
                  'subsection--planner__table__body__line--dashed',
                  (mobileIsLectureListOpen ? 'subsection--planner__table__body__line--mobile-noline' : null),
                )}
                key={`line:${3 * c + 2}`}
              />,
              <div
                className={classNames(
                  'subsection--planner__table__body__cell',
                )}
                key={`cell:${3 * c + 3}`}
              />,
            ];
          })
            .flat(1)
        ),
        <div
          className={classNames(
            'subsection--planner__table__body__line',
            'subsection--planner__table__body__line--bold',
          )}
          key={`line:${tableSize}`}
        />,
        <div className={classNames('subsection--planner__table__body__bottomtitle')} key="title:fall">
          { getTitleForSemester(year, 3) }
        </div>,
        hasWinterSemester && (
          <div className={classNames('subsection--planner__table__body__bottomtitle')} key="title:winter">
            { getTitleForSemester(year, 4) }
          </div>
        ),
      ];
      return (
        <div className={classNames('subsection--planner__table__body')} key={year}>
          {springArea}
          <div className={classNames('subsection--planner__table__body__cell')} />
          <div className={classNames('subsection--planner__table__body__year')}>
            <strong>{year}</strong>
          </div>
          <div className={classNames('subsection--planner__table__body__cell')} />
          {fallArea}
        </div>
      );
    };

    const getTiles = (year, semester, shouldIncludeSeasonal) => {
      const items = [
        ...this._getItemsForSemester(selectedPlanner, year, semester),
        ...(
          shouldIncludeSeasonal
            ? this._getItemsForSemester(selectedPlanner, year, semester + 1)
            : []
        ),
      ];
      const sizes = items.map((i) => this._getTileSizeOfItem(i));
      return items.map((i, index) => (
        <PlannerTile
          item={i}
          yearIndex={year - plannerStartYear}
          semesterIndex={semester <= 2 ? 0 : 1}
          beginIndex={sum(sizes.slice(0, index))}
          endIndex={sum(sizes.slice(0, index)) + sizes[index]}
          color={getColorOfItem(selectedPlanner, i)}
          tableSize={tableSize}
          cellWidth={cellWidth}
          cellHeight={cellHeight}
          isPlannerWithSummer={hasSummerSemester}
          isPlannerWithWinter={hasWinterSemester}
          isRaised={isTableClickedItem(i, itemFocus)}
          isHighlighted={isFocusedItem(i, itemFocus, selectedPlanner)}
          isDimmed={isDimmedItem(i, itemFocus)}
          isSimple={false} // TODO: Implement this
          onMouseOver={this.focusItemWithHover}
          onMouseOut={this.unfocusItemWithHover}
          onClick={this.focusItemWithClick}
          deleteLecture={this.deleteItemFromPlanner}
          key={`Tile:${year}-${semester}-${i.item_type}-${i.id}`}
        />
      ));
    };

    return (
      <div className={classNames('subsection', 'subsection--planner')}>
        <div className={classNames('subsection--planner__table')}>
          {getHeadColumn()}
          {
            plannerYears.map((y) => (
              getYearColumn(y)
            ))
          }
          {
            plannerYears.map((y) => (
              [1, 3].map((s) => (
                getTiles(y, s, true)
              ))
            ))
          }
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.common.user.user,
  selectedPlanner: state.planner.planner.selectedPlanner,
  itemFocus: state.planner.itemFocus,
  cellWidth: state.planner.planner.cellWidth,
  cellHeight: state.planner.planner.cellHeight,
  isDragging: state.planner.planner.isDragging,
  // mobileIsLectureListOpen: state.planner.list.mobileIsLectureListOpen,
});

const mapDispatchToProps = (dispatch) => ({
  updateCellSizeDispatch: (width, height) => {
    dispatch(updateCellSize(width, height));
  },
  setItemFocusDispatch: (item, course, from, clicked) => {
    dispatch(setItemFocus(item, course, from, clicked));
  },
  clearItemFocusDispatch: () => {
    dispatch(clearItemFocus());
  },
  removeItemFromPlannerDispatch: (item) => {
    dispatch(removeItemFromPlanner(item));
  },
});

PlannerSubSection.propTypes = {
  user: userShape,
  selectedPlanner: plannerShape,
  itemFocus: itemFocusShape.isRequired,
  cellWidth: PropTypes.number.isRequired,
  cellHeight: PropTypes.number.isRequired,
  isDragging: PropTypes.bool.isRequired,
  // mobileIsLectureListOpen: PropTypes.bool.isRequired,

  updateCellSizeDispatch: PropTypes.func.isRequired,
  setItemFocusDispatch: PropTypes.func.isRequired,
  clearItemFocusDispatch: PropTypes.func.isRequired,
  removeItemFromPlannerDispatch: PropTypes.func.isRequired,
};


export default withTranslation()(
  connect(mapStateToProps, mapDispatchToProps)(
    PlannerSubSection
  )
);
