import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { timetableBoundClassNames as classNames } from '../../../common/boundClassNames';

import { clearMultipleDetail, setMultipleDetail } from '../../../actions/timetable/index';
import { NONE, LIST, TABLE, MULTIPLE } from '../../../reducers/timetable/lectureActive';
import lectureShape from '../../../shapes/LectureShape';
import timetableShape from '../../../shapes/TimetableShape';
import { inTimetable } from '../../../common/lectureFunctions';


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
    const { lectureActiveFrom, currentTimetable, setMultipleDetailDispatch } = this.props;

    if (lectureActiveFrom !== 'NONE' || !currentTimetable) {
      return;
    }

    const lectures = currentTimetable.lectures
      .filter(lecture => (indexOfType(lecture.type_en) === indexOfType(type)))
      .map(lecture => ({
        id: lecture.id,
        title: lecture.title,
        info: (lecture.credit > 0) ? `${lecture.credit.toString()}학점` : `${lecture.credit_au.toString()}AU`,
      }));
    setMultipleDetailDispatch(type, lectures);
    this.setState({ active: type });
  }

  creditFocus(type) {
    const { lectureActiveFrom, currentTimetable, setMultipleDetailDispatch } = this.props;

    if (lectureActiveFrom !== 'NONE' || !currentTimetable) {
      return;
    }

    const lectures = (type === 'Credit')
      ? (
        currentTimetable.lectures
          .filter(lecture => (lecture.credit > 0))
          .map(lecture => ({
            id: lecture.id,
            title: lecture.title,
            info: `${lecture.credit.toString()}학점`,
          }))
      )
      : (
        (type === 'Credit AU')
          ? (
            currentTimetable.lectures
              .filter(lecture => (lecture.credit_au > 0))
              .map(lecture => ({
                id: lecture.id,
                title: lecture.title,
                info: `${lecture.credit.toString()}AU`,
              }))
          )
          : []
      );
    setMultipleDetailDispatch(type, lectures);
    this.setState({ active: type });
  }

  scoreFocus(type) {
    const { lectureActiveFrom, currentTimetable, setMultipleDetailDispatch } = this.props;

    if (lectureActiveFrom !== 'NONE' || !currentTimetable) {
      return;
    }

    const lectures = currentTimetable.lectures.map(lecture => ({
      id: lecture.id,
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
    setMultipleDetailDispatch(type, lectures);
    this.setState({ active: type });
  }


  clearFocus() {
    const { lectureActiveFrom, clearMultipleDetailDispatch } = this.props;

    if (lectureActiveFrom !== 'MULTIPLE') {
      return;
    }

    clearMultipleDetailDispatch();
    this.setState({ active: '' });
  }

  render() {
    const { active } = this.state;
    const { currentTimetable, lectureActiveLecture, lectureActiveFrom } = this.props;

    const timetableLectures = currentTimetable
      ? currentTimetable.lectures
      : [];
    const type_credit = [0, 1, 2, 3, 4, 5].map(index => (
      timetableLectures
        .filter(lecture => (indexOfType(lecture.type_en) === index))
        .reduce((acc, lecture) => (acc + (lecture.credit + lecture.credit_au)), 0)
    ));
    const alec = lectureActiveLecture;
    const sum_credit = timetableLectures.reduce((acc, lecture) => (acc + lecture.credit), 0)
      + (alec && inTimetable(alec, currentTimetable) ? alec.credit : 0);
    const sum_credit_au = timetableLectures.reduce((acc, lecture) => (acc + lecture.credit_au), 0)
      + (alec && inTimetable(alec, currentTimetable) ? alec.credit_au : 0);
    const targetNum = timetableLectures.reduce((acc, lecture) => (acc + (lecture.credit + lecture.credit_au)), 0);
    const grade = timetableLectures.reduce((acc, lecture) => (acc + (lecture.grade * (lecture.credit + lecture.credit_au))), 0);
    const load = timetableLectures.reduce((acc, lecture) => (acc + (lecture.load * (lecture.credit + lecture.credit_au))), 0);
    const speech = timetableLectures.reduce((acc, lecture) => (acc + (lecture.speech * (lecture.credit + lecture.credit_au))), 0);
    const letters = ['?', 'F', 'F', 'F', 'D-', 'D', 'D+', 'C-', 'C', 'C+', 'B-', 'B', 'B+', 'A-', 'A', 'A+'];

    const active_type_credit = [0, 1, 2, 3, 4, 5].map(i => (
      !(lectureActiveFrom === LIST || lectureActiveFrom === TABLE)
      || (indexOfType(lectureActiveLecture.type_en) !== i)
        ? ''
        : inTimetable(lectureActiveLecture, currentTimetable)
          ? `(${lectureActiveLecture.credit + lectureActiveLecture.credit_au})`
          : `+${lectureActiveLecture.credit + lectureActiveLecture.credit_au}`
    ));

    const creditAct = (lectureActiveLecture !== null) && (lectureActiveLecture.credit > 0);
    const creditAuAct = (lectureActiveLecture !== null) && (lectureActiveLecture.credit_au > 0);

    return (
      <div id={classNames('summary')}>
        <div id={classNames('summary-type')}>
          <div className={classNames('summary-type-elem')} onMouseOver={() => this.typeFocus('Basic Required')} onMouseOut={() => this.clearFocus()}>
            <span className={classNames('summary-type-elem-title', 'fixed-ko')}>기필</span>
            <span className={classNames('summary-type-elem-body', (active === 'Basic Required' ? 'active' : ''))}>{type_credit[0]}</span>
            <span className={classNames('summary-type-elem-additional')}>{active_type_credit[0]}</span>
          </div>
          <div className={classNames('summary-type-elem')} onMouseOver={() => this.typeFocus('Major Required')} onMouseOut={() => this.clearFocus()}>
            <span className={classNames('summary-type-elem-title', 'fixed-ko')}>전필</span>
            <span className={classNames('summary-type-elem-body', (active === 'Major Required' ? 'active' : ''))}>{type_credit[2]}</span>
            <span className={classNames('summary-type-elem-additional')}>{active_type_credit[2]}</span>
          </div>
          <div className={classNames('summary-type-elem')} onMouseOver={() => this.typeFocus('Humanities & Social Elective')} onMouseOut={() => this.clearFocus()}>
            <span className={classNames('summary-type-elem-title', 'fixed-ko')}>인문</span>
            <span className={classNames('summary-type-elem-body', (active === 'Humanities & Social Elective' ? 'active' : ''))}>{type_credit[4]}</span>
            <span className={classNames('summary-type-elem-additional')}>{active_type_credit[4]}</span>
          </div>
          <div className={classNames('summary-type-elem')} onMouseOver={() => this.typeFocus('Basic Elective')} onMouseOut={() => this.clearFocus()}>
            <span className={classNames('summary-type-elem-title', 'fixed-ko')}>기선</span>
            <span className={classNames('summary-type-elem-body', (active === 'Basic Elective' ? 'active' : ''))}>{type_credit[1]}</span>
            <span className={classNames('summary-type-elem-additional')}>{active_type_credit[1]}</span>
          </div>
          <div className={classNames('summary-type-elem')} onMouseOver={() => this.typeFocus('Major Elective')} onMouseOut={() => this.clearFocus()}>
            <span className={classNames('summary-type-elem-title', 'fixed-ko')}>전선</span>
            <span className={classNames('summary-type-elem-body', (active === 'Major Elective' ? 'active' : ''))}>{type_credit[3]}</span>
            <span className={classNames('summary-type-elem-additional')}>{active_type_credit[3]}</span>
          </div>
          <div className={classNames('summary-type-elem')} onMouseOver={() => this.typeFocus('Etc')} onMouseOut={() => this.clearFocus()}>
            <span className={classNames('summary-type-elem-title', 'fixed-ko')}>기타</span>
            <span className={classNames('summary-type-elem-body', (active === 'Etc' ? 'active' : ''))}>{type_credit[5]}</span>
            <span className={classNames('summary-type-elem-additional')}>{active_type_credit[5]}</span>
          </div>
        </div>
        <div id={classNames('summary-credit')}>
          <div className={classNames('summary-credit-elem')} onMouseOver={() => this.creditFocus('Credit')} onMouseOut={() => this.clearFocus()}>
            <div id={classNames('credits')} className={classNames('score-text')}>
              <span className={classNames('normal', (creditAct ? 'none' : active === 'Credit' ? 'none' : ''))}>{sum_credit}</span>
              <span className={classNames('active', (creditAct ? '' : active === 'Credit' ? '' : 'none'))}>{sum_credit}</span>
            </div>
            <div className={classNames('score-label')}>학점</div>
          </div>
          <div className={classNames('summary-credit-elem')} onMouseOver={() => this.creditFocus('Credit AU')} onMouseOut={() => this.clearFocus()}>
            <div id={classNames('au')} className={classNames('score-text')}>
              <span className={classNames('normal', (creditAuAct ? 'none' : active === 'Credit AU' ? 'none' : ''))}>{sum_credit_au}</span>
              <span className={classNames('active', (creditAuAct ? '' : active === 'Credit AU' ? '' : 'none'))}>{sum_credit_au}</span>
            </div>
            <div className={classNames('score-label')}>AU</div>
          </div>
        </div>
        <div id={classNames('summary-score')}>
          <div className={classNames('summary-score-elem')} onMouseOver={() => this.scoreFocus('Grade')} onMouseOut={() => this.clearFocus()}>
            <div id={classNames('grades')} className={classNames('score-text', (active === 'Grade' ? 'active' : ''))}>{letters[Math.round(grade / targetNum)]}</div>
            <div className={classNames('score-label')}>성적</div>
          </div>
          <div className={classNames('summary-score-elem')} onMouseOver={() => this.scoreFocus('Load')} onMouseOut={() => this.clearFocus()}>
            <div id={classNames('loads')} className={classNames('score-text', (active === 'Load' ? 'active' : ''))}>{letters[Math.round(load / targetNum)]}</div>
            <div className={classNames('score-label')}>널널</div>
          </div>
          <div className={classNames('summary-score-elem')} onMouseOver={() => this.scoreFocus('Speech')} onMouseOut={() => this.clearFocus()}>
            <div id={classNames('speeches')} className={classNames('score-text', (active === 'Speech' ? 'active' : ''))}>{letters[Math.round(speech / targetNum)]}</div>
            <div className={classNames('score-label')}>강의</div>
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
  currentTimetable: timetableShape,
  lectureActiveLecture: lectureShape,
  lectureActiveFrom: PropTypes.oneOf([NONE, LIST, TABLE, MULTIPLE]).isRequired,
  setMultipleDetailDispatch: PropTypes.func.isRequired,
  clearMultipleDetailDispatch: PropTypes.func.isRequired,
};


export default connect(mapStateToProps, mapDispatchToProps)(SummarySubSection);
