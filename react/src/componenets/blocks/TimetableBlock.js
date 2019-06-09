import React, { Component } from 'react';
import { connect } from 'react-redux';
import axios from '../presetAxios';
import { setLectureActive, clearLectureActive, removeLectureFromTimetable, lectureinfo } from '../../actions/timetable/index';

class TimetableBlock extends Component {
  blockHover() {
    if (!this.props.lectureActiveClicked && !this.props.isDragging) {
      this.props.setLectureActiveDispatch(this.props.lecture, 'TABLE', false);
    }
  }

  blockOut() {
    if (!this.props.lectureActiveClicked) {
      this.props.clearLectureActiveDispatch();
    }
  }

  blockClick() {
    if (this.props.lectureActiveClicked
      && this.props.lectureActiveFrom === 'TABLE'
      && this.props.lectureActiveLecture.id === this.props.lecture.id) {
      this.props.setLectureActiveDispatch(this.props.lecture, 'TABLE', false);
      this.props.lectureinfoDispatch();
    }
    else {
      this.props.setLectureActiveDispatch(this.props.lecture, 'TABLE', true);
      this.props.lectureinfoDispatch();
    }
  }

  deleteLecture(event) {
    event.stopPropagation();

    axios.post('/api/timetable/table_update', {
      table_id: this.props.currentTimetable.id,
      lecture_id: this.props.lecture.id,
      delete: true,
    })
      .then((response) => {
        this.props.removeLectureFromTimetableDispatch(this.props.lecture);
      })
      .catch((response) => {
        console.log(response);
      });
  }

  render() {
    const indexOfTime = time => (time / 30 - 16);

    let activeType = '';
    if (this.props.lectureActiveLecture && (this.props.lectureActiveLecture.id === this.props.lecture.id)) {
      if ((this.props.lectureActiveFrom === 'TABLE') && (this.props.lectureActiveClicked === true)) {
        activeType = ' click';
      }
      else if (((this.props.lectureActiveFrom === 'TABLE')) && (this.props.lectureActiveClicked === false)) {
        activeType = ' active';
      }
      else if (((this.props.lectureActiveFrom === 'LIST')) && (this.props.lectureActiveClicked === false)) {
        activeType = ' lecture-block-temp active';
      }
    }

    return (
      <div
        className={`lecture-block color${this.props.lecture.course % 16}${activeType}`}
        style={{
          left: (this.props.cellWidth + 6) * this.props.classtime.day + 28,
          top: this.props.cellHeight * indexOfTime(this.props.classtime.begin) + 28,
          width: this.props.cellWidth + 2,
          height: this.props.cellHeight * (indexOfTime(this.props.classtime.end) - indexOfTime(this.props.classtime.begin)) - 3,
        }}
        onMouseOver={() => this.blockHover()}
        onMouseOut={() => this.blockOut()}
        onClick={() => this.blockClick()}
      >
        <div className="lecture-delete" onClick={event => this.deleteLecture(event)}><i /></div>
        <div
          // onMouseDown={() => this.props.onMouseDown()}
          className="lecture-block-content"
        >
          <p className="timetable-lecture-name">
            {this.props.lecture.title}
          </p>
          <p className="timetable-lecture-info">
            {this.props.lecture.professor}
          </p>
          <p className="timetable-lecture-info">
            {this.props.classtime.classroom}
          </p>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  cellWidth: state.timetable.timetable.cellWidth,
  cellHeight: state.timetable.timetable.cellHeight,
  lectureActiveFrom: state.timetable.lectureActive.from,
  lectureActiveClicked: state.timetable.lectureActive.clicked,
  lectureActiveLecture: state.timetable.lectureActive.lecture,
  showLectureInfoFlag: state.timetable.mobile.showLectureInfoFlag,
  isDragging: state.timetable.timetable.isDragging,
  currentTimetable: state.timetable.timetable.currentTimetable,
});

const mapDispatchToProps = dispatch => ({
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
});

TimetableBlock = connect(mapStateToProps, mapDispatchToProps)(TimetableBlock);

export default TimetableBlock;
