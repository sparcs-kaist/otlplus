import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { appBoundClassNames as classNames } from '../../../../common/boundClassNames';

import Scroller from '../../../Scroller';

import { clearMultipleFocus, setMultipleFocus } from '../../../../actions/timetable/lectureFocus';

import lectureFocusShape from '../../../../shapes/state/timetable/LectureFocusShape';
import timetableShape, { myPseudoTimetableShape } from '../../../../shapes/model/timetable/TimetableShape';

import {
  getOverallLectures, isSingleFocused,
} from '../../../../utils/lectureUtils';
import { getTimeStr } from '../../../../utils/examtimeUtils';
import { getDayStr } from '../../../../utils/timeUtils';

import { LectureFocusFrom } from '../../../../reducers/timetable/lectureFocus';


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

    if (lectureFocus.from !== LectureFocusFrom.NONE || !selectedTimetable) {
      return;
    }

    const lecEtPairsOnDay = this._getLecEtPairsOnDay(dayIndex);
    const details = lecEtPairsOnDay.map((p) => ({
      lecture: p.lecture,
      name: p.lecture[t('js.property.title')],
      info: getTimeStr(p.examtime),
    }));
    setMultipleFocusDispatch(t('ui.others.examOfDay', { day: getDayStr(dayIndex) }), details);
    this.setState({
      multipleFocusDayIndex: dayIndex,
    });
  }

  clearFocus = () => {
    const { lectureFocus, clearMultipleFocusDispatch } = this.props;

    if (lectureFocus.from !== LectureFocusFrom.MULTIPLE) {
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
      const isFocused = (
        isSingleFocused(lecEtPair.lecture, lectureFocus)
        || (multipleFocusDayIndex === lecEtPair.examtime.day)
      );
      const li = (
        <li className={classNames(isFocused ? 'focused' : null)} key={lecEtPair.lecture.id}>
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
      <div className={classNames('subsection--exam', 'mobile-hidden')}>
        <div className={classNames('subsection--exam__title')}><span>{t('ui.title.exams')}</span></div>
        <div className={classNames('subsection--exam__content')}>
          <Scroller>
            <div className={classNames('subsection--exam__content__day')} onMouseOver={() => this.setFocusOnExam(0)} onMouseOut={() => this.clearFocus()}>
              <div className={classNames(t('jsx.className.fixedByLang'))}>
                {t('ui.day.mondayShort')}
              </div>
              <ul>
                {this._getLecEtPairsOnDay(0).map((p) => mapPairToElem(p))}
              </ul>
            </div>
            <div className={classNames('subsection--exam__content__day')} onMouseOver={() => this.setFocusOnExam(1)} onMouseOut={() => this.clearFocus()}>
              <div className={classNames(t('jsx.className.fixedByLang'))}>
                {t('ui.day.tuesdayShort')}
              </div>
              <ul>
                {this._getLecEtPairsOnDay(1).map((p) => mapPairToElem(p))}
              </ul>
            </div>
            <div className={classNames('subsection--exam__content__day')} onMouseOver={() => this.setFocusOnExam(2)} onMouseOut={() => this.clearFocus()}>
              <div className={classNames(t('jsx.className.fixedByLang'))}>
                {t('ui.day.wednesdayShort')}
              </div>
              <ul>
                {this._getLecEtPairsOnDay(2).map((p) => mapPairToElem(p))}
              </ul>
            </div>
            <div className={classNames('subsection--exam__content__day')} onMouseOver={() => this.setFocusOnExam(3)} onMouseOut={() => this.clearFocus()}>
              <div className={classNames(t('jsx.className.fixedByLang'))}>
                {t('ui.day.thursdayShort')}
              </div>
              <ul>
                {this._getLecEtPairsOnDay(3).map((p) => mapPairToElem(p))}
              </ul>
            </div>
            <div className={classNames('subsection--exam__content__day')} onMouseOver={() => this.setFocusOnExam(4)} onMouseOut={() => this.clearFocus()}>
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
  selectedTimetable: PropTypes.oneOfType([timetableShape, myPseudoTimetableShape]),
  lectureFocus: lectureFocusShape.isRequired,

  setMultipleFocusDispatch: PropTypes.func.isRequired,
  clearMultipleFocusDispatch: PropTypes.func.isRequired,
};


export default withTranslation()(
  connect(mapStateToProps, mapDispatchToProps)(
    ExamSubSection
  )
);
