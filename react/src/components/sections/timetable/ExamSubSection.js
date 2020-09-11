import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';

import Scroller from '../../Scroller';

import { clearMultipleDetail, setMultipleDetail } from '../../../actions/timetable/lectureActive';

import { NONE, LIST, TABLE, MULTIPLE } from '../../../reducers/timetable/lectureActive';

import lectureShape from '../../../shapes/LectureShape';
import timetableShape from '../../../shapes/TimetableShape';
import { inTimetable, isActive, getRoomStr, getExamStr } from '../../../common/lectureFunctions';


class ExamSubSection extends Component {
  constructor(props) {
    super(props);

    this.state = {
      activeLectures: [],
    };
  }

  _getLecturesWithExam = () => {
    const { lectureActiveLecture, currentTimetable } = this.props;

    const timetableLectures = currentTimetable
      ? currentTimetable.lectures
      : [];
    const lecturesWithExam = timetableLectures
      .concat((lectureActiveLecture && !inTimetable(lectureActiveLecture, currentTimetable))
        ? [lectureActiveLecture]
        : [])
      .filter(lecture => (lecture.examtimes.length > 0));

    return lecturesWithExam;
  }

  examFocus(dayIndex) {
    const { t } = this.props;
    const { lectureActiveFrom, currentTimetable, setMultipleDetailDispatch } = this.props;
    if (lectureActiveFrom !== 'NONE' || !currentTimetable) {
      return;
    }

    const dayNames = [t('ui.day.monday'), t('ui.day.tuesday'), t('ui.day.wednesday'), t('ui.day.thursday'), t('ui.day.friday')];

    const activeLectures = this._getLecturesWithExam().filter(lecture => (
      lecture.examtimes[0].day === dayIndex
    ));
    const lectures = activeLectures.map(lecture => ({
      id: lecture.id,
      title: lecture[t('js.property.title')],
      info: getRoomStr(lecture),
    }));
    setMultipleDetailDispatch(t('ui.others.examOfDay', { day: dayNames[dayIndex] }), lectures);
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
    const { t } = this.props;
    const { activeLectures } = this.state;
    const { lectureActiveLecture } = this.props;

    const renderLectureExam = (lec) => {
      const act = (
        isActive(lec, lectureActiveLecture, activeLectures)
          ? 'active'
          : ''
      );
      const li = (
        <li className={classNames(act)} key={lec.id}>
          <div>
            {lec.title}
          </div>
          <div>
            {lec.time}
          </div>
        </li>
      );
      return li;
    };

    const lecturesWithExam = this._getLecturesWithExam();
    const examTable = [0, 1, 2, 3, 4].map(day => (
      lecturesWithExam
        .filter(lecture => lecture.examtimes[0].day === day)
        .map(lecture => ({
          title: lecture[t('js.property.title')],
          time: getExamStr(lecture).slice(getExamStr(lecture).indexOf(' ')),
          id: lecture.id,
        }))
    ));

    return (
      <div className={classNames('section-content--exam', 'mobile-hidden')}>
        <div className={classNames('section-content--exam__title')}><span>{t('ui.title.exams')}</span></div>
        <div className={classNames('section-content--exam__content')}>
          <Scroller>
            <div className={classNames('section-content--exam__content__day')} onMouseOver={() => this.examFocus(0)} onMouseOut={() => this.clearFocus()}>
              <div className={classNames(t('jsx.className.fixedByLang'))}>
                {t('ui.day.mondayShort')}
              </div>
              <ul>
                {examTable[0].map(renderLectureExam)}
              </ul>
            </div>
            <div className={classNames('section-content--exam__content__day')} onMouseOver={() => this.examFocus(1)} onMouseOut={() => this.clearFocus()}>
              <div className={classNames(t('jsx.className.fixedByLang'))}>
                {t('ui.day.tuesdayShort')}
              </div>
              <ul>
                {examTable[1].map(renderLectureExam)}
              </ul>
            </div>
            <div className={classNames('section-content--exam__content__day')} onMouseOver={() => this.examFocus(2)} onMouseOut={() => this.clearFocus()}>
              <div className={classNames(t('jsx.className.fixedByLang'))}>
                {t('ui.day.wednesdayShort')}
              </div>
              <ul>
                {examTable[2].map(renderLectureExam)}
              </ul>
            </div>
            <div className={classNames('section-content--exam__content__day')} onMouseOver={() => this.examFocus(3)} onMouseOut={() => this.clearFocus()}>
              <div className={classNames(t('jsx.className.fixedByLang'))}>
                {t('ui.day.thursdayShort')}
              </div>
              <ul>
                {examTable[3].map(renderLectureExam)}
              </ul>
            </div>
            <div className={classNames('section-content--exam__content__day')} onMouseOver={() => this.examFocus(4)} onMouseOut={() => this.clearFocus()}>
              <div className={classNames(t('jsx.className.fixedByLang'))}>
                {t('ui.day.fridayShort')}
              </div>
              <ul>
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


export default withTranslation()(connect(mapStateToProps, mapDispatchToProps)(ExamSubSection));
