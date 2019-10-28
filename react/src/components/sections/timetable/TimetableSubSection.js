import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';

import { inTimetable, isListHover, isTableClicked, isTableHover, isInMultiple, isInactiveTableLecture, performDeleteFromTable, isListClicked } from '../../../common/lectureFunctions';
import TimetableBlock from '../../blocks/TimetableBlock';
import { dragSearch, setIsDragging, updateCellSize, setLectureActive, clearLectureActive, removeLectureFromTimetable, setCurrentList } from '../../../actions/timetable/index';
import { NONE, LIST, TABLE, MULTIPLE } from '../../../reducers/timetable/lectureActive';
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

  indexOfMinute = (minute) => {
    return minute / 30 - (2 * 8);
  }

  dragStart = (e) => {
    const { clearLectureActiveDispatch, setIsDraggingDispatch } = this.props;

    e.stopPropagation();
    e.preventDefault();
    this.setState({ firstBlock: e.target, secondBlock: e.target });
    clearLectureActiveDispatch();
    setIsDraggingDispatch(true);
  }

  // check is drag contain class time
  _getOccupiedTime = (dragDay, dragStart, dragEnd) => {
    const { currentTimetable } = this.props;

    if (!currentTimetable) {
      return false;
    }

    return currentTimetable.lectures.map(lecture => (
      lecture.classtimes.map((classtime) => {
        if ((classtime.day === dragDay) && (dragStart < this.indexOfMinute(classtime.end)) && (dragEnd > this.indexOfMinute(classtime.begin))) {
          return [Math.max(dragStart, this.indexOfMinute(classtime.begin)) - dragStart, Math.min(dragEnd, this.indexOfMinute(classtime.end)) - dragStart];
        }
        return undefined;
      })
    ))
      .flat()
      .filter(x => x !== undefined);
  }

  dragMove = (e) => {
    const { firstBlock } = this.state;
    const { isDragging } = this.props;

    if (!isDragging) return;
    const dayIndex = this.indexOfDay(firstBlock.getAttribute('data-day'));
    const startIndex = this.indexOfTime(firstBlock.getAttribute('data-time'));
    const endIndex = this.indexOfTime(e.target.getAttribute('data-time'));
    const incr = startIndex < endIndex ? 1 : -1;
    // eslint-disable-next-line no-loops/no-loops, fp/no-loops, fp/no-let, fp/no-mutation
    for (let i = startIndex + incr; i !== endIndex + incr; i += incr) {
      if ((incr > 0) ? this._getOccupiedTime(dayIndex, startIndex, i + 1).length > 0 : this._getOccupiedTime(dayIndex, i, startIndex + 1).length > 0) {
        return;
      }
    }
    this.setState({ secondBlock: e.target });
  }

  dragEnd = (e) => {
    const { firstBlock, secondBlock } = this.state;
    const { isDragging, setIsDraggingDispatch, dragSearchDispatch, setCurrentListDispatch } = this.props;

    if (!isDragging) return;
    setIsDraggingDispatch(false);
    this.setState({ firstBlock: null, secondBlock: null });

    const startDay = this.indexOfDay(firstBlock.getAttribute('data-day'));
    const startIndex = this.indexOfTime(firstBlock.getAttribute('data-time'));
    const endIndex = this.indexOfTime(secondBlock.getAttribute('data-time'));
    if (startIndex === endIndex) return;
    dragSearchDispatch(startDay, Math.min(startIndex, endIndex), Math.max(startIndex, endIndex) + 1);
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
    const { currentTimetable, removeLectureFromTimetableDispatch } = this.props;
    event.stopPropagation();
    if (!currentTimetable) {
      return;
    }

    performDeleteFromTable(this, lecture, currentTimetable, removeLectureFromTimetableDispatch);
  }

  render() {
    const { firstBlock, secondBlock } = this.state;
    const { currentTimetable, lectureActive, cellWidth, cellHeight, lectureActiveFrom, lectureActiveClicked, lectureActiveLecture, mobileShowLectureList } = this.props;

    const lectures = currentTimetable ? currentTimetable.lectures : [];
    const lectureBlocks = lectures.map(lecture => (
      lecture.classtimes.map(classtime => (
          // eslint-disable-next-line react/jsx-indent
          <TimetableBlock
            key={`${lecture.id}:${classtime.day}:${classtime.begin}`}
            lecture={lecture}
            classtime={classtime}
            cellWidth={cellWidth}
            cellHeight={cellHeight}
            isClicked={isTableClicked(lecture, lectureActive)}
            isHover={isTableHover(lecture, lectureActive) || isListHover(lecture, lectureActive) || isListClicked(lecture, lectureActive) || isInMultiple(lecture, lectureActive)}
            isInactive={isInactiveTableLecture(lecture, lectureActive)}
            isTemp={false}
            isSimple={mobileShowLectureList}
            blockHover={this.blockHover}
            blockOut={this.blockOut}
            blockClick={this.blockClick}
            deleteLecture={this.deleteLecture}
          />
      ))
    ));

    const dragDiv = (day, ko) => {
      const numArray = [...Array((2350 - 800) / 50 + 1).keys()].map(i => i * 50 + 800); // [800, 850, 900, ..., 2350]
      const timeblock = [
        <div key={day}>{ko}</div>,
        ...numArray.map((i) => {
          if (i === 1200) {
            return (
            // eslint-disable-next-line react/jsx-indent
            <div
              className={classNames('cell-top', 'cell-bold')}
              key={`${day}:1200`}
              data-day={day}
              data-time="1200"
              onMouseDown={e => this.dragStart(e)}
              onMouseMove={e => this.dragMove(e)}
            />
            );
          }
          if (i === 1800) {
            return (
            // eslint-disable-next-line react/jsx-indent
            <div
              className={classNames('cell-top', 'cell-bold')}
              key={`${day}:1800`}
              data-day={day}
              data-time="1800"
              onMouseDown={e => this.dragStart(e)}
              onMouseMove={e => this.dragMove(e)}
            />
            );
          }
          if (i === 2350) {
            return (
            // eslint-disable-next-line react/jsx-indent
            <div
              className={classNames('cell-bottom', (mobileShowLectureList ? 'cell-bottom--mobile-noline' : ''), 'cell-last')}
              key={`${day}:2330`}
              data-day={day}
              data-time="2330"
              onMouseDown={e => this.dragStart(e)}
              onMouseMove={e => this.dragMove(e)}
            />
            );
          }
          if (i % 100 === 0) {
            return (
            // eslint-disable-next-line react/jsx-indent
            <div
              className={classNames('cell-top')}
              key={`${day}:${i.toString()}`}
              data-day={day}
              data-time={i.toString()}
              onMouseDown={e => this.dragStart(e)}
              onMouseMove={e => this.dragMove(e)}
            />
            );
          }
          return (
            <div
              className={classNames('cell-bottom', (mobileShowLectureList ? 'cell-bottom--mobile-noline' : ''))}
              key={`${day}:${(i - 20).toString()}`}
              data-day={day}
              data-time={(i - 20).toString()}
              onMouseDown={e => this.dragStart(e)}
              onMouseMove={e => this.dragMove(e)}
            />
          );
        }),
      ];
      return timeblock;
    };

    return (
      <div className={classNames('section-content', 'section-content--timetable')} onMouseUp={e => this.dragEnd(e)}>
        <div className={classNames('section-content--timetable__table')}>
          <div>
            <div><strong>8</strong></div>
            <div />
            <div><span>9</span></div>
            <div />
            <div><span>10</span></div>
            <div />
            <div><span>11</span></div>
            <div />
            <div><strong>12</strong></div>
            <div />
            <div><span>1</span></div>
            <div />
            <div><span>2</span></div>
            <div />
            <div><span>3</span></div>
            <div />
            <div><span>4</span></div>
            <div />
            <div><span>5</span></div>
            <div />
            <div><strong>6</strong></div>
            <div />
            <div><span>7</span></div>
            <div />
            <div><span>8</span></div>
            <div />
            <div><span>9</span></div>
            <div />
            <div><span>10</span></div>
            <div />
            <div><span>11</span></div>
            <div />
            <div><strong>12</strong></div>
          </div>
          <div>
            {dragDiv('mon', '월요일')}
          </div>
          <div>
            {dragDiv('tue', '화요일')}
          </div>
          <div>
            {dragDiv('wed', '수요일')}
          </div>
          <div>
            {dragDiv('thu', '목요일')}
          </div>
          <div>
            {dragDiv('fri', '금요일')}
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
        {
          (
            lectureActiveFrom === LIST
            && !inTimetable(lectureActiveLecture, currentTimetable)
          )
            ? (
              lectureActiveLecture.classtimes.map(classtime => (
                <TimetableBlock
                  key={`${lectureActiveLecture.id}:${classtime.day}:${classtime.begin}`}
                  lecture={lectureActiveLecture}
                  classtime={classtime}
                  cellWidth={cellWidth}
                  cellHeight={cellHeight}
                  isClicked={false}
                  isHover={false}
                  isInactive={false}
                  isTemp={true}
                  isSimple={mobileShowLectureList}
                  blockHover={this.blockHover}
                  blockOut={this.blockOut}
                  blockClick={this.blockClick}
                  deleteLecture={this.deleteLecture}
                  occupiedTime={this._getOccupiedTime(classtime.day, this.indexOfMinute(classtime.begin), this.indexOfMinute(classtime.end))}
                />
              ))
            )
            : (
              null
            )
        }
      </div>
    );
  }
}

const mapStateToProps = state => ({
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
});

TimetableSubSection.propTypes = {
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
  setIsDraggingDispatch: PropTypes.func.isRequired,
  setLectureActiveDispatch: PropTypes.func.isRequired,
  clearLectureActiveDispatch: PropTypes.func.isRequired,
  removeLectureFromTimetableDispatch: PropTypes.func.isRequired,
  setCurrentListDispatch: PropTypes.func.isRequired,
};


export default connect(mapStateToProps, mapDispatchToProps)(TimetableSubSection);