import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { range } from 'lodash';

import { appBoundClassNames as classNames } from '../../../../common/boundClassNames';
import { PLANNER_DEFAULT_CREDIT } from '../../../../common/constants';

import { setLectureFocus, clearLectureFocus } from '../../../../actions/timetable/lectureFocus';
import { updateCellSize, removeLectureFromTimetable } from '../../../../actions/timetable/timetable';

import { LectureFocusFrom } from '../../../../reducers/timetable/lectureFocus';

import userShape from '../../../../shapes/model/UserShape';
import plannerShape from '../../../../shapes/model/PlannerShape';
import lectureFocusShape from '../../../../shapes/state/LectureFocusShape';

import { isTableClicked } from '../../../../utils/lectureUtils';
import { performDeleteFromTable } from '../../../../common/commonOperations';
import PlannerTile from '../../../tiles/PlannerTile';


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

    return [
      ...planner.taken_items.filter((i) => (
        i.lecture.year === year && i.lecture.semester === semester
      )),
      ...planner.future_items.filter((i) => (
        i.year === year && i.semester === semester
      )),
      ...planner.generic_items.filter((i) => (
        i.year === year && i.semester === semester
      )),
    ];
  }

  resize = () => {
    const { updateCellSizeDispatch } = this.props;

    const cell = document.getElementsByClassName(classNames('subsection--planner__table__body__cell'))[0].getBoundingClientRect();
    updateCellSizeDispatch(cell.width, cell.height + 1);
  }

  focusLectureWithHover = (lecture) => {
    const { lectureFocus, isDragging, setLectureFocusDispatch } = this.props;

    if (!lectureFocus.clicked && !isDragging) {
      setLectureFocusDispatch(lecture, LectureFocusFrom.TABLE, false);
    }
  }

  unfocusLectureWithHover = (lecture) => {
    const { lectureFocus, clearLectureFocusDispatch } = this.props;

    if (!lectureFocus.clicked) {
      clearLectureFocusDispatch();
    }
  }

  focusLectureWithClick = (lecture) => {
    const { lectureFocus, setLectureFocusDispatch } = this.props;

    if (isTableClicked(lecture, lectureFocus)) {
      setLectureFocusDispatch(lecture, LectureFocusFrom.TABLE, false);
    }
    else {
      setLectureFocusDispatch(lecture, LectureFocusFrom.TABLE, true);
    }
  }

  deleteLectureFromTimetable = (lecture) => {
    const { selectedPlanner, user, removeLectureFromTimetableDispatch } = this.props;

    if (!selectedPlanner) {
      return;
    }

    const beforeRequest = () => {
    };
    const afterResponse = () => {
      const newProps = this.props;
      if (!newProps.selectedPlanner || newProps.selectedPlanner.id !== selectedPlanner.id) {
        return;
      }
      // TODO: Fix timetable not updated when semester unchanged and timetable changed
      removeLectureFromTimetableDispatch(lecture);
    };
    performDeleteFromTable(
      lecture, selectedPlanner, user, 'Timetable',
      beforeRequest, afterResponse,
    );
  }

  render() {
    const {
      t,
      selectedPlanner,
      cellWidth, cellHeight,
      mobileIsLectureListOpen,
    } = this.props;

    const currentYear = (new Date()).getFullYear();
    const plannerStartYear = selectedPlanner ? selectedPlanner.start_year : currentYear;
    const plannerEndYear = selectedPlanner ? selectedPlanner.end_year : currentYear + 3;
    const plannerYears = range(plannerStartYear, plannerEndYear + 1);

    const hasSummerSemester = plannerYears
      .map((y) => this._getItemsForSemester(selectedPlanner, y, 2).length)
      .some((l) => (l > 0));
    const hasWinterSemester = plannerYears
      .map((y) => this._getItemsForSemester(selectedPlanner, y, 4).length)
      .some((l) => (l > 0));

    const plannerCreditunits = range(0, PLANNER_DEFAULT_CREDIT / 3);
    const getHeadColumn = () => {
      const springArea = [
        hasSummerSemester && (
          <div className={classNames('subsection--planner__table__label__toptitle')} key="title:summer" />
        ),
        <div className={classNames('subsection--planner__table__label__toptitle')} key="title:spring" />,
        <div className={classNames('subsection--planner__table__label__line')} key="line:24">
          <strong>{24}</strong>
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
        <div className={classNames('subsection--planner__table__label__line')} key="line:24">
          <strong>{24}</strong>
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
            {`${year} ${t('ui.semester.summer')}`}
          </div>
        ),
        <div className={classNames('subsection--planner__table__body__toptitle')} key="title:spring">
          {`${year} ${t('ui.semester.spring')}`}
        </div>,
        <div
          className={classNames(
            'subsection--planner__table__body__line',
            'subsection--planner__table__body__line--bold',
          )}
          key="line:24"
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
          key="line:24"
        />,
        <div className={classNames('subsection--planner__table__body__bottomtitle')} key="title:fall">
          {`${year} ${t('ui.semester.fall')}`}
        </div>,
        hasWinterSemester && (
          <div className={classNames('subsection--planner__table__body__bottomtitle')} key="title:winter">
            {`${year} ${t('ui.semester.winter')}`}
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

    const getTiles = (year, semester) => {
      const items = this._getItemsForSemester(selectedPlanner, year, semester);
      return items.map((i, index) => (
        <PlannerTile
          item={i}
          yearIndex={year - plannerStartYear}
          semesterIndex={semester <= 2 ? 0 : 1}
          beginIndex={index * 3}
          endIndex={index * 3 + 3}
          cellWidth={cellWidth}
          cellHeight={cellHeight}
          // TODO: Implement below
          isRaised={false}
          isHighlighted={false}
          isDimmed={false}
          isSimple={false}
          onMouseOver={() => null}
          onMouseOut={() => null}
          onClick={() => null}
          deleteLecture={() => null}
          key={`Tile:${year}-${semester}-${i.id}`}
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
              [1, 2, 3, 4].map((s) => (
                getTiles(y, s)
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
  lectureFocus: state.timetable.lectureFocus,
  cellWidth: state.timetable.timetable.cellWidth,
  cellHeight: state.timetable.timetable.cellHeight,
  isDragging: state.timetable.timetable.isDragging,
  mobileIsLectureListOpen: state.timetable.list.mobileIsLectureListOpen,
});

const mapDispatchToProps = (dispatch) => ({
  updateCellSizeDispatch: (width, height) => {
    dispatch(updateCellSize(width, height));
  },
  setLectureFocusDispatch: (lecture, from, clicked) => {
    dispatch(setLectureFocus(lecture, from, clicked));
  },
  clearLectureFocusDispatch: () => {
    dispatch(clearLectureFocus());
  },
  removeLectureFromTimetableDispatch: (lecture) => {
    dispatch(removeLectureFromTimetable(lecture));
  },
});

PlannerSubSection.propTypes = {
  user: userShape,
  selectedPlanner: plannerShape,
  lectureFocus: lectureFocusShape.isRequired,
  cellWidth: PropTypes.number.isRequired,
  cellHeight: PropTypes.number.isRequired,
  isDragging: PropTypes.bool.isRequired,
  mobileIsLectureListOpen: PropTypes.bool.isRequired,

  updateCellSizeDispatch: PropTypes.func.isRequired,
  setLectureFocusDispatch: PropTypes.func.isRequired,
  clearLectureFocusDispatch: PropTypes.func.isRequired,
  removeLectureFromTimetableDispatch: PropTypes.func.isRequired,
};


export default withTranslation()(
  connect(mapStateToProps, mapDispatchToProps)(
    PlannerSubSection
  )
);
