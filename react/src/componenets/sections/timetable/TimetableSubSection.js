import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import axios from '../../../common/presetAxios';
import { inTimetable, isListHover, isTableClicked, isTableHover } from '../../../common/lectureFunctions';
import { BASE_URL } from '../../../common/constants';
import TimetableBlock from '../../blocks/TimetableBlock';
import { dragSearch, setIsDragging, updateCellSize, setLectureActive, clearLectureActive, removeLectureFromTimetable, lectureinfo, setCurrentList } from '../../../actions/timetable/index';
import { NONE, LIST, TABLE, MULTIPLE } from '../../../reducers/timetable/lectureActive';
import lectureShape from '../../../shapes/lectureShape';
import timetableShape from '../../../shapes/timetableShape';
import lectureActiveShape from '../../../shapes/lectureActiveShape';


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
    this.boundResize = this.resize.bind(this);
    window.addEventListener('resize', this.boundResize);
  }

  componentDidUpdate() {
    this.resize();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.boundResize);
  }

  resize = () => {
    const cell = document.getElementsByClassName('cell1')[0].getBoundingClientRect();
    this.props.updateCellSizeDispatch(cell.width, cell.height);
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

  dragStart = (e) => {
    e.stopPropagation();
    e.preventDefault();
    this.setState({ firstBlock: e.target, secondBlock: e.target });
    this.props.setIsDraggingDispatch(true);
  }

  // check is drag contain class time
  _isOccupied = (dragStart, dragEnd) => {
    const dragDay = this.indexOfDay(this.state.firstBlock.getAttribute('data-day'));

    return this.props.currentTimetable.lectures.some(lecture => (
      lecture.classtimes.some(classtime => (
        (classtime.day === dragDay) && (dragStart < (classtime.end / 30 - 2 * 8)) && (dragEnd > (classtime.begin / 30 - 2 * 8))
      ))
    ));
  }

  dragMove = (e) => {
    if (!this.props.isDragging) return;
    const startIndex = this.indexOfTime(this.state.firstBlock.getAttribute('data-time'));
    const endIndex = this.indexOfTime(e.target.getAttribute('data-time'));
    const incr = startIndex < endIndex ? 1 : -1;
    // eslint-disable-next-line no-loops/no-loops
    for (let i = startIndex + incr; i !== endIndex + incr; i += incr) {
      if ((incr > 0) ? this._isOccupied(startIndex, i + 1) : this._isOccupied(i, startIndex + 1)) {
        return;
      }
    }
    this.setState({ secondBlock: e.target });
  }

  dragEnd = (e) => {
    if (!this.props.isDragging) return;
    this.props.setIsDraggingDispatch(false);

    const startDay = this.indexOfDay(this.state.firstBlock.getAttribute('data-day'));
    const startIndex = this.indexOfTime(this.state.firstBlock.getAttribute('data-time'));
    const endIndex = this.indexOfTime(this.state.secondBlock.getAttribute('data-time'));
    if (startIndex === endIndex) return;
    this.props.dragSearchDispatch(startDay, Math.min(startIndex, endIndex), Math.max(startIndex, endIndex) + 1);
    this.props.setCurrentListDispatch('SEARCH');
    this.setState({ firstBlock: null, secondBlock: null });
  }

  blockHover = lecture => () => {
    if (!this.props.lectureActiveClicked && !this.props.isDragging) {
      this.props.setLectureActiveDispatch(lecture, 'TABLE', false);
    }
  }

  blockOut = () => {
    if (!this.props.lectureActiveClicked) {
      this.props.clearLectureActiveDispatch();
    }
  }

  blockClick = lecture => () => {
    if (isTableClicked(lecture, this.props.lectureActive)) {
      this.props.setLectureActiveDispatch(lecture, 'TABLE', false);
      this.props.lectureinfoDispatch();
    }
    else {
      this.props.setLectureActiveDispatch(lecture, 'TABLE', true);
      this.props.lectureinfoDispatch();
    }
  }

  deleteLecture = lecture => (event) => {
    event.stopPropagation();

    axios.post(`${BASE_URL}/api/timetable/table_update`, {
      table_id: this.props.currentTimetable.id,
      lecture_id: lecture.id,
      delete: true,
    })
      .then((response) => {
        this.props.removeLectureFromTimetableDispatch(lecture);
      })
      .catch((response) => {
      });
  }

  render() {
    const lectureBlocks = this.props.currentTimetable.lectures.map(lecture => (
      lecture.classtimes.map(classtime => (
          // eslint-disable-next-line react/jsx-indent
          <TimetableBlock
            key={`${lecture.id}:${classtime.day}:${classtime.begin}`}
            lecture={lecture}
            classtime={classtime}
            cellWidth={this.props.cellWidth}
            cellHeight={this.props.cellHeight}
            isClicked={isTableClicked(lecture, this.props.lectureActive)}
            isHover={isTableHover(lecture, this.props.lectureActive)}
            isListHover={isListHover(lecture, this.props.lectureActive)}
            isTemp={false}
            blockHover={this.blockHover}
            blockOut={this.blockOut}
            blockClick={this.blockClick}
            deleteLecture={this.deleteLecture}
          />
      ))
    ));

    const dragDiv = (day, ko) => {
      const timeblock = [];
      timeblock.push(<div className="chead" key={day}>{ko}</div>);
      // eslint-disable-next-line no-loops/no-loops
      for (let i = 800; i <= 2350; i += 50) {
        if (i === 1200) {
          timeblock.push(
            <div
              className="cell-bold cell1 half table-drag"
              key={`${day}:1200`}
              data-day={day}
              data-time="1200"
              onMouseDown={e => this.dragStart(e)}
              onMouseMove={e => this.dragMove(e)}
            />,
          );
        }
        else if (i === 1800) {
          timeblock.push(
            <div
              className="cell-bold cell1 half table-drag"
              key={`${day}:1800`}
              data-day={day}
              data-time="1800"
              onMouseDown={e => this.dragStart(e)}
              onMouseMove={e => this.dragMove(e)}
            />,
          );
        }
        else if (i === 2350) {
          timeblock.push(
            <div
              className="cell2 half cell-last table-drag"
              key={`${day}:2330`}
              data-day={day}
              data-time="2330"
              onMouseDown={e => this.dragStart(e)}
              onMouseMove={e => this.dragMove(e)}
            />,
          );
        }
        else if (i % 100 === 0) {
          timeblock.push(
            <div
              className="cell1 half table-drag"
              key={`${day}:${i.toString()}`}
              data-day={day}
              data-time={i.toString()}
              onMouseDown={e => this.dragStart(e)}
              onMouseMove={e => this.dragMove(e)}
            />,
          );
        }
        else {
          timeblock.push(
            <div
              className="cell2 half table-drag"
              key={`${day}:${(i - 20).toString()}`}
              data-day={day}
              data-time={(i - 20).toString()}
              onMouseDown={e => this.dragStart(e)}
              onMouseMove={e => this.dragMove(e)}
            />,
          );
        }
      }
      return timeblock;
    };

    return (
      <div id="timetable-wrap" onMouseUp={e => this.dragEnd(e)}>
        <div id="timetable-contents">
          <div id="rowheaders">
            <div className="rhead rhead-chead"><span className="rheadtext">8</span></div>
            <div className="rhead" />
            <div className="rhead"><span className="rheadtext">9</span></div>
            <div className="rhead" />
            <div className="rhead"><span className="rheadtext">10</span></div>
            <div className="rhead" />
            <div className="rhead"><span className="rheadtext">11</span></div>
            <div className="rhead" />
            <div className="rhead rhead-bold"><span className="rheadtext">12</span></div>
            <div className="rhead" />
            <div className="rhead"><span className="rheadtext">1</span></div>
            <div className="rhead" />
            <div className="rhead"><span className="rheadtext">2</span></div>
            <div className="rhead" />
            <div className="rhead"><span className="rheadtext">3</span></div>
            <div className="rhead" />
            <div className="rhead"><span className="rheadtext">4</span></div>
            <div className="rhead" />
            <div className="rhead"><span className="rheadtext">5</span></div>
            <div className="rhead" />
            <div className="rhead rhead-bold"><span className="rheadtext">6</span></div>
            <div className="rhead" />
            <div className="rhead"><span className="rheadtext">7</span></div>
            <div className="rhead" />
            <div className="rhead"><span className="rheadtext">8</span></div>
            <div className="rhead" />
            <div className="rhead"><span className="rheadtext">9</span></div>
            <div className="rhead" />
            <div className="rhead"><span className="rheadtext">10</span></div>
            <div className="rhead" />
            <div className="rhead"><span className="rheadtext">11</span></div>
            <div className="rhead" />
            <div className="rhead rhead-bold rhead-last"><span className="rheadtext">12</span></div>
          </div>
          <div className="day">
            {dragDiv('mon', '월요일')}
          </div>
          <div className="day">
            {dragDiv('tue', '화요일')}
          </div>
          <div className="day">
            {dragDiv('wed', '수요일')}
          </div>
          <div className="day">
            {dragDiv('thu', '목요일')}
          </div>
          <div className="day">
            {dragDiv('fri', '금요일')}
          </div>
        </div>
        {
          this.state.firstBlock && this.state.secondBlock
            ? (
              <div
                id="drag-cell"
                style={{
                  left: (this.props.cellWidth + 5) * this.indexOfDay(this.state.firstBlock.getAttribute('data-day')) + 28,
                  width: this.props.cellWidth + 2,
                  top: this.props.cellHeight * Math.min(this.indexOfTime(this.state.firstBlock.getAttribute('data-time')), this.indexOfTime(this.state.secondBlock.getAttribute('data-time'))) + 28,
                  height: this.props.cellHeight * (Math.abs(this.indexOfTime(this.state.firstBlock.getAttribute('data-time')) - this.indexOfTime(this.state.secondBlock.getAttribute('data-time'))) + 1) - 3,
                }}
              />
            )
            : null
        }
        {lectureBlocks}
        {
          (
            this.props.lectureActiveFrom === LIST
            && this.props.lectureActiveClicked === false
            && !inTimetable(this.props.lectureActiveLecture, this.props.currentTimetable)
          )
            ? (
              this.props.lectureActiveLecture.classtimes.map(classtime => (
                <TimetableBlock
                  key={`${this.props.lectureActiveLecture.id}:${classtime.day}:${classtime.begin}`}
                  lecture={this.props.lectureActiveLecture}
                  classtime={classtime}
                  cellWidth={this.props.cellWidth}
                  cellHeight={this.props.cellHeight}
                  isClicked={isTableClicked(this.props.lectureActiveLecture, this.props.lectureActive)}
                  isHover={isTableHover(this.props.lectureActiveLecture, this.props.lectureActive)}
                  isListHover={isListHover(this.props.lectureActiveLecture, this.props.lectureActive)}
                  isTemp={true}
                  blockHover={this.blockHover}
                  blockOut={this.blockOut}
                  blockClick={this.blockClick}
                  deleteLecture={this.deleteLecture}
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
  lectureinfoDispatch: () => {
    dispatch(lectureinfo());
  },
  setCurrentListDispatch: (list) => {
    dispatch(setCurrentList(list));
  },
});

TimetableSubSection.propTypes = {
  currentTimetable: timetableShape.isRequired,
  lectureActive: lectureActiveShape.isRequired,
  lectureActiveFrom: PropTypes.oneOf([NONE, LIST, TABLE, MULTIPLE]).isRequired,
  lectureActiveClicked: PropTypes.bool.isRequired,
  lectureActiveLecture: lectureShape,
  cellWidth: PropTypes.number.isRequired,
  cellHeight: PropTypes.number.isRequired,
  isDragging: PropTypes.bool.isRequired,
  updateCellSizeDispatch: PropTypes.func.isRequired,
  dragSearchDispatch: PropTypes.func.isRequired,
  setIsDraggingDispatch: PropTypes.func.isRequired,
  setLectureActiveDispatch: PropTypes.func.isRequired,
  clearLectureActiveDispatch: PropTypes.func.isRequired,
  removeLectureFromTimetableDispatch: PropTypes.func.isRequired,
  lectureinfoDispatch: PropTypes.func.isRequired,
  setCurrentListDispatch: PropTypes.func.isRequired,
};

TimetableSubSection = connect(mapStateToProps, mapDispatchToProps)(TimetableSubSection);

export default TimetableSubSection;
