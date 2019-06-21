import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { timetableBoundClassNames as classNames } from '../../../common/boundClassNames';

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
    const { lectureActiveFrom, currentTimetable, setMultipleDetailDispatch } = this.props;
    if (lectureActiveFrom !== 'NONE' || !currentTimetable) {
      return;
    }

    const activeLectures = currentTimetable.lectures.filter(lecture => (
      day === lecture.exam.slice(0, 3)
    ));
    const lectures = activeLectures.map(lecture => ({
      id: lecture.id,
      title: lecture.title,
      info: lecture.room,
    }));
    setMultipleDetailDispatch(`${day} 시험`, lectures);
    this.setState({ activeLectures: activeLectures });
  }

  clearFocus() {
    const { lectureActiveFrom, clearMultipleDetailDispatch } = this.props;

    if (lectureActiveFrom !== 'MULTIPLE') {
      return;
    }

    clearMultipleDetailDispatch();
    this.setState({ activeLectures: [] });
  }

  render() {
    const { activeLectures } = this.state;
    const { lectureActiveLecture, currentTimetable } = this.props;

    const renderLectureExam = (lec) => {
      const act = (
        activeLectures.some(lecture => (lecture.id === lec.id))
        || (lectureActiveLecture !== null && lectureActiveLecture.id === lec.id)
          ? 'active'
          : ''
      );
      const li = (
        <li className={classNames('exam-elem', act)} key={lec.id} data-id={lec.id}>
          <div className={classNames('exam-elem-title')}>
            {lec.title}
          </div>
          <div className={classNames('exam-elem-body')}>
            {lec.time}
          </div>
        </li>
      );
      return li;
    };

    const timetableLectures = currentTimetable
      ? currentTimetable.lectures
      : [];
    const examWithLectures = timetableLectures
      .concat((lectureActiveLecture && !inTimetable(lectureActiveLecture, currentTimetable)) ? [lectureActiveLecture] : [])
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
      <div id={classNames('exam-timetable')}>
        <div id={classNames('examtitle')}><span>시험시간표</span></div>
        <div id={classNames('examtable')}>
          <Scroller>
            <div className={classNames('exam-day')} data-date="mon" onMouseOver={() => this.examFocus('월요일')} onMouseOut={() => this.clearFocus()}>
              <div className={classNames('exam-day-title', 'fixed-ko')}>
                <span>월</span>
              </div>
              <ul className={classNames('exam-day-body')}>
                {examTable[0].map(renderLectureExam)}
              </ul>
            </div>
            <div className={classNames('exam-day')} data-date="tue" onMouseOver={() => this.examFocus('화요일')} onMouseOut={() => this.clearFocus()}>
              <div className={classNames('exam-day-title', 'fixed-ko')}>
                <span>화</span>
              </div>
              <ul className={classNames('exam-day-body')}>
                {examTable[1].map(renderLectureExam)}
              </ul>
            </div>
            <div className={classNames('exam-day')} data-date="wed" onMouseOver={() => this.examFocus('수요일')} onMouseOut={() => this.clearFocus()}>
              <div className={classNames('exam-day-title', 'fixed-ko')}>
                <span>수</span>
              </div>
              <ul className={classNames('exam-day-body')}>
                {examTable[2].map(renderLectureExam)}
              </ul>
            </div>
            <div className={classNames('exam-day')} data-date="thu" onMouseOver={() => this.examFocus('목요일')} onMouseOut={() => this.clearFocus()}>
              <div className={classNames('exam-day-title', 'fixed-ko')}>
                <span>목</span>
              </div>
              <ul className={classNames('exam-day-body')}>
                {examTable[3].map(renderLectureExam)}
              </ul>
            </div>
            <div className={classNames('exam-day')} data-date="fri" onMouseOver={() => this.examFocus('금요일')} onMouseOut={() => this.clearFocus()}>
              <div className={classNames('exam-day-title', 'fixed-ko')}>
                <span>금</span>
              </div>
              <ul className={classNames('exam-day-body')}>
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
  currentTimetable: timetableShape,
  lectureActiveLecture: lectureShape,
  lectureActiveFrom: PropTypes.oneOf([NONE, LIST, TABLE, MULTIPLE]).isRequired,
  setMultipleDetailDispatch: PropTypes.func.isRequired,
  clearMultipleDetailDispatch: PropTypes.func.isRequired,
};


export default connect(mapStateToProps, mapDispatchToProps)(ExamSubSection);
