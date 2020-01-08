import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';

import { inTimetable, isListHover, isTableClicked, isTableHover, isInMultiple, isInactiveTableLecture, performDeleteFromTable, isListClicked } from '../../../common/lectureFunctions';
import TimetableBlock from '../../blocks/TimetableBlock';
import { setLectureActive, clearLectureActive } from '../../../actions/timetable/lectureActive';
import { setCurrentList, setMobileShowLectureList } from '../../../actions/timetable/list';
import { dragSearch, clearDrag } from '../../../actions/timetable/search';
import { setIsDragging, updateCellSize, removeLectureFromTimetable } from '../../../actions/timetable/timetable';
import { NONE, LIST, TABLE, MULTIPLE } from '../../../reducers/timetable/lectureActive';
import userShape from '../../../shapes/UserShape';
import lectureShape from '../../../shapes/LectureShape';
import timetableShape from '../../../shapes/TimetableShape';
import lectureActiveShape from '../../../shapes/LectureActiveShape';


class TimetableSubSection extends Component {
  constructor(props) {
    super(props);
    this.state = {
      firstBlock: null,
      secondBlock: null,
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

  // '800':0, '830':1, ..., '2330':31
  indexOfTime = (timeStr) => {
    const time = parseInt(timeStr, 10);
    const divide = time < 800 ? 60 : 100;
    const hour = Math.floor(time / divide) - 8;
    const min = time % divide;
    return hour * 2 + min / 30;
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
    const { clearLectureActiveDispatch, setIsDraggingDispatch } = this.props;

    this.setState({ firstBlock: target, secondBlock: target });
    clearLectureActiveDispatch();
    setIsDraggingDispatch(true);
  }

  // check is drag contain class time
  _getOccupiedTime = (dragDay, dragStart, dragEnd) => {
    const { currentTimetable } = this.props;

    if (!currentTimetable) {
      return [];
    }

    return currentTimetable.lectures.map(lecture => (
      lecture.classtimes.map((classtime) => {
        if ((classtime.day === dragDay) && (dragStart < this.indexOfMinute(classtime.end)) && (dragEnd > this.indexOfMinute(classtime.begin))) {
          return [Math.max(dragStart, this.indexOfMinute(classtime.begin)) - dragStart, Math.min(dragEnd, this.indexOfMinute(classtime.end)) - dragStart];
        }
        return undefined;
      })
    ))
      .reduce((acc, val) => acc.concat(val), [])
      .filter(x => x !== undefined);
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
    const { firstBlock } = this.state;
    const { isDragging } = this.props;

    if (!isDragging) return;
    const dayIndex = this.indexOfDay(firstBlock.getAttribute('data-day'));
    const startIndex = this.indexOfTime(firstBlock.getAttribute('data-time'));
    const endIndex = this.indexOfTime(target.getAttribute('data-time'));
    const incr = startIndex < endIndex ? 1 : -1;
    // eslint-disable-next-line no-loops/no-loops, fp/no-loops, fp/no-let, fp/no-mutation
    for (let i = startIndex + incr; i !== endIndex + incr; i += incr) {
      if ((incr > 0) ? this._getOccupiedTime(dayIndex, startIndex, i + 1).length > 0 : this._getOccupiedTime(dayIndex, i, startIndex + 1).length > 0) {
        return;
      }
    }
    this.setState({ secondBlock: target });
  }

  onMouseUp = (e) => {
    this._dragEnd();
  }

  onTouchEnd = (e) => {
    this._dragEnd();
  }

  _dragEnd = () => {
    const { firstBlock, secondBlock } = this.state;
    const { isDragging, setIsDraggingDispatch, dragSearchDispatch, clearDragDispatch, setCurrentListDispatch, setMobileShowLectureListDispatch } = this.props;

    if (!isDragging) {
      return;
    }
    setIsDraggingDispatch(false);
    this.setState({ firstBlock: null, secondBlock: null });

    const startDay = this.indexOfDay(firstBlock.getAttribute('data-day'));
    const startIndex = this.indexOfTime(firstBlock.getAttribute('data-time'));
    const endIndex = this.indexOfTime(secondBlock.getAttribute('data-time'));
    if (startIndex === endIndex) {
      clearDragDispatch();
      return;
    }
    dragSearchDispatch(startDay, Math.min(startIndex, endIndex), Math.max(startIndex, endIndex) + 1);
    setMobileShowLectureListDispatch(true);
    setCurrentListDispatch('SEARCH');
  }

  blockHover = lecture => () => {
    const { lectureActiveClicked, isDragging, setLectureActiveDispatch } = this.props;

    if (!lectureActiveClicked && !isDragging) {
      setLectureActiveDispatch(lecture, 'TABLE', false);
    }
  }

  blockOut = () => {
    const { lectureActiveClicked, clearLectureActiveDispatch } = this.props;

    if (!lectureActiveClicked) {
      clearLectureActiveDispatch();
    }
  }

  blockClick = lecture => () => {
    const { lectureActive, setLectureActiveDispatch } = this.props;

    if (isTableClicked(lecture, lectureActive)) {
      setLectureActiveDispatch(lecture, 'TABLE', false);
    }
    else {
      setLectureActiveDispatch(lecture, 'TABLE', true);
    }
  }

  deleteLecture = lecture => (event) => {
    const { currentTimetable, user, removeLectureFromTimetableDispatch } = this.props;
    event.stopPropagation();
    if (!currentTimetable) {
      return;
    }

    performDeleteFromTable(this, lecture, currentTimetable, user, removeLectureFromTimetableDispatch);
  }

  render() {
    const { t } = this.props;
    const { firstBlock, secondBlock } = this.state;
    const { currentTimetable, lectureActive, cellWidth, cellHeight, lectureActiveFrom, lectureActiveLecture, mobileShowLectureList } = this.props;

    const lectures = currentTimetable ? currentTimetable.lectures : [];
    const untimedBlockTitles = [];
    const getTimeString = (time) => {
      const hour = Math.floor(time / 60);
      const minute = `00${time % 60}`.slice(-2);
      return `${hour}:${minute}`;
    };
    const getTimetableBlock = (lecture, classtime, isUntimed, isTemp) => {
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
          dayIndex={isUntimed ? ((untimedBlockTitles.length - 1) % 5) : classtime.day}
          beginIndex={isUntimed ? (32 + Math.floor((untimedBlockTitles.length - 1) / 5)) : (classtime.begin / 30 - 16)}
          endIndex={isUntimed ? (32 + Math.floor((untimedBlockTitles.length - 1) / 5) + 3) : (classtime.end / 30 - 16)}
          cellWidth={cellWidth}
          cellHeight={cellHeight}
          isTimetableReadonly={!currentTimetable || Boolean(currentTimetable.isReadOnly)}
          isClicked={isTableClicked(lecture, lectureActive)}
          isHover={isTableHover(lecture, lectureActive) || isListHover(lecture, lectureActive) || isListClicked(lecture, lectureActive) || isInMultiple(lecture, lectureActive)}
          isInactive={isInactiveTableLecture(lecture, lectureActive)}
          isTemp={isTemp}
          isSimple={mobileShowLectureList}
          blockHover={isTemp ? null : this.blockHover}
          blockOut={isTemp ? null : this.blockOut}
          blockClick={isTemp ? null : this.blockClick}
          deleteLecture={this.deleteLecture}
          occupiedTime={(isTemp && !isUntimed) ? this._getOccupiedTime(classtime.day, this.indexOfMinute(classtime.begin), this.indexOfMinute(classtime.end)) : undefined}
        />
      );
    };
    const lectureBlocks = lectures.map(lecture => (
      (lecture.classtimes.length === 0)
        ? getTimetableBlock(lecture, null, true, false)
        : lecture.classtimes.map(classtime => (
          (classtime.day < 0 || classtime.day > 4 || classtime.begin < 60 * 8 || classtime.end > 60 * 24)
            ? getTimetableBlock(lecture, classtime, true, false)
            : getTimetableBlock(lecture, classtime, false, false)
        ))
    ));
    const tempBlocks = ((lectureActiveFrom === LIST) && !inTimetable(lectureActiveLecture, currentTimetable))
      ? (
        lectureActiveLecture.classtimes.length === 0
          ? getTimetableBlock(lectureActiveLecture, null, true, true)
          : lectureActiveLecture.classtimes.map(classtime => (
            (classtime.day < 0 || classtime.day > 4 || classtime.begin < 60 * 8 || classtime.end > 60 * 24)
              ? getTimetableBlock(lectureActiveLecture, classtime, true, true)
              : getTimetableBlock(lectureActiveLecture, classtime, false, true)
          ))
      )
      : null;

    const getHeaders = () => {
      const numArray = [...Array((2350 - 800) / 50 + 1).keys()].map(i => i * 50 + 800); // [800, 850, 900, ..., 2350]
      return [
        <div className={classNames('table-head')}><strong>8</strong></div>,
        ...numArray.map((i) => {
          const i2 = i + 50;
          if (i2 % 600 === 0) {
            return <div><strong>{((i2 / 100 - 1) % 12) + 1}</strong></div>;
          }
          if (i2 % 100 === 0) {
            return <div><span>{((i2 / 100 - 1) % 12) + 1}</span></div>;
          }
          return <div />;
        }),
        ...Array(Math.ceil(untimedBlockTitles.length / 5)).fill(undefined).map((_, i) => (
          <>
            <div />
            <div className={classNames('table-head')} />
            <div />
            <div />
            <div />
          </>
        )),
      ];
    };

    const getCells = (day, ko, dayIdx) => {
      const numArray = [...Array((2350 - 800) / 50 + 1).keys()].map(i => i * 50 + 800); // [800, 850, 900, ..., 2350]
      const timeblock = [
        <div className={classNames('table-head')} key={day}>{ko}</div>,
        ...numArray.map((i) => {
          if (i === 1200) {
            return (
              <div
                className={classNames('cell', 'cell-drag', 'cell-top', 'cell-bold')}
                key={`${day}:1200`}
                data-day={day}
                data-time="1200"
                onMouseDown={e => this.onMouseDown(e)}
                onTouchStart={e => this.onTouchStart(e)}
                onMouseMove={e => this.onMouseMove(e)}
                onTouchMove={e => this.onTouchMove(e)}
              />
            );
          }
          if (i === 1800) {
            return (
              <div
                className={classNames('cell', 'cell-drag', 'cell-top', 'cell-bold')}
                key={`${day}:1800`}
                data-day={day}
                data-time="1800"
                onMouseDown={e => this.onMouseDown(e)}
                onTouchStart={e => this.onTouchStart(e)}
                onMouseMove={e => this.onMouseMove(e)}
                onTouchMove={e => this.onTouchMove(e)}
              />
            );
          }
          if (i === 2350) {
            return (
              <div
                className={classNames('cell', 'cell-drag', 'cell-bottom', (mobileShowLectureList ? 'cell-bottom--mobile-noline' : ''), 'cell-last')}
                key={`${day}:2330`}
                data-day={day}
                data-time="2330"
                onMouseDown={e => this.onMouseDown(e)}
                onTouchStart={e => this.onTouchStart(e)}
                onMouseMove={e => this.onMouseMove(e)}
                onTouchMove={e => this.onTouchMove(e)}
              />
            );
          }
          if (i % 100 === 0) {
            return (
              <div
                className={classNames('cell', 'cell-drag', 'cell-top')}
                key={`${day}:${i.toString()}`}
                data-day={day}
                data-time={i.toString()}
                onMouseDown={e => this.onMouseDown(e)}
                onTouchStart={e => this.onTouchStart(e)}
                onMouseMove={e => this.onMouseMove(e)}
                onTouchMove={e => this.onTouchMove(e)}
              />
            );
          }
          return (
            <div
              className={classNames('cell', 'cell-drag', 'cell-bottom', (mobileShowLectureList ? 'cell-bottom--mobile-noline' : ''))}
              key={`${day}:${(i - 20).toString()}`}
              data-day={day}
              data-time={(i - 20).toString()}
              onMouseDown={e => this.onMouseDown(e)}
              onTouchStart={e => this.onTouchStart(e)}
              onMouseMove={e => this.onMouseMove(e)}
              onTouchMove={e => this.onTouchMove(e)}
            />
          );
        }),
        ...Array(Math.ceil(untimedBlockTitles.length / 5)).fill(undefined).map((_, i) => (
          <>
            <div className={classNames('cell')} />
            <div className={classNames('table-head')}>{untimedBlockTitles[i * 5 + dayIdx]}</div>
            <div className={classNames('cell', 'cell-top')} />
            <div className={classNames('cell', 'cell-bottom')} />
            <div className={classNames('cell', 'cell-bottom', 'cell-last')} />
          </>
        )),
      ];
      return timeblock;
    };

    return (
      <div className={classNames('section-content', 'section-content--timetable')} onMouseUp={e => this.onMouseUp(e)} onTouchEnd={e => this.onTouchEnd(e)}>
        <div className={classNames('section-content--timetable__table')}>
          <div>
            {getHeaders()}
          </div>
          <div>
            {getCells('mon', t('ui.day.monday'), 0)}
          </div>
          <div>
            {getCells('tue', t('ui.day.tuesday'), 1)}
          </div>
          <div>
            {getCells('wed', t('ui.day.wednesday'), 2)}
          </div>
          <div>
            {getCells('thu', t('ui.day.thursday'), 3)}
          </div>
          <div>
            {getCells('fri', t('ui.day.friday'), 4)}
          </div>
        </div>
        {
          firstBlock && secondBlock
            ? (
              <div
                className={classNames('section-content--timetable__drag-cell')}
                style={{
                  left: (cellWidth + 5) * this.indexOfDay(firstBlock.getAttribute('data-day')) + 17,
                  width: cellWidth + 2,
                  top: cellHeight * Math.min(this.indexOfTime(firstBlock.getAttribute('data-time')), this.indexOfTime(secondBlock.getAttribute('data-time'))) + 19,
                  height: cellHeight * (Math.abs(this.indexOfTime(firstBlock.getAttribute('data-time')) - this.indexOfTime(secondBlock.getAttribute('data-time'))) + 1) - 3,
                }}
              />
            )
            : null
        }
        {lectureBlocks}
        {tempBlocks}
      </div>
    );
  }
}

const mapStateToProps = state => ({
  user: state.common.user.user,
  currentTimetable: state.timetable.timetable.currentTimetable,
  lectureActive: state.timetable.lectureActive,
  lectureActiveFrom: state.timetable.lectureActive.from,
  lectureActiveClicked: state.timetable.lectureActive.clicked,
  lectureActiveLecture: state.timetable.lectureActive.lecture,
  cellWidth: state.timetable.timetable.cellWidth,
  cellHeight: state.timetable.timetable.cellHeight,
  isDragging: state.timetable.timetable.isDragging,
  mobileShowLectureList: state.timetable.list.mobileShowLectureList,
});

const mapDispatchToProps = dispatch => ({
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
  setLectureActiveDispatch: (lecture, from, clicked) => {
    dispatch(setLectureActive(lecture, from, clicked));
  },
  clearLectureActiveDispatch: () => {
    dispatch(clearLectureActive());
  },
  removeLectureFromTimetableDispatch: (lecture) => {
    dispatch(removeLectureFromTimetable(lecture));
  },
  setCurrentListDispatch: (list) => {
    dispatch(setCurrentList(list));
  },
  setMobileShowLectureListDispatch: (mobileShowLectureList) => {
    dispatch(setMobileShowLectureList(mobileShowLectureList));
  },
});

TimetableSubSection.propTypes = {
  user: userShape,
  currentTimetable: timetableShape,
  lectureActive: lectureActiveShape.isRequired,
  lectureActiveFrom: PropTypes.oneOf([NONE, LIST, TABLE, MULTIPLE]).isRequired,
  lectureActiveClicked: PropTypes.bool.isRequired,
  lectureActiveLecture: lectureShape,
  cellWidth: PropTypes.number.isRequired,
  cellHeight: PropTypes.number.isRequired,
  isDragging: PropTypes.bool.isRequired,
  mobileShowLectureList: PropTypes.bool.isRequired,
  updateCellSizeDispatch: PropTypes.func.isRequired,
  dragSearchDispatch: PropTypes.func.isRequired,
  clearDragDispatch: PropTypes.func.isRequired,
  setIsDraggingDispatch: PropTypes.func.isRequired,
  setLectureActiveDispatch: PropTypes.func.isRequired,
  clearLectureActiveDispatch: PropTypes.func.isRequired,
  removeLectureFromTimetableDispatch: PropTypes.func.isRequired,
  setCurrentListDispatch: PropTypes.func.isRequired,
  setMobileShowLectureListDispatch: PropTypes.func.isRequired,
};


export default withTranslation()(connect(mapStateToProps, mapDispatchToProps)(TimetableSubSection));
