import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { range } from 'lodash';

import { appBoundClassNames as classNames } from '../../../../common/boundClassNames';
import { TIMETABLE_START_HOUR, TIMETABLE_END_HOUR } from '../../../../common/constants';

import TimetableTile from '../../../tiles/TimetableTile';

import { setLectureFocus, clearLectureFocus } from '../../../../actions/timetable/lectureFocus';
import { setSelectedListCode, setMobileIsLectureListOpen } from '../../../../actions/timetable/list';
import { setClasstimeOptions, clearClasstimeOptions, openSearch } from '../../../../actions/timetable/search';
import { setIsDragging, updateCellSize, removeLectureFromTimetable } from '../../../../actions/timetable/timetable';

import { LectureFocusFrom } from '../../../../reducers/timetable/lectureFocus';
import { LectureListCode } from '../../../../reducers/timetable/list';

import userShape from '../../../../shapes/model/session/UserShape';
import timetableShape, { myPseudoTimetableShape } from '../../../../shapes/model/timetable/TimetableShape';
import lectureFocusShape from '../../../../shapes/state/timetable/LectureFocusShape';
import { getDayStr, getRangeStr } from '../../../../utils/timeUtils';

import {
  inTimetable,
  isFocused, isTableClicked, isDimmedTableLecture, getOverallLectures, getColorNumber,
} from '../../../../utils/lectureUtils';
import { performDeleteFromTable } from '../../../../common/commonOperations';
import TimetableDragTile from '../../../tiles/TimetableDragTile';


class TimetableSubSection extends Component {
  constructor(props) {
    super(props);
    this.state = {
      firstDragCell: null,
      secondDragCell: null,
    };
  }

  componentDidMount() {
    this.resize();
    window.addEventListener('resize', this.resize);
  }

  componentDidUpdate(prevProps) {
    const { mobileIsLectureListOpen } = this.props;
    this.resize();

    if (prevProps.mobileIsLectureListOpen !== mobileIsLectureListOpen) {
      const TOTAL_DURATION = 0.15;
      const INTERVAL = 0.05;

      range(TOTAL_DURATION / INTERVAL + 1).forEach((i) => {
        const millis = (i + 2) * 0.05 * 1000;
        window.setTimeout(this.resize, millis);
      });
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resize);
  }

  resize = () => {
    const { updateCellSizeDispatch } = this.props;

    const cell = document.getElementsByClassName(classNames('subsection--timetable__table__body__cell'))[0].getBoundingClientRect();
    updateCellSizeDispatch(cell.width, cell.height + 1);
  }

  _getIndexOfMinute = (minute) => {
    return minute / 30 - (2 * TIMETABLE_START_HOUR);
  }

  onMouseDown = (e) => {
    e.stopPropagation();
    e.preventDefault();

    this._dragStart(e.target);
  }

  onTouchStart = (e) => {
    e.stopPropagation();
    e.preventDefault();

    const elementAtPosition = document.elementFromPoint(e.touches[0].pageX, e.touches[0].pageY);
    if (elementAtPosition === null) {
      return;
    }
    const targetElementAtPosition = elementAtPosition.closest(`.${classNames('subsection--timetable__table__body__cell--drag')}`);
    if (targetElementAtPosition === null) {
      return;
    }

    this._dragStart(targetElementAtPosition);
  }

  _dragStart = (target) => {
    const { clearLectureFocusDispatch, setIsDraggingDispatch } = this.props;

    this.setState({ firstDragCell: target, secondDragCell: target });
    clearLectureFocusDispatch();
    setIsDraggingDispatch(true);
  }

  _getOccupiedTimes = (day, begin, end) => {
    const { selectedTimetable } = this.props;

    if (!selectedTimetable) {
      return [];
    }

    const timetableClasstimes = selectedTimetable.lectures
      .map((l) => l.classtimes)
      .flat(1);
    return timetableClasstimes
      .filter((ct) => ((ct.day === day) && (begin < ct.end) && (end > ct.begin)))
      .map((ct) => [Math.max(begin, ct.begin), Math.min(end, ct.end)]);
  }

  onMouseMove = (e) => {
    this._dragMove(e.target);
  }

  onTouchMove = (e) => {
    const elementAtPosition = document.elementFromPoint(e.touches[0].pageX, e.touches[0].pageY);
    if (elementAtPosition === null) {
      return;
    }
    const targetElementAtPosition = elementAtPosition.closest(`.${classNames('subsection--timetable__table__body__cell--drag')}`);
    if (targetElementAtPosition === null) {
      return;
    }

    this._dragMove(targetElementAtPosition);
  }

  _dragMove = (target) => {
    const { firstDragCell } = this.state;
    const { isDragging } = this.props;

    if (!isDragging) return;
    const day = Number(firstDragCell.dataset.day);
    const firstCellTime = Number(firstDragCell.dataset.minute);
    const secondCellTime = Number(target.dataset.minute);
    const upperTime = Math.min(firstCellTime, secondCellTime);
    const lowerTime = Math.max(firstCellTime, secondCellTime) + 30;
    if (this._getOccupiedTimes(day, upperTime, lowerTime).length > 0) {
      return;
    }
    this.setState({ secondDragCell: target });
  }

  onMouseUp = (e) => {
    this._dragEnd();
  }

  onTouchEnd = (e) => {
    this._dragEnd();
  }

  _dragEnd = () => {
    const { firstDragCell, secondDragCell } = this.state;
    const {
      isDragging,
      setIsDraggingDispatch, openSearchDispatch,
      setClasstimeOptionsDispatch, clearClasstimeOptionsDispatch,
      setSelectedListCodeDispatch, setMobileIsLectureListOpenDispatch,
    } = this.props;

    if (!isDragging) {
      return;
    }
    setIsDraggingDispatch(false);
    this.setState({ firstDragCell: null, secondDragCell: null });

    const day = Number(firstDragCell.dataset.day);
    const firstCellTime = Number(firstDragCell.dataset.minute);
    const secondCellTime = Number(secondDragCell.dataset.minute);
    if (firstCellTime === secondCellTime) {
      clearClasstimeOptionsDispatch();
      return;
    }

    const upperTime = Math.min(firstCellTime, secondCellTime);
    const lowerTime = Math.max(firstCellTime, secondCellTime) + 30;
    setClasstimeOptionsDispatch(day, upperTime, lowerTime);
    setMobileIsLectureListOpenDispatch(true);
    setSelectedListCodeDispatch(LectureListCode.SEARCH);
    openSearchDispatch();
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
    const {
      selectedTimetable, user,
      removeLectureFromTimetableDispatch, clearLectureFocusDispatch,
    } = this.props;

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
      clearLectureFocusDispatch();
    };
    performDeleteFromTable(
      lecture, selectedTimetable, user, 'Timetable',
      beforeRequest, afterResponse,
    );
  }

  render() {
    const { t } = this.props;
    const { firstDragCell, secondDragCell } = this.state;
    const {
      selectedTimetable, lectureFocus,
      cellWidth, cellHeight,
      mobileIsLectureListOpen,
    } = this.props;

    const overallLectures = getOverallLectures(selectedTimetable, lectureFocus);
    const isOutsideTable = (classtime) => (
      (classtime.day < 0 || classtime.day > 4)
      || (classtime.begin < 60 * TIMETABLE_START_HOUR || classtime.end > 60 * TIMETABLE_END_HOUR)
    );
    const lecCtPairsWithClasstime = overallLectures
      .map((l) => l.classtimes.map((ct) => ({ lecture: l, classtime: ct })))
      .flat(1);
    const lecCtPairsWithoutClasstime = overallLectures
      .filter((l) => (l.classtimes.length === 0))
      .map((l) => ({ lecture: l, classtime: null }));
    const lecCtPairsInsideTable = (
      lecCtPairsWithClasstime.filter((p) => !isOutsideTable(p.classtime))
    );
    const lecCtPairsOutsideTable = [
      ...lecCtPairsWithClasstime.filter((p) => isOutsideTable(p.classtime)),
      ...lecCtPairsWithoutClasstime,
    ];

    const getUntimedTitle = (classtime) => (
      classtime
        ? getRangeStr(classtime.day, classtime.begin, classtime.end)
        : t('ui.others.timeNone')
    );
    const getTimetableTile = (lecture, classtime, isUntimed, untimedIndex, isTemp) => {
      return (
        <TimetableTile
          key={classtime ? `${lecture.id}:${classtime.day}:${classtime.begin}` : `${lecture.id}:no-time`}
          lecture={lecture}
          classtime={classtime}
          tableIndex={isUntimed
            ? Math.floor(untimedIndex / 5) + 1
            : 0
          }
          dayIndex={isUntimed
            ? (untimedIndex % 5)
            : classtime.day}
          beginIndex={isUntimed
            ? 0
            : (classtime.begin / 30 - TIMETABLE_START_HOUR * 2)}
          endIndex={isUntimed
            ? 3
            : (classtime.end / 30 - TIMETABLE_START_HOUR * 2)}
          color={getColorNumber(lecture)}
          cellWidth={cellWidth}
          cellHeight={cellHeight}
          isTimetableReadonly={!selectedTimetable || Boolean(selectedTimetable.isReadOnly)}
          isRaised={isTableClicked(lecture, lectureFocus)}
          isHighlighted={isFocused(lecture, lectureFocus)}
          isDimmed={isDimmedTableLecture(lecture, lectureFocus)}
          isTemp={isTemp}
          isSimple={mobileIsLectureListOpen}
          onMouseOver={isTemp ? null : this.focusLectureWithHover}
          onMouseOut={isTemp ? null : this.unfocusLectureWithHover}
          onClick={isTemp ? null : this.focusLectureWithClick}
          deleteLecture={this.deleteLectureFromTimetable}
          occupiedIndices={
            (isTemp && !isUntimed)
              ? this._getOccupiedTimes(classtime.day, classtime.begin, classtime.end)
                .map((ot) => [this._getIndexOfMinute(ot[0]), this._getIndexOfMinute(ot[1])])
              : undefined
          }
        />
      );
    };
    const isTemp = (lecture) => (
      lectureFocus.from === LectureFocusFrom.LIST
      && lectureFocus.lecture.id === lecture.id
      && !inTimetable(lectureFocus.lecture, selectedTimetable)
    );
    const tilesInsideTable = lecCtPairsInsideTable.map((p) => (
      getTimetableTile(p.lecture, p.classtime, false, undefined, isTemp(p.lecture))
    ));
    const tilesOutsideTable = lecCtPairsOutsideTable.map((p, i) => (
      getTimetableTile(p.lecture, p.classtime, true, i, isTemp(p.lecture))
    ));
    const untimedTileTitles = lecCtPairsOutsideTable.map((p) => (
      getUntimedTitle(p.classtime)
    ));

    const tableHours = range(TIMETABLE_START_HOUR, TIMETABLE_END_HOUR);
    const getHeadColumn = () => {
      const timedArea = [
        <div className={classNames('subsection--timetable__table__label__title')} key="title" />,
        ...(
          tableHours.map((h) => {
            const HourTag = (h % 6 === 0) ? 'strong' : 'span';
            return [
              <div className={classNames('subsection--timetable__table__label__line')} key={`line:${h * 60}`}>
                <HourTag>{((h - 1) % 12) + 1}</HourTag>
              </div>,
              <div className={classNames('subsection--timetable__table__label__cell')} key={`cell:${h * 60}`} />,
              <div className={classNames('subsection--timetable__table__label__line')} key={`line:${h * 60 + 30}`} />,
              <div className={classNames('subsection--timetable__table__label__cell')} key={`cell:${h * 60 + 30}`} />,
            ];
          })
            .flat(1)
        ),
        <div className={classNames('subsection--timetable__table__label__line')} key="line:1440">
          <strong>{12}</strong>
        </div>,
      ];
      const untimedArea = range(Math.ceil(untimedTileTitles.length / 5)).map((_, i) => (
        [
          <div className={classNames('subsection--timetable__table__label__gap')} key="gap" />,
          <div className={classNames('subsection--timetable__table__label__title')} key="title" />,
          <div className={classNames('subsection--timetable__table__label__line')} key="line:1" />,
          <div className={classNames('subsection--timetable__table__label__cell')} key="cell:1" />,
          <div className={classNames('subsection--timetable__table__label__line')} key="line:2" />,
          <div className={classNames('subsection--timetable__table__label__cell')} key="cell:2" />,
          <div className={classNames('subsection--timetable__table__label__line')} key="line:3" />,
          <div className={classNames('subsection--timetable__table__label__cell')} key="cell:3" />,
          <div className={classNames('subsection--timetable__table__label__line')} key="line:4" />,
        ]
      ));
      return (
        <div className={classNames('subsection--timetable__table__label')}>
          { timedArea }
          { untimedArea }
        </div>
      );
    };
    const getDayColumn = (dayIdx) => {
      const timedArea = [
        <div className={classNames('subsection--timetable__table__body__title')} key="title">
          {getDayStr(dayIdx)}
        </div>,
        ...(
          tableHours.map((h) => {
            return [
              <div
                className={classNames(
                  'subsection--timetable__table__body__line',
                  (h % 6 === 0) ? 'subsection--timetable__table__body__line--bold' : null,
                )}
                key={`line:${h * 60}`}
              />,
              <div
                className={classNames(
                  'subsection--timetable__table__body__cell',
                  'subsection--timetable__table__body__cell--drag',
                )}
                key={`cell:${h * 60}`}
                data-day={dayIdx}
                data-minute={h * 60}
                onMouseDown={(e) => this.onMouseDown(e)}
                onTouchStart={(e) => this.onTouchStart(e)}
                onMouseMove={(e) => this.onMouseMove(e)}
                onTouchMove={(e) => this.onTouchMove(e)}
              />,
              <div
                className={classNames(
                  'subsection--timetable__table__body__line',
                  'subsection--timetable__table__body__line--dashed',
                  (mobileIsLectureListOpen ? 'subsection--timetable__table__body__line--mobile-noline' : null),
                )}
                key={`line:${h * 60 + 30}`}
              />,
              <div
                className={classNames(
                  'subsection--timetable__table__body__cell',
                  'subsection--timetable__table__body__cell--drag',
                )}
                key={`cell:${h * 60 + 30}`}
                data-day={dayIdx}
                data-minute={h * 60 + 30}
                onMouseDown={(e) => this.onMouseDown(e)}
                onTouchStart={(e) => this.onTouchStart(e)}
                onMouseMove={(e) => this.onMouseMove(e)}
                onTouchMove={(e) => this.onTouchMove(e)}
              />,
            ];
          })
            .flat(1)
        ),
        <div
          className={classNames(
            'subsection--timetable__table__body__line',
            'subsection--timetable__table__body__line--bold',
          )}
          key="line:1440"
        />,
      ];
      const untimedArea = range(Math.ceil(untimedTileTitles.length / 5)).map((i) => (
        [
          <div className={classNames('subsection--timetable__table__body__gap')} key="gap" />,
          <div className={classNames('subsection--timetable__table__body__title')} key="title">
            { untimedTileTitles[i * 5 + dayIdx] }
          </div>,
          <div
            className={classNames(
              'subsection--timetable__table__body__line',
              'subsection--timetable__table__body__line--bold',
            )}
            key="line:1"
          />,
          <div className={classNames('subsection--timetable__table__body__cell')} key="cell:1" />,
          <div
            className={classNames(
              'subsection--timetable__table__body__line',
              'subsection--timetable__table__body__line--dashed',
              (mobileIsLectureListOpen ? 'subsection--timetable__table__body__line--mobile-noline' : null),
            )}
            key="line:2"
          />,
          <div className={classNames('subsection--timetable__table__body__cell')} key="cell:2" />,
          <div
            className={classNames(
              'subsection--timetable__table__body__line',
              'subsection--timetable__table__body__line--dashed',
              (mobileIsLectureListOpen ? 'subsection--timetable__table__body__line--mobile-noline' : null),
            )}
            key="line:3"
          />,
          <div className={classNames('subsection--timetable__table__body__cell')} key="cell:3" />,
          <div
            className={classNames(
              'subsection--timetable__table__body__line',
              'subsection--timetable__table__body__line--bold',
            )}
            key="line:4"
          />,
        ]
      ));
      return (
        <div className={classNames('subsection--timetable__table__body')}>
          { timedArea }
          { untimedArea }
        </div>
      );
    };

    const dragTile = firstDragCell && secondDragCell
      ? (
        <TimetableDragTile
          dayIndex={Number(firstDragCell.dataset.day)}
          beginIndex={
            Math.min(
              this._getIndexOfMinute(Number(firstDragCell.dataset.minute)),
              this._getIndexOfMinute(Number(secondDragCell.dataset.minute))
            )
          }
          endIndex={
            Math.max(
              this._getIndexOfMinute(Number(firstDragCell.dataset.minute)),
              this._getIndexOfMinute(Number(secondDragCell.dataset.minute))
            ) + 1
          }
          cellWidth={cellWidth}
          cellHeight={cellHeight}
        />
      )
      : null;

    return (
      <div className={classNames('subsection', 'subsection--timetable')} onMouseUp={(e) => this.onMouseUp(e)} onTouchEnd={(e) => this.onTouchEnd(e)}>
        <div className={classNames('subsection--timetable__table')}>
          {getHeadColumn()}
          {getDayColumn(0)}
          {getDayColumn(1)}
          {getDayColumn(2)}
          {getDayColumn(3)}
          {getDayColumn(4)}
        </div>
        {dragTile}
        {tilesInsideTable}
        {tilesOutsideTable}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.common.user.user,
  selectedTimetable: state.timetable.timetable.selectedTimetable,
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
  openSearchDispatch: () => {
    dispatch(openSearch());
  },
  setClasstimeOptionsDispatch: (day, start, end) => {
    dispatch(setClasstimeOptions(day, start, end));
  },
  clearClasstimeOptionsDispatch: () => {
    dispatch(clearClasstimeOptions());
  },
  setIsDraggingDispatch: (isDragging) => {
    dispatch(setIsDragging(isDragging));
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
  setSelectedListCodeDispatch: (listCode) => {
    dispatch(setSelectedListCode(listCode));
  },
  setMobileIsLectureListOpenDispatch: (mobileIsLectureListOpen) => {
    dispatch(setMobileIsLectureListOpen(mobileIsLectureListOpen));
  },
});

TimetableSubSection.propTypes = {
  user: userShape,
  selectedTimetable: PropTypes.oneOfType([timetableShape, myPseudoTimetableShape]),
  lectureFocus: lectureFocusShape.isRequired,
  cellWidth: PropTypes.number.isRequired,
  cellHeight: PropTypes.number.isRequired,
  isDragging: PropTypes.bool.isRequired,
  mobileIsLectureListOpen: PropTypes.bool.isRequired,

  updateCellSizeDispatch: PropTypes.func.isRequired,
  openSearchDispatch: PropTypes.func.isRequired,
  setClasstimeOptionsDispatch: PropTypes.func.isRequired,
  clearClasstimeOptionsDispatch: PropTypes.func.isRequired,
  setIsDraggingDispatch: PropTypes.func.isRequired,
  setLectureFocusDispatch: PropTypes.func.isRequired,
  clearLectureFocusDispatch: PropTypes.func.isRequired,
  removeLectureFromTimetableDispatch: PropTypes.func.isRequired,
  setSelectedListCodeDispatch: PropTypes.func.isRequired,
  setMobileIsLectureListOpenDispatch: PropTypes.func.isRequired,
};


export default withTranslation()(
  connect(mapStateToProps, mapDispatchToProps)(
    TimetableSubSection
  )
);
