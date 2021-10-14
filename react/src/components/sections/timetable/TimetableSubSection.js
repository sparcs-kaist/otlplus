import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { range } from 'lodash';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';
import { TIMETABLE_START_HOUR, TIMETABLE_END_HOUR } from '../../../common/constants';

import TimetableTile from '../../tiles/TimetableTile';

import { setLectureFocus, clearLectureFocus } from '../../../actions/timetable/lectureFocus';
import { setSelectedListCode, setMobileIsLectureListOpen } from '../../../actions/timetable/list';
import { dragSearch, clearDrag } from '../../../actions/timetable/search';
import { setIsDragging, updateCellSize, removeLectureFromTimetable } from '../../../actions/timetable/timetable';

import { LectureFocusFrom } from '../../../reducers/timetable/lectureFocus';
import { LectureListCode } from '../../../reducers/timetable/list';

import userShape from '../../../shapes/UserShape';
import timetableShape from '../../../shapes/TimetableShape';
import lectureFocusShape from '../../../shapes/LectureFocusShape';

import {
  inTimetable,
  isFocused, isTableClicked, isDimmedTableLecture,
} from '../../../utils/lectureUtils';
import { performDeleteFromTable } from '../../../common/commonOperations';


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

  componentDidUpdate() {
    this.resize();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resize);
  }

  resize = () => {
    const { updateCellSizeDispatch } = this.props;

    const cell = document.getElementsByClassName(classNames('cell-top'))[0].getBoundingClientRect();
    updateCellSizeDispatch(cell.width, cell.height);
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
    const targetElementAtPosition = elementAtPosition.closest(`.${classNames('cell-drag')}`);
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
      .reduce((acc, val) => acc.concat(val.classtimes), []);
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
    const targetElementAtPosition = elementAtPosition.closest(`.${classNames('cell-drag')}`);
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
      setIsDraggingDispatch, dragSearchDispatch, clearDragDispatch,
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
      clearDragDispatch();
      return;
    }

    const upperTime = Math.min(firstCellTime, secondCellTime);
    const lowerTime = Math.max(firstCellTime, secondCellTime) + 30;
    dragSearchDispatch(day, upperTime, lowerTime);
    setMobileIsLectureListOpenDispatch(true);
    setSelectedListCodeDispatch(LectureListCode.SEARCH);
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
    const { t } = this.props;
    const { firstDragCell, secondDragCell } = this.state;
    const {
      selectedTimetable, lectureFocus,
      cellWidth, cellHeight,
      mobileIsLectureListOpen,
    } = this.props;

    const timetableLectures = selectedTimetable ? selectedTimetable.lectures : [];
    const isFocusedLectureTemporary = (
      (lectureFocus.from === LectureFocusFrom.LIST)
      && !inTimetable(lectureFocus.lecture, selectedTimetable)
    );
    const tempLecture = isFocusedLectureTemporary
      ? lectureFocus.lecture
      : null;

    const getTimeString = (time) => {
      const hour = Math.floor(time / 60);
      const minute = `00${time % 60}`.slice(-2);
      return `${hour}:${minute}`;
    };
    const isOutsideTable = (classtime) => (
      (classtime.day < 0 || classtime.day > 4)
      || (classtime.begin < 60 * TIMETABLE_START_HOUR || classtime.end > 60 * TIMETABLE_END_HOUR)
    );
    const untimedTileTitles = [];
    const mapClasstimeToTile = (lecture, classtime, isTemp) => {
      const isUntimed = !classtime || isOutsideTable(classtime);
      if (isUntimed) {
        const title = classtime
          ? `${[t('ui.day.saturdayShort'), t('ui.day.sundayShort')][classtime.day - 5]} ${getTimeString(classtime.begin)}~${getTimeString(classtime.end)}`
          : t('ui.others.timeNone');
        // eslint-disable-next-line fp/no-mutating-methods
        untimedTileTitles.push(title);
      }
      return (
        <TimetableTile
          key={classtime ? `${lecture.id}:${classtime.day}:${classtime.begin}` : `${lecture.id}:no-time`}
          lecture={lecture}
          classtime={classtime}
          tableIndex={isUntimed
            ? Math.floor((untimedTileTitles.length - 1) / 5) + 1
            : 0
          }
          dayIndex={isUntimed
            ? ((untimedTileTitles.length - 1) % 5)
            : classtime.day}
          beginIndex={isUntimed
            ? 0
            : (classtime.begin / 30 - TIMETABLE_START_HOUR * 2)}
          endIndex={isUntimed
            ? 3
            : (classtime.end / 30 - TIMETABLE_START_HOUR * 2)}
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
    const mapLectureToTiles = (lecture, isTemp) => (
      lecture.classtimes.length === 0
        ? mapClasstimeToTile(lecture, null, isTemp)
        : lecture.classtimes.map((ct) => mapClasstimeToTile(lecture, ct, isTemp))
    );
    const timetableLectureTiles = timetableLectures.map((lecture) => (
      mapLectureToTiles(lecture, false)
    ));
    const tempLectureTiles = tempLecture
      ? mapLectureToTiles(tempLecture, true)
      : null;

    const targetMinutes = range(TIMETABLE_START_HOUR * 60, TIMETABLE_END_HOUR * 60, 30);
    const getColumnHeads = () => {
      const timedArea = targetMinutes.map((i) => {
        const i2 = i + 30;
        if (i2 % (6 * 60) === 0) {
          return <div key={i2}><strong>{((i2 / 60 - 1) % 12) + 1}</strong></div>;
        }
        if (i2 % 60 === 0) {
          return <div key={i2}><span>{((i2 / 60 - 1) % 12) + 1}</span></div>;
        }
        return <div key={i2} />;
      });
      const untimedArea = range(Math.ceil(untimedTileTitles.length / 5)).map((_, i) => (
        <React.Fragment key={_}>
          <div />
          <div className={classNames('table-head')} />
          <div />
          <div />
          <div />
        </React.Fragment>
      ));
      return [
        <div className={classNames('table-head')} key={TIMETABLE_START_HOUR * 60}><strong>{TIMETABLE_START_HOUR}</strong></div>,
        timedArea,
        untimedArea,
      ];
    };
    const getColumnCells = (dayName, dayIdx) => {
      const timedArea = targetMinutes.map((i) => {
        return (
          <div
            className={classNames(
              'cell',
              'cell-drag',
              (i % 60 === 0) ? 'cell-top' : 'cell-bottom',
              (i % 60 === 30) && mobileIsLectureListOpen ? 'cell-bottom--mobile-noline' : '',
              (i === 23 * 60 + 30) ? 'cell-last' : '',
              (i % (6 * 60) === 0) ? 'cell-bold' : '',
            )}
            key={`${dayIdx}:${i.toString()}`}
            data-day={dayIdx}
            data-minute={i.toString()}
            onMouseDown={(e) => this.onMouseDown(e)}
            onTouchStart={(e) => this.onTouchStart(e)}
            onMouseMove={(e) => this.onMouseMove(e)}
            onTouchMove={(e) => this.onTouchMove(e)}
          />
        );
      });
      const untimedArea = range(Math.ceil(untimedTileTitles.length / 5)).map((_, i) => (
        <React.Fragment key={_}>
          <div className={classNames('cell')} />
          <div className={classNames('table-head')}>{untimedTileTitles[i * 5 + dayIdx]}</div>
          <div className={classNames('cell', 'cell-top')} />
          <div className={classNames('cell', 'cell-bottom', (mobileIsLectureListOpen ? 'cell-bottom--mobile-noline' : ''))} />
          <div className={classNames('cell', 'cell-bottom', 'cell-last', (mobileIsLectureListOpen ? 'cell-bottom--mobile-noline' : ''))} />
        </React.Fragment>
      ));
      return [
        <div className={classNames('table-head')} key={dayIdx}>{dayName}</div>,
        timedArea,
        untimedArea,
      ];
    };

    const dragCell = firstDragCell && secondDragCell
      ? (
        <div
          className={classNames('subsection--timetable__drag-cell')}
          style={{
            left: (cellWidth + 5) * Number(firstDragCell.dataset.day) + 17,
            width: cellWidth + 2,
            top: cellHeight * Math.min(this._getIndexOfMinute(Number(firstDragCell.dataset.minute)), this._getIndexOfMinute(Number(secondDragCell.dataset.minute))) + 19,
            height: cellHeight * (Math.abs(this._getIndexOfMinute(Number(firstDragCell.dataset.minute)) - this._getIndexOfMinute(Number(secondDragCell.dataset.minute))) + 1) - 3,
          }}
        />
      )
      : null;

    return (
      <div className={classNames('subsection', 'subsection--timetable')} onMouseUp={(e) => this.onMouseUp(e)} onTouchEnd={(e) => this.onTouchEnd(e)}>
        <div className={classNames('subsection--timetable__table')}>
          <div>
            {getColumnHeads()}
          </div>
          <div>
            {getColumnCells(t('ui.day.monday'), 0)}
          </div>
          <div>
            {getColumnCells(t('ui.day.tuesday'), 1)}
          </div>
          <div>
            {getColumnCells(t('ui.day.wednesday'), 2)}
          </div>
          <div>
            {getColumnCells(t('ui.day.thursday'), 3)}
          </div>
          <div>
            {getColumnCells(t('ui.day.friday'), 4)}
          </div>
        </div>
        {dragCell}
        {timetableLectureTiles}
        {tempLectureTiles}
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
  dragSearchDispatch: (day, start, end) => {
    dispatch(dragSearch(day, start, end));
  },
  clearDragDispatch: () => {
    dispatch(clearDrag());
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
  selectedTimetable: timetableShape,
  lectureFocus: lectureFocusShape.isRequired,
  cellWidth: PropTypes.number.isRequired,
  cellHeight: PropTypes.number.isRequired,
  isDragging: PropTypes.bool.isRequired,
  mobileIsLectureListOpen: PropTypes.bool.isRequired,

  updateCellSizeDispatch: PropTypes.func.isRequired,
  dragSearchDispatch: PropTypes.func.isRequired,
  clearDragDispatch: PropTypes.func.isRequired,
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
