import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import Scroller from '../../Scroller';
import { NONE, LIST, TABLE, MULTIPLE } from '../../../reducers/timetable/lectureActive';
import { clearMultipleDetail, setMultipleDetail } from '../../../actions/timetable/index';
import lectureShape from '../../../shapes/LectureShape';
import timetableShape from '../../../shapes/TimetableShape';
import { inTimetable } from '../../../common/lectureFunctions';


class ExamSubSection extends Component {
  constructor(props) {
    super(props);

    this.state = {
      activeLectures: [],
    };
  }

  examFocus(day) {
    if (this.props.lectureActiveFrom !== 'NONE') {
      return;
    }

    const activeLectures = this.props.currentTimetable.lectures.filter(lecture => (
      day === lecture.exam.slice(0, 3)
    ));
    const lectures = activeLectures.map(lecture => ({
      title: lecture.title,
      info: lecture.room,
    }));
    this.props.setMultipleDetailDispatch(`${day} 시험`, lectures);
    this.setState({ activeLectures: activeLectures });
  }

  clearFocus() {
    if (this.props.lectureActiveFrom !== 'MULTIPLE') {
      return;
    }

    this.props.clearMultipleDetailDispatch();
    this.setState({ activeLectures: [] });
  }

  render() {
    const renderLectureExam = (lec) => {
      const act = (
        this.state.activeLectures.some(lecture => (lecture.id === lec.id))
        || (this.props.lectureActiveLecture !== null && this.props.lectureActiveLecture.id === lec.id)
          ? 'active'
          : ''
      );
      const li = (
        <li className={`exam-elem ${act}`} key={lec.id} data-id={lec.id}>
          <div className="exam-elem-title">
            {lec.title}
          </div>
          <div className="exam-elem-body">
            {lec.time}
          </div>
        </li>
      );
      return li;
    };

    const examWithLectures = this.props.currentTimetable.lectures
      .concat((this.props.lectureActiveLecture && !inTimetable(this.props.lectureActiveLecture, this.props.currentTimetable)) ? [this.props.lectureActiveLecture] : [])
      .filter(lecture => (lecture.examtimes.length > 0));
    const examTable = [0, 1, 2, 3, 4].map(day => (
      examWithLectures
        .filter(lecture => lecture.examtimes[0].day === day)
        .map(lecture => ({
          title: lecture.title,
          time: lecture.exam.slice(4),
          id: lecture.id,
        }))
    ));

    return (
      <div id="exam-timetable">
        <div id="examtitle"><span>시험시간표</span></div>
        <div id="examtable">
          <Scroller>
            <div className="exam-day" data-date="mon" onMouseOver={() => this.examFocus('월요일')} onMouseOut={() => this.clearFocus()}>
              <div className="exam-day-title fixed-ko">
                <span>월</span>
              </div>
              <ul className="exam-day-body">
                {examTable[0].map(renderLectureExam)}
              </ul>
            </div>
            <div className="exam-day" data-date="tue" onMouseOver={() => this.examFocus('화요일')} onMouseOut={() => this.clearFocus()}>
              <div className="exam-day-title fixed-ko">
                <span>화</span>
              </div>
              <ul className="exam-day-body">
                {examTable[1].map(renderLectureExam)}
              </ul>
            </div>
            <div className="exam-day" data-date="wed" onMouseOver={() => this.examFocus('수요일')} onMouseOut={() => this.clearFocus()}>
              <div className="exam-day-title fixed-ko">
                <span>수</span>
              </div>
              <ul className="exam-day-body">
                {examTable[2].map(renderLectureExam)}
              </ul>
            </div>
            <div className="exam-day" data-date="thu" onMouseOver={() => this.examFocus('목요일')} onMouseOut={() => this.clearFocus()}>
              <div className="exam-day-title fixed-ko">
                <span>목</span>
              </div>
              <ul className="exam-day-body">
                {examTable[3].map(renderLectureExam)}
              </ul>
            </div>
            <div className="exam-day" data-date="fri" onMouseOver={() => this.examFocus('금요일')} onMouseOut={() => this.clearFocus()}>
              <div className="exam-day-title fixed-ko">
                <span>금</span>
              </div>
              <ul className="exam-day-body">
                {examTable[4].map(renderLectureExam)}
              </ul>
            </div>
          </Scroller>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  currentTimetable: state.timetable.timetable.currentTimetable,
  lectureActiveLecture: state.timetable.lectureActive.lecture,
  lectureActiveFrom: state.timetable.lectureActive.from,
});

const mapDispatchToProps = dispatch => ({
  setMultipleDetailDispatch: (title, lectures) => {
    dispatch(setMultipleDetail(title, lectures));
  },
  clearMultipleDetailDispatch: () => {
    dispatch(clearMultipleDetail());
  },
});

ExamSubSection.propTypes = {
  currentTimetable: timetableShape.isRequired,
  lectureActiveLecture: lectureShape,
  lectureActiveFrom: PropTypes.oneOf([NONE, LIST, TABLE, MULTIPLE]).isRequired,
  setMultipleDetailDispatch: PropTypes.func.isRequired,
  clearMultipleDetailDispatch: PropTypes.func.isRequired,
};


export default connect(mapStateToProps, mapDispatchToProps)(ExamSubSection);
