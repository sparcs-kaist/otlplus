import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';

import Scroller from '../../Scroller';

import { clearMultipleFocus, setMultipleFocus } from '../../../actions/timetable/lectureFocus';

import lectureFocusShape from '../../../shapes/LectureFocusShape';
import timetableShape from '../../../shapes/TimetableShape';
import {
  getOverallLectures, isSingleFocused,
} from '../../../common/lectureFunctions';
import { getTimeStr } from '../../../common/examtimeFunctions';


class ExamSubSection extends Component {
  constructor(props) {
    super(props);

    this.state = {
      multipleFocusDayIndex: null,
    };
  }

  _getOverallLecEtPairs = () => {
    const { lectureFocus, selectedTimetable } = this.props;
    return getOverallLectures(selectedTimetable, lectureFocus)
      .map((l) => l.examtimes.map((et) => ({
        lecture: l,
        examtime: et,
      })))
      .flat(1);
  }

  _getLecEtPairsOnDay = (dayIndex) => (
    this._getOverallLecEtPairs().filter((p) => (p.examtime.day === dayIndex))
  )

  setFocusOnExam = (dayIndex) => {
    const { t } = this.props;
    const { lectureFocus, selectedTimetable, setMultipleFocusDispatch } = this.props;

    if (lectureFocus.from !== 'NONE' || !selectedTimetable) {
      return;
    }

    const dayNames = [t('ui.day.monday'), t('ui.day.tuesday'), t('ui.day.wednesday'), t('ui.day.thursday'), t('ui.day.friday')];
    const lecEtPairsOnDay = this._getLecEtPairsOnDay(dayIndex);
    const details = lecEtPairsOnDay.map((p) => ({
      lecture: p.lecture,
      name: p.lecture[t('js.property.title')],
      info: getTimeStr(p.examtime),
    }));
    setMultipleFocusDispatch(t('ui.others.examOfDay', { day: dayNames[dayIndex] }), details);
    this.setState({
      multipleFocusDayIndex: dayIndex,
    });
  }

  clearFocus = () => {
    const { lectureFocus, clearMultipleFocusDispatch } = this.props;

    if (lectureFocus.from !== 'MULTIPLE') {
      return;
    }

    clearMultipleFocusDispatch();
    this.setState({
      multipleFocusDayIndex: null,
    });
  }

  render() {
    const { t } = this.props;
    const { multipleFocusDayIndex } = this.state;
    const { lectureFocus } = this.props;

    const mapPairToElem = (lecEtPair) => {
      const act = (
        isSingleFocused(lecEtPair.lecture, lectureFocus) || (multipleFocusDayIndex === lecEtPair.examtime.day)
          ? 'focused'
          : ''
      );
      const li = (
        <li className={classNames(act)} key={lecEtPair.lecture.id}>
          <div>
            {lecEtPair.lecture[t('js.property.title')]}
          </div>
          <div>
            {getTimeStr(lecEtPair.examtime)}
          </div>
        </li>
      );
      return li;
    };

    return (
      <div className={classNames('section-content--exam', 'mobile-hidden')}>
        <div className={classNames('section-content--exam__title')}><span>{t('ui.title.exams')}</span></div>
        <div className={classNames('section-content--exam__content')}>
          <Scroller>
            <div className={classNames('section-content--exam__content__day')} onMouseOver={() => this.setFocusOnExam(0)} onMouseOut={() => this.clearFocus()}>
              <div className={classNames(t('jsx.className.fixedByLang'))}>
                {t('ui.day.mondayShort')}
              </div>
              <ul>
                {this._getLecEtPairsOnDay(0).map((p) => mapPairToElem(p))}
              </ul>
            </div>
            <div className={classNames('section-content--exam__content__day')} onMouseOver={() => this.setFocusOnExam(1)} onMouseOut={() => this.clearFocus()}>
              <div className={classNames(t('jsx.className.fixedByLang'))}>
                {t('ui.day.tuesdayShort')}
              </div>
              <ul>
                {this._getLecEtPairsOnDay(1).map((p) => mapPairToElem(p))}
              </ul>
            </div>
            <div className={classNames('section-content--exam__content__day')} onMouseOver={() => this.setFocusOnExam(2)} onMouseOut={() => this.clearFocus()}>
              <div className={classNames(t('jsx.className.fixedByLang'))}>
                {t('ui.day.wednesdayShort')}
              </div>
              <ul>
                {this._getLecEtPairsOnDay(2).map((p) => mapPairToElem(p))}
              </ul>
            </div>
            <div className={classNames('section-content--exam__content__day')} onMouseOver={() => this.setFocusOnExam(3)} onMouseOut={() => this.clearFocus()}>
              <div className={classNames(t('jsx.className.fixedByLang'))}>
                {t('ui.day.thursdayShort')}
              </div>
              <ul>
                {this._getLecEtPairsOnDay(3).map((p) => mapPairToElem(p))}
              </ul>
            </div>
            <div className={classNames('section-content--exam__content__day')} onMouseOver={() => this.setFocusOnExam(4)} onMouseOut={() => this.clearFocus()}>
              <div className={classNames(t('jsx.className.fixedByLang'))}>
                {t('ui.day.fridayShort')}
              </div>
              <ul>
                {this._getLecEtPairsOnDay(4).map((p) => mapPairToElem(p))}
              </ul>
            </div>
          </Scroller>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  selectedTimetable: state.timetable.timetable.selectedTimetable,
  lectureFocus: state.timetable.lectureFocus,
});

const mapDispatchToProps = (dispatch) => ({
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
