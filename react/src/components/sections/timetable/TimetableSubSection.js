import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { range } from 'lodash';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';

import TimetableBlock from '../../blocks/TimetableBlock';

import { setLectureFocus, clearLectureFocus } from '../../../actions/timetable/lectureFocus';
import { setSelectedListCode, setMobileIsLectureListOpen } from '../../../actions/timetable/list';
import { dragSearch, clearDrag } from '../../../actions/timetable/search';
import { setIsDragging, updateCellSize, removeLectureFromTimetable } from '../../../actions/timetable/timetable';

import { LIST } from '../../../reducers/timetable/lectureFocus';
import { SEARCH } from '../../../reducers/timetable/list';

import userShape from '../../../shapes/UserShape';
import timetableShape from '../../../shapes/TimetableShape';
import lectureFocusShape from '../../../shapes/LectureFocusShape';

import {
  inTimetable,
  isFocused, isTableClicked, isDimmedTableLecture,
  performDeleteFromTable,
} from '../../../utils/lectureUtils';


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

  indexOfDay = (day) => {
    const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
    return days.indexOf(day);
  }

  // eslint-disable-next-line arrow-body-style
  indexOfMinute = (minute) => {
    return minute / 30 - (2 * 8);
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

  // check is drag contain class time
  _getOccupiedTimes = (dragDay, dragStart, dragEnd) => {
    const { selectedTimetable } = this.props;

    if (!selectedTimetable) {
      return [];
    }

    return selectedTimetable.lectures.map((lecture) => (
      lecture.classtimes.map((ct) => {
        if ((ct.day === dragDay)
          && (dragStart < this.indexOfMinute(ct.end))
          && (dragEnd > this.indexOfMinute(ct.begin))) {
          return [
            Math.max(dragStart, this.indexOfMinute(ct.begin)) - dragStart,
            Math.min(dragEnd, this.indexOfMinute(ct.end)) - dragStart,
          ];
        }
        return undefined;
      })
    ))
      .reduce((acc, val) => acc.concat(val), [])
      .filter((x) => x !== undefined);
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
    const dayIndex = this.indexOfDay(firstDragCell.getAttribute('data-day'));
    const startIndex = this.indexOfMinute(firstDragCell.getAttribute('data-minute'));
    const endIndex = this.indexOfMinute(target.getAttribute('data-minute'));
    const incr = startIndex < endIndex ? 1 : -1;
    // eslint-disable-next-line no-loops/no-loops, fp/no-loops, fp/no-let, fp/no-mutation
    for (let i = startIndex + incr; i !== endIndex + incr; i += incr) {
      if (
        (incr > 0)
          ? this._getOccupiedTimes(dayIndex, startIndex, i + 1).length > 0
          : this._getOccupiedTimes(dayIndex, i, startIndex + 1).length > 0
      ) {
        return;
      }
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

    const startDay = this.indexOfDay(firstDragCell.getAttribute('data-day'));
    const startIndex = this.indexOfMinute(firstDragCell.getAttribute('data-minute'));
    const endIndex = this.indexOfMinute(secondDragCell.getAttribute('data-minute'));
    if (startIndex === endIndex) {
      clearDragDispatch();
      return;
    }
    dragSearchDispatch(startDay, Math.min(startIndex, endIndex), Math.max(startIndex, endIndex) + 1);
    setMobileIsLectureListOpenDispatch(true);
    setSelectedListCodeDispatch(SEARCH);
  }

  blockHover = (lecture) => () => {
    const { lectureFocus, isDragging, setLectureFocusDispatch } = this.props;

    if (!lectureFocus.clicked && !isDragging) {
      setLectureFocusDispatch(lecture, 'TABLE', false);
    }
  }

  blockOut = () => {
    const { lectureFocus, clearLectureFocusDispatch } = this.props;

    if (!lectureFocus.clicked) {
      clearLectureFocusDispatch();
    }
  }

  blockClick = (lecture) => () => {
    const { lectureFocus, setLectureFocusDispatch } = this.props;

    if (isTableClicked(lecture, lectureFocus)) {
      setLectureFocusDispatch(lecture, 'TABLE', false);
    }
    else {
      setLectureFocusDispatch(lecture, 'TABLE', true);
    }
  }

  deleteLecture = (lecture) => {
    const { selectedTimetable, user, removeLectureFromTimetableDispatch } = this.props;

    if (!selectedTimetable) {
      return;
    }

    performDeleteFromTable(this, lecture, selectedTimetable, user, 'Timetable', removeLectureFromTimetableDispatch);
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
    const tempLecture = ((lectureFocus.from === LIST) && !inTimetable(lectureFocus.lecture, selectedTimetable))
      ? lectureFocus.lecture
      : null;

    const getTimeString = (time) => {
      const hour = Math.floor(time / 60);
      const minute = `00${time % 60}`.slice(-2);
      return `${hour}:${minute}`;
    };
    const isOutsideTable = (classtime) => (
      classtime.day < 0 || classtime.day > 4 || classtime.begin < 60 * 8 || classtime.end > 60 * 24
    );
    const untimedBlockTitles = [];
    const mapClasstimeToBlock = (lecture, classtime, isTemp) => {
      const isUntimed = !classtime || isOutsideTable(classtime);
      if (isUntimed) {
        const title = classtime
          ? `${[t('ui.day.saturdayShort'), t('ui.day.sundayShort')][classtime.day - 5]} ${getTimeString(classtime.begin)}~${getTimeString(classtime.end)}`
          : t('ui.others.timeNone');
        // eslint-disable-next-line fp/no-mutating-methods
        untimedBlockTitles.push(title);
      }
      return (
        <TimetableBlock
          key={classtime ? `${lecture.id}:${classtime.day}:${classtime.begin}` : `${lecture.id}:no-time`}
          lecture={lecture}
          classtime={classtime}
          dayIndex={isUntimed
            ? ((untimedBlockTitles.length - 1) % 5)
            : classtime.day}
          beginIndex={isUntimed
            ? (32 + Math.floor((untimedBlockTitles.length - 1) / 5))
            : (classtime.begin / 30 - 16)}
          endIndex={isUntimed
            ? (32 + Math.floor((untimedBlockTitles.length - 1) / 5) + 3)
            : (classtime.end / 30 - 16)}
          cellWidth={cellWidth}
          cellHeight={cellHeight}
          isTimetableReadonly={!selectedTimetable || Boolean(selectedTimetable.isReadOnly)}
          isRaised={isTableClicked(lecture, lectureFocus)}
          isHighlighted={isFocused(lecture, lectureFocus)}
          isDimmed={isDimmedTableLecture(lecture, lectureFocus)}
          isTemp={isTemp}
          isSimple={mobileIsLectureListOpen}
          blockHover={isTemp ? null : this.blockHover}
          blockOut={isTemp ? null : this.blockOut}
          blockClick={isTemp ? null : this.blockClick}
          deleteLecture={this.deleteLecture}
          occupiedTimes={(isTemp && !isUntimed)
            ? this._getOccupiedTimes(classtime.day, this.indexOfMinute(classtime.begin), this.indexOfMinute(classtime.end))
            : undefined}
        />
      );
    };
    const mapLectureToBlocks = (lecture, isTemp) => (
      lecture.classtimes.length === 0
        ? mapClasstimeToBlock(lecture, null, isTemp)
        : lecture.classtimes.map((ct) => mapClasstimeToBlock(lecture, ct, isTemp))
    );
    const timetableLectureBlocks = timetableLectures.map((lecture) => mapLectureToBlocks(lecture, false));
    const tempLectureBlocks = tempLecture
      ? mapLectureToBlocks(tempLecture, true)
      : null;

    const targetMinutes = range(8 * 60, 24 * 60, 30);
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
      const untimedArea = range(Math.ceil(untimedBlockTitles.length / 5)).map((_, i) => (
        <React.Fragment key={_}>
          <div />
          <div className={classNames('table-head')} />
          <div />
          <div />
          <div />
        </React.Fragment>
      ));
      return [
        <div className={classNames('table-head')} key={8 * 60}><strong>8</strong></div>,
        timedArea,
        untimedArea,
      ];
    };
    const getColumnCells = (day, dayName, dayIdx) => {
      // eslint-disable-next-line arrow-body-style
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
            key={`${day}:${i.toString()}`}
            data-day={day}
            data-minute={i.toString()}
            onMouseDown={(e) => this.onMouseDown(e)}
            onTouchStart={(e) => this.onTouchStart(e)}
            onMouseMove={(e) => this.onMouseMove(e)}
            onTouchMove={(e) => this.onTouchMove(e)}
          />
        );
      });
      const untimedArea = range(Math.ceil(untimedBlockTitles.length / 5)).map((_, i) => (
        <React.Fragment key={_}>
          <div className={classNames('cell')} />
          <div className={classNames('table-head')}>{untimedBlockTitles[i * 5 + dayIdx]}</div>
          <div className={classNames('cell', 'cell-top')} />
          <div className={classNames('cell', 'cell-bottom', (mobileIsLectureListOpen ? 'cell-bottom--mobile-noline' : ''))} />
          <div className={classNames('cell', 'cell-bottom', 'cell-last', (mobileIsLectureListOpen ? 'cell-bottom--mobile-noline' : ''))} />
        </React.Fragment>
      ));
      return [
        <div className={classNames('table-head')} key={day}>{dayName}</div>,
        timedArea,
        untimedArea,
      ];
    };

    const dragCell = firstDragCell && secondDragCell
      ? (
        <div
          className={classNames('section-content--timetable__drag-cell')}
          style={{
            left: (cellWidth + 5) * this.indexOfDay(firstDragCell.getAttribute('data-day')) + 17,
            width: cellWidth + 2,
            top: cellHeight * Math.min(this.indexOfMinute(firstDragCell.getAttribute('data-minute')), this.indexOfMinute(secondDragCell.getAttribute('data-minute'))) + 19,
            height: cellHeight * (Math.abs(this.indexOfMinute(firstDragCell.getAttribute('data-minute')) - this.indexOfMinute(secondDragCell.getAttribute('data-minute'))) + 1) - 3,
          }}
        />
      )
      : null;

    return (
      <div className={classNames('section-content', 'section-content--timetable')} onMouseUp={(e) => this.onMouseUp(e)} onTouchEnd={(e) => this.onTouchEnd(e)}>
        <div className={classNames('section-content--timetable__table')}>
          <div>
            {getColumnHeads()}
          </div>
          <div>
            {getColumnCells('mon', t('ui.day.monday'), 0)}
          </div>
          <div>
            {getColumnCells('tue', t('ui.day.tuesday'), 1)}
          </div>
          <div>
            {getColumnCells('wed', t('ui.day.wednesday'), 2)}
          </div>
          <div>
            {getColumnCells('thu', t('ui.day.thursday'), 3)}
          </div>
          <div>
            {getColumnCells('fri', t('ui.day.friday'), 4)}
          </div>
        </div>
        {dragCell}
        {timetableLectureBlocks}
        {tempLectureBlocks}
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


export default withTranslation()(connect(mapStateToProps, mapDispatchToProps)(TimetableSubSection));
