import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';

import Scroller from '../../Scroller';

import { clearMultipleDetail, setMultipleDetail } from '../../../actions/timetable/lectureFocus';

import lectureFocusShape from '../../../shapes/LectureFocusShape';
import timetableShape from '../../../shapes/TimetableShape';
import { inTimetable, isFocused, getRoomStr, getExamStr } from '../../../common/lectureFunctions';


class ExamSubSection extends Component {
  constructor(props) {
    super(props);

    this.state = {
      multiFocusedLectures: [],
    };
  }

  _getLecturesWithExam = () => {
    const { lectureFocus, selectedTimetable } = this.props;

    const timetableLectures = selectedTimetable
      ? selectedTimetable.lectures
      : [];
    const lecturesWithExam = timetableLectures
      .concat((lectureFocus.lecture && !inTimetable(lectureFocus.lecture, selectedTimetable))
        ? [lectureFocus.lecture]
        : [])
      .filter(l => (l.examtimes.length > 0));

    return lecturesWithExam;
  }

  examFocus(dayIndex) {
    const { t } = this.props;
    const { lectureFocus, selectedTimetable, setMultipleDetailDispatch } = this.props;
    if (lectureFocus.from !== 'NONE' || !selectedTimetable) {
      return;
    }

    const dayNames = [t('ui.day.monday'), t('ui.day.tuesday'), t('ui.day.wednesday'), t('ui.day.thursday'), t('ui.day.friday')];

    const multiFocusedLectures = this._getLecturesWithExam().filter(l => (
      l.examtimes[0].day === dayIndex
    ));
    const lectures = multiFocusedLectures.map(lecture => ({
      id: lecture.id,
      title: lecture[t('js.property.title')],
      info: getRoomStr(lecture),
    }));
    setMultipleDetailDispatch(t('ui.others.examOfDay', { day: dayNames[dayIndex] }), lectures);
    this.setState({ multiFocusedLectures: multiFocusedLectures });
  }

  clearFocus() {
    const { lectureFocus, clearMultipleDetailDispatch } = this.props;

    if (lectureFocus.from !== 'MULTIPLE') {
      return;
    }

    clearMultipleDetailDispatch();
    this.setState({ multiFocusedLectures: [] });
  }

  render() {
    const { t } = this.props;
    const { multiFocusedLectures } = this.state;
    const { lectureFocus } = this.props;

    const renderLectureExam = (lec) => {
      const act = (
        isFocused(lec, lectureFocus.lecture, multiFocusedLectures)
          ? 'focused'
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
        .map(l => ({
          title: l[t('js.property.title')],
          time: getExamStr(l).slice(getExamStr(l).indexOf(' ')),
          id: l.id,
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
  selectedTimetable: state.timetable.timetable.selectedTimetable,
  lectureFocus: state.timetable.lectureFocus,
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
  selectedTimetable: timetableShape,
  lectureFocus: lectureFocusShape.isRequired,

  setMultipleDetailDispatch: PropTypes.func.isRequired,
  clearMultipleDetailDispatch: PropTypes.func.isRequired,
};


export default withTranslation()(connect(mapStateToProps, mapDispatchToProps)(ExamSubSection));
