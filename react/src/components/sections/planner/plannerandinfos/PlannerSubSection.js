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
import timetableShape from '../../../../shapes/model/TimetableShape';
import lectureFocusShape from '../../../../shapes/state/LectureFocusShape';

import { isTableClicked } from '../../../../utils/lectureUtils';
import { performDeleteFromTable } from '../../../../common/commonOperations';


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
    const { selectedTimetable, user, removeLectureFromTimetableDispatch } = this.props;

    if (!selectedTimetable) {
      return;
    }

    const beforeRequest = () => {
    };
    const afterResponse = () => {
      const newProps = this.props;
      if (!newProps.selectedTimetable || newProps.selectedTimetable.id !== selectedTimetable.id) {
        return;
      }
      // TODO: Fix timetable not updated when semester unchanged and timetable changed
      removeLectureFromTimetableDispatch(lecture);
    };
    performDeleteFromTable(
      lecture, selectedTimetable, user, 'Timetable',
      beforeRequest, afterResponse,
    );
  }

  render() {
    const {
      t,
      // cellWidth, cellHeight,
      mobileIsLectureListOpen,
    } = this.props;

    const plannerCreditunits = range(0, PLANNER_DEFAULT_CREDIT / 3);
    const getHeadColumn = () => {
      const springArea = [
        <div className={classNames('subsection--planner__table__label__toptitle')} key="title" />,
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
        <div className={classNames('subsection--planner__table__label__bottomtitle')} key="title" />,
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
    const getYearColumn = (yearIdx) => {
      const springArea = [
        <div className={classNames('subsection--planner__table__body__toptitle')} key="title">
          {`${2020 + yearIdx} ${t('ui.semester.spring')}`}
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
        <div className={classNames('subsection--planner__table__body__bottomtitle')} key="title">
          {`${2020 + yearIdx} ${t('ui.semester.fall')}`}
        </div>,
      ];
      return (
        <div className={classNames('subsection--planner__table__body')}>
          {springArea}
          <div className={classNames('subsection--planner__table__body__cell')} />
          <div className={classNames('subsection--planner__table__body__year')}>
            <strong>{yearIdx + 2020}</strong>
          </div>
          <div className={classNames('subsection--planner__table__body__cell')} />
          {fallArea}
        </div>
      );
    };

    return (
      <div className={classNames('subsection', 'subsection--planner')}>
        <div className={classNames('subsection--planner__table')}>
          {getHeadColumn()}
          {getYearColumn(0)}
          {getYearColumn(1)}
          {getYearColumn(2)}
          {getYearColumn(3)}
          {getYearColumn(4)}
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.common.user.user,
  selectedTimetable: state.timetable.timetable.selectedTimetable,
  lectureFocus: state.timetable.lectureFocus,
  // cellWidth: state.timetable.timetable.cellWidth,
  // cellHeight: state.timetable.timetable.cellHeight,
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
  selectedTimetable: timetableShape,
  lectureFocus: lectureFocusShape.isRequired,
  // cellWidth: PropTypes.number.isRequired,
  // cellHeight: PropTypes.number.isRequired,
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
