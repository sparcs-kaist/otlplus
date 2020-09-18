import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';

import Scroller from '../../Scroller';

import { clearMultipleFocus, setMultipleFocus } from '../../../actions/timetable/lectureFocus';

import lectureFocusShape from '../../../shapes/LectureFocusShape';
import timetableShape from '../../../shapes/TimetableShape';
import { inTimetable, isFocused, getRoomStr, getExamStr, getOverallLectures } from '../../../common/lectureFunctions';


class ExamSubSection extends Component {
  constructor(props) {
    super(props);

    this.state = {
      multiFocusedLectures: [],
    };
  }

  _getLecturesWithExamOnDay = (dayIndex) => {
    const { lectureFocus, selectedTimetable } = this.props;

    return getOverallLectures(selectedTimetable, lectureFocus).filter(l => (
      l.examtimes.length && (l.examtimes[0].day === dayIndex)
    ));
  }

  examFocus(dayIndex) {
    const { t } = this.props;
    const { lectureFocus, selectedTimetable, setMultipleFocusDispatch } = this.props;

    if (lectureFocus.from !== 'NONE' || !selectedTimetable) {
      return;
    }

    const dayNames = [t('ui.day.monday'), t('ui.day.tuesday'), t('ui.day.wednesday'), t('ui.day.thursday'), t('ui.day.friday')];
    const lecturesWithExamOnDay = this._getLecturesWithExamOnDay(dayIndex);
    const details = lecturesWithExamOnDay.map(lecture => ({
      id: lecture.id,
      title: lecture[t('js.property.title')],
      info: getRoomStr(lecture),
    }));
    setMultipleFocusDispatch(t('ui.others.examOfDay', { day: dayNames[dayIndex] }), details);
    this.setState({ multiFocusedLectures: lecturesWithExamOnDay });
  }

  clearFocus() {
    const { lectureFocus, clearMultipleFocusDispatch } = this.props;

    if (lectureFocus.from !== 'MULTIPLE') {
      return;
    }

    clearMultipleFocusDispatch();
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

    const examTable = [0, 1, 2, 3, 4].map(di => (
      this._getLecturesWithExamOnDay(di)
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
  setMultipleFocusDispatch: (multipleTitle, multipleDetails) => {
    dispatch(setMultipleFocus(multipleTitle, multipleDetails));
  },
  clearMultipleFocusDispatch: () => {
    dispatch(clearMultipleFocus());
  },
});

ExamSubSection.propTypes = {
  selectedTimetable: timetableShape,
  lectureFocus: lectureFocusShape.isRequired,

  setMultipleFocusDispatch: PropTypes.func.isRequired,
  clearMultipleFocusDispatch: PropTypes.func.isRequired,
};


export default withTranslation()(connect(mapStateToProps, mapDispatchToProps)(ExamSubSection));
