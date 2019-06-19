import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { clearMultipleDetail, setMultipleDetail } from '../../../actions/timetable/index';
import { NONE, LIST, TABLE, MULTIPLE } from '../../../reducers/timetable/lectureActive';
import lectureShape from '../../../shapes/LectureShape';
import timetableShape from '../../../shapes/TimetableShape';


const indexOfType = (type) => {
  const types = ['Basic Required', 'Basic Elective', 'Major Required', 'Major Elective', 'Humanities & Social Elective'];
  const index = types.indexOf(type);
  if (index === -1) {
    return 5;
  }
  return index;
};

class SummarySubSection extends Component {
  constructor(props) {
    super(props);

    this.state = {
      active: '',
    };
  }

  typeFocus(type) {
    if (this.props.lectureActiveFrom !== 'NONE') {
      return;
    }

    const lectures = this.props.currentTimetable.lectures
      .filter(lecture => (indexOfType(lecture.type_en) === indexOfType(type)))
      .map(lecture => ({
        title: lecture.title,
        info: (lecture.credit > 0) ? `${lecture.credit.toString()}학점` : `${lecture.credit_au.toString()}AU`,
      }));
    this.props.setMultipleDetailDispatch(type, lectures);
    this.setState({ active: type });
  }

  creditFocus(type) {
    if (this.props.lectureActiveFrom !== 'NONE') {
      return;
    }

    const lectures = (type === 'Credit')
      ? (
        this.props.currentTimetable.lectures
          .filter(lecture => (lecture.credit > 0))
          .map(lecture => ({
            title: lecture.title,
            info: `${lecture.credit.toString()}학점`,
          }))
      )
      : (
        (type === 'Credit AU')
          ? (
            this.props.currentTimetable.lectures
              .filter(lecture => (lecture.credit_au > 0))
              .map(lecture => ({
                title: lecture.title,
                info: `${lecture.credit.toString()}AU`,
              }))
          )
          : []
      );
    this.props.setMultipleDetailDispatch(type, lectures);
    this.setState({ active: type });
  }

  scoreFocus(type) {
    if (this.props.lectureActiveFrom !== 'NONE') {
      return;
    }

    const lectures = this.props.currentTimetable.lectures.map(lecture => ({
      title: lecture.title,
      info: (type === 'Grade')
        ? lecture.grade_letter
        : (
          (type === 'Load')
            ? lecture.load_letter
            : (
              (type === 'Speech')
                ? lecture.speech_letter
                : '?'
            )
        ),
    }));
    this.props.setMultipleDetailDispatch(type, lectures);
    this.setState({ active: type });
  }


  clearFocus() {
    if (this.props.lectureActiveFrom !== 'MULTIPLE') {
      return;
    }

    this.props.clearMultipleDetailDispatch();
    this.setState({ active: '' });
  }

  render() {
    const type_credit = [0, 1, 2, 3, 4, 5].map(index => (
      this.props.currentTimetable.lectures
        .filter(lecture => (indexOfType(lecture.type_en) === index))
        .reduce((acc, lecture) => (acc + (lecture.credit + lecture.credit_au)), 0)
    ));
    let sum_credit = this.props.currentTimetable.lectures.reduce((acc, lecture) => (acc + lecture.credit), 0);
    let sum_credit_au = this.props.currentTimetable.lectures.reduce((acc, lecture) => (acc + lecture.credit_au), 0);
    const targetNum = this.props.currentTimetable.lectures.reduce((acc, lecture) => (acc + (lecture.credit + lecture.credit_au)), 0);
    const grade = this.props.currentTimetable.lectures.reduce((acc, lecture) => (acc + (lecture.grade * (lecture.credit + lecture.credit_au))), 0);
    const load = this.props.currentTimetable.lectures.reduce((acc, lecture) => (acc + (lecture.load * (lecture.credit + lecture.credit_au))), 0);
    const speech = this.props.currentTimetable.lectures.reduce((acc, lecture) => (acc + (lecture.speech * (lecture.credit + lecture.credit_au))), 0);
    const letters = ['?', 'F', 'F', 'F', 'D-', 'D', 'D+', 'C-', 'C', 'C+', 'B-', 'B', 'B+', 'A-', 'A', 'A+'];

    const active_type_credit = ['', '', '', '', '', ''];
    if (this.props.lectureActiveFrom === LIST || this.props.lectureActiveFrom === TABLE) {
      const index = indexOfType(this.props.lectureActiveLecture.type_en);
      const amount = this.props.lectureActiveLecture.credit + this.props.lectureActiveLecture.credit_au;

      active_type_credit[index] = this.props.currentTimetable.lectures.some(lecture => (lecture.id === this.props.lectureActiveLecture.id))
        ? `(${amount})`
        : `+${amount}`;
    }

    const creditAct = (this.props.lectureActiveLecture !== null) && (this.props.lectureActiveLecture.credit > 0);
    const creditAuAct = (this.props.lectureActiveLecture !== null) && (this.props.lectureActiveLecture.credit_au > 0);

    const alec = this.props.lectureActiveLecture;
    if (alec !== null && !this.props.currentTimetable.lectures.includes(alec)) {
      sum_credit += alec.credit;
      sum_credit_au += alec.credit_au;
    }

    return (
      <div id="summary">
        <div id="summary-type">
          <div className="summary-type-elem" onMouseOver={() => this.typeFocus('Basic Required')} onMouseOut={() => this.clearFocus()}>
            <span className="summary-type-elem-title fixed-ko">기필</span>
            <span className={`summary-type-elem-body ${this.state.active === 'Basic Required' ? 'active' : ''}`}>{type_credit[0]}</span>
            <span className="summary-type-elem-additional">{active_type_credit[0]}</span>
          </div>
          <div className="summary-type-elem" onMouseOver={() => this.typeFocus('Major Required')} onMouseOut={() => this.clearFocus()}>
            <span className="summary-type-elem-title fixed-ko">전필</span>
            <span className={`summary-type-elem-body ${this.state.active === 'Major Required' ? 'active' : ''}`}>{type_credit[2]}</span>
            <span className="summary-type-elem-additional">{active_type_credit[2]}</span>
          </div>
          <div className="summary-type-elem" onMouseOver={() => this.typeFocus('Humanities & Social Elective')} onMouseOut={() => this.clearFocus()}>
            <span className="summary-type-elem-title fixed-ko">인문</span>
            <span className={`summary-type-elem-body ${this.state.active === 'Humanities & Social Elective' ? 'active' : ''}`}>{type_credit[4]}</span>
            <span className="summary-type-elem-additional">{active_type_credit[4]}</span>
          </div>
          <div className="summary-type-elem" onMouseOver={() => this.typeFocus('Basic Elective')} onMouseOut={() => this.clearFocus()}>
            <span className="summary-type-elem-title fixed-ko">기선</span>
            <span className={`summary-type-elem-body ${this.state.active === 'Basic Elective' ? 'active' : ''}`}>{type_credit[1]}</span>
            <span className="summary-type-elem-additional">{active_type_credit[1]}</span>
          </div>
          <div className="summary-type-elem" onMouseOver={() => this.typeFocus('Major Elective')} onMouseOut={() => this.clearFocus()}>
            <span className="summary-type-elem-title fixed-ko">전선</span>
            <span className={`summary-type-elem-body ${this.state.active === 'Major Elective' ? 'active' : ''}`}>{type_credit[3]}</span>
            <span className="summary-type-elem-additional">{active_type_credit[3]}</span>
          </div>
          <div className="summary-type-elem" onMouseOver={() => this.typeFocus('Etc')} onMouseOut={() => this.clearFocus()}>
            <span className="summary-type-elem-title fixed-ko">기타</span>
            <span className={`summary-type-elem-body ${this.state.active === 'Etc' ? 'active' : ''}`}>{type_credit[5]}</span>
            <span className="summary-type-elem-additional">{active_type_credit[5]}</span>
          </div>
        </div>
        <div id="summary-credit">
          <div className="summary-credit-elem" onMouseOver={() => this.creditFocus('Credit')} onMouseOut={() => this.clearFocus()}>
            <div id="credits" className="score-text">
              <span className={`normal ${creditAct ? 'none' : this.state.active === 'Credit' ? 'none' : ''}`}>{sum_credit}</span>
              <span className={`active ${creditAct ? '' : this.state.active === 'Credit' ? '' : 'none'}`}>{sum_credit}</span>
            </div>
            <div className="score-label">학점</div>
          </div>
          <div className="summary-credit-elem" onMouseOver={() => this.creditFocus('Credit AU')} onMouseOut={() => this.clearFocus()}>
            <div id="au" className="score-text">
              <span className={`normal ${creditAuAct ? 'none' : this.state.active === 'Credit AU' ? 'none' : ''}`}>{sum_credit_au}</span>
              <span className={`active ${creditAuAct ? '' : this.state.active === 'Credit AU' ? '' : 'none'}`}>{sum_credit_au}</span>
            </div>
            <div className="score-label">AU</div>
          </div>
        </div>
        <div id="summary-score">
          <div className="summary-score-elem" onMouseOver={() => this.scoreFocus('Grade')} onMouseOut={() => this.clearFocus()}>
            <div id="grades" className={`score-text ${this.state.active === 'Grade' ? 'active' : ''}`}>{letters[Math.round(grade / targetNum)]}</div>
            <div className="score-label">성적</div>
          </div>
          <div className="summary-score-elem" onMouseOver={() => this.scoreFocus('Load')} onMouseOut={() => this.clearFocus()}>
            <div id="loads" className={`score-text ${this.state.active === 'Load' ? 'active' : ''}`}>{letters[Math.round(load / targetNum)]}</div>
            <div className="score-label">널널</div>
          </div>
          <div className="summary-score-elem" onMouseOver={() => this.scoreFocus('Speech')} onMouseOut={() => this.clearFocus()}>
            <div id="speeches" className={`score-text ${this.state.active === 'Speech' ? 'active' : ''}`}>{letters[Math.round(speech / targetNum)]}</div>
            <div className="score-label">강의</div>
          </div>
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

SummarySubSection.propTypes = {
  currentTimetable: timetableShape.isRequired,
  lectureActiveLecture: lectureShape,
  lectureActiveFrom: PropTypes.oneOf([NONE, LIST, TABLE, MULTIPLE]).isRequired,
  setMultipleDetailDispatch: PropTypes.func.isRequired,
  clearMultipleDetailDispatch: PropTypes.func.isRequired,
};


export default connect(mapStateToProps, mapDispatchToProps)(SummarySubSection);
