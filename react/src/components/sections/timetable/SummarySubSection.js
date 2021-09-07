import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { sumBy } from 'lodash';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';
import { getAverageScoreLabel } from '../../../utils/scoreUtils';

import { clearMultipleFocus, setMultipleFocus } from '../../../actions/timetable/lectureFocus';

import { LIST, TABLE } from '../../../reducers/timetable/lectureFocus';

import lectureFocusShape from '../../../shapes/LectureFocusShape';
import timetableShape from '../../../shapes/TimetableShape';

import { inTimetable, getOverallLectures } from '../../../utils/lectureUtils';


const indexOfType = (type) => {
  const types = ['Basic Required', 'Basic Elective', 'Major Required', 'Major Elective', 'Humanities & Social Elective'];
  const index = types.indexOf(type);
  if (index === -1) {
    return 5;
  }
  return index;
};

const typeOfIndex = (index) => {
  if (index === 5) {
    return 'Etc';
  }
  const types = ['Basic Required', 'Basic Elective', 'Major Required', 'Major Elective', 'Humanities & Social Elective'];
  return types[index];
};

class SummarySubSection extends Component {
  constructor(props) {
    super(props);

    this.state = {
      multipleFocusCode: '',
    };
  }

  setFocusOnType = (type) => {
    const { t } = this.props;
    const { lectureFocus, selectedTimetable, setMultipleFocusDispatch } = this.props;

    if (lectureFocus.from !== 'NONE' || !selectedTimetable) {
      return;
    }

    const details = getOverallLectures(selectedTimetable, lectureFocus)
      .filter((l) => (indexOfType(l.type_en) === indexOfType(type)))
      .map((l) => ({
        lecture: l,
        name: l[t('js.property.title')],
        info: (l.credit > 0) ? t('ui.others.creditCount', { count: l.credit }) : t('ui.others.auCount', { count: l.credit_au }),
      }));
    setMultipleFocusDispatch(type, details);
    this.setState({ multipleFocusCode: type });
  }

  setFocusOnCredit = (type) => {
    const { t } = this.props;
    const { lectureFocus, selectedTimetable, setMultipleFocusDispatch } = this.props;

    if (lectureFocus.from !== 'NONE' || !selectedTimetable) {
      return;
    }

    const details = (type === 'Credit')
      ? (
        getOverallLectures(selectedTimetable, lectureFocus)
          .filter((l) => (l.credit > 0))
          .map((l) => ({
            lecture: l,
            name: l[t('js.property.title')],
            info: t('ui.others.creditCount', { count: l.credit }),
          }))
      )
      : (
        (type === 'Credit AU')
          ? (
            getOverallLectures(selectedTimetable, lectureFocus)
              .filter((l) => (l.credit_au > 0))
              .map((l) => ({
                lecture: l,
                name: l[t('js.property.title')],
                info: t('ui.others.auCount', { count: l.credit_au }),
              }))
          )
          : []
      );
    setMultipleFocusDispatch(type, details);
    this.setState({ multipleFocusCode: type });
  }

  setFocusOnScore = (type) => {
    const { t } = this.props;
    const { lectureFocus, selectedTimetable, setMultipleFocusDispatch } = this.props;

    if (lectureFocus.from !== 'NONE' || !selectedTimetable) {
      return;
    }

    const details = getOverallLectures(selectedTimetable, lectureFocus).map((l) => ({
      lecture: l,
      name: l[t('js.property.title')],
      info: (type === 'Grade')
        ? getAverageScoreLabel(l.grade)
        : (
          (type === 'Load')
            ? getAverageScoreLabel(l.load)
            : (
              (type === 'Speech')
                ? getAverageScoreLabel(l.speech)
                : '?'
            )
        ),
    }));
    setMultipleFocusDispatch(type, details);
    this.setState({ multipleFocusCode: type });
  }


  clearFocus = () => {
    const { lectureFocus, clearMultipleFocusDispatch } = this.props;

    if (lectureFocus.from !== 'MULTIPLE') {
      return;
    }

    clearMultipleFocusDispatch();
    this.setState({ multipleFocusCode: '' });
  }

  render() {
    const { t } = this.props;
    const { multipleFocusCode } = this.state;
    const { selectedTimetable, lectureFocus } = this.props;

    const timetableLectures = selectedTimetable
      ? selectedTimetable.lectures
      : [];
    const overallLectures = getOverallLectures(selectedTimetable, lectureFocus);

    const isTypeCreditSingleFocused = (typeIndex) => (
      (lectureFocus.from === LIST || lectureFocus.from === TABLE)
      && (indexOfType(lectureFocus.lecture.type_en) === typeIndex)
    );
    const isTypeCreditMultiFocused = (typeIndex) => (
      (multipleFocusCode === typeOfIndex(typeIndex))
    );

    const timetableTypeCredit = [0, 1, 2, 3, 4, 5].map((i) => {
      const lecturesWithType = timetableLectures.filter((l) => (indexOfType(l.type_en) === i));
      return sumBy(lecturesWithType, (l) => (l.credit + l.credit_au));
    });
    const singleFocusedTypeCreditStr = [0, 1, 2, 3, 4, 5].map((i) => (
      !isTypeCreditSingleFocused(i)
        ? ''
        : inTimetable(lectureFocus.lecture, selectedTimetable)
          ? `(${lectureFocus.lecture.credit + lectureFocus.lecture.credit_au})`
          : `+${lectureFocus.lecture.credit + lectureFocus.lecture.credit_au}`
    ));
    const overallTypeCredit = [0, 1, 2, 3, 4, 5].map((i) => {
      const lecturesWithType = overallLectures.filter((l) => (indexOfType(l.type_en) === i));
      return sumBy(lecturesWithType, (l) => (l.credit + l.credit_au));
    });

    const overallCredit = sumBy(overallLectures, (l) => l.credit);
    const overallAu = sumBy(overallLectures, (l) => l.credit_au);
    const isCreditSingleFocused = (lectureFocus.lecture !== null) && (lectureFocus.lecture.credit > 0);
    const isAuSingleFocused = (lectureFocus.lecture !== null) && (lectureFocus.lecture.credit_au > 0);
    const isCreditMultiFocused = (multipleFocusCode === 'Credit');
    const isAuMultiFocused = (multipleFocusCode === 'Credit Au');

    const timetableLecturesWithReview = timetableLectures.filter((l) => (l.review_total_weight > 0));
    const targetNum = sumBy(timetableLecturesWithReview, (l) => (l.credit + l.credit_au));
    const timetableGrade = sumBy(timetableLecturesWithReview, (l) => (l.grade * (l.credit + l.credit_au)));
    const timetableLoad = sumBy(timetableLecturesWithReview, (l) => (l.load * (l.credit + l.credit_au)));
    const timetableSpeech = sumBy(timetableLecturesWithReview, (l) => (l.speech * (l.credit + l.credit_au)));
    const isGradeMultiFocused = (multipleFocusCode === 'Grade');
    const isLoadMultiFocused = (multipleFocusCode === 'Load');
    const isSpeechMultiFocused = (multipleFocusCode === 'Speech');

    return (
      <div className={classNames('section-content--summary')}>
        <div className={classNames('section-content--summary__type')}>
          <div>
            <div className={classNames('attribute')} onMouseOver={() => this.setFocusOnType('Basic Required')} onMouseOut={() => this.clearFocus()}>
              <span className={classNames(t('jsx.className.fixedByLang'))}>{t('ui.type.basicRequiredShort')}</span>
              <div>
                <span className={classNames('mobile-hidden', (isTypeCreditMultiFocused(0) ? 'focused' : ''))}>{timetableTypeCredit[0]}</span>
                <span className={classNames('mobile-hidden', 'focused')}>{singleFocusedTypeCreditStr[0]}</span>
                <span className={classNames('mobile-unhidden', ((isTypeCreditMultiFocused(0) || isTypeCreditSingleFocused(0)) ? 'focused' : ''))}>{overallTypeCredit[0]}</span>
              </div>
            </div>
            <div className={classNames('attribute')} onMouseOver={() => this.setFocusOnType('Major Required')} onMouseOut={() => this.clearFocus()}>
              <span className={classNames(t('jsx.className.fixedByLang'))}>{t('ui.type.majorRequiredShort')}</span>
              <div>
                <span className={classNames('mobile-hidden', (isTypeCreditMultiFocused(2) ? 'focused' : ''))}>{timetableTypeCredit[2]}</span>
                <span className={classNames('mobile-hidden', 'focused')}>{singleFocusedTypeCreditStr[2]}</span>
                <span className={classNames('mobile-unhidden', ((isTypeCreditMultiFocused(2) || isTypeCreditSingleFocused(2)) ? 'focused' : ''))}>{overallTypeCredit[2]}</span>
              </div>
            </div>
            <div className={classNames('attribute')} onMouseOver={() => this.setFocusOnType('Humanities & Social Elective')} onMouseOut={() => this.clearFocus()}>
              <span className={classNames(t('jsx.className.fixedByLang'))}>{t('ui.type.humanitiesSocialElectiveShort')}</span>
              <div>
                <span className={classNames('mobile-hidden', (isTypeCreditMultiFocused(4) ? 'focused' : ''))}>{timetableTypeCredit[4]}</span>
                <span className={classNames('mobile-hidden', 'focused')}>{singleFocusedTypeCreditStr[4]}</span>
                <span className={classNames('mobile-unhidden', ((isTypeCreditMultiFocused(4) || isTypeCreditSingleFocused(4)) ? 'focused' : ''))}>{overallTypeCredit[4]}</span>
              </div>
            </div>
          </div>
          <div>
            <div className={classNames('attribute')} onMouseOver={() => this.setFocusOnType('Basic Elective')} onMouseOut={() => this.clearFocus()}>
              <span className={classNames(t('jsx.className.fixedByLang'))}>{t('ui.type.basicElectiveShort')}</span>
              <div>
                <span className={classNames('mobile-hidden', (isTypeCreditMultiFocused(1) ? 'focused' : ''))}>{timetableTypeCredit[1]}</span>
                <span className={classNames('mobile-hidden', 'focused')}>{singleFocusedTypeCreditStr[1]}</span>
                <span className={classNames('mobile-unhidden', ((isTypeCreditMultiFocused(1) || isTypeCreditSingleFocused(1)) ? 'focused' : ''))}>{overallTypeCredit[1]}</span>
              </div>
            </div>
            <div className={classNames('attribute')} onMouseOver={() => this.setFocusOnType('Major Elective')} onMouseOut={() => this.clearFocus()}>
              <span className={classNames(t('jsx.className.fixedByLang'))}>{t('ui.type.majorElectiveShort')}</span>
              <div>
                <span className={classNames('mobile-hidden', (isTypeCreditMultiFocused(3) ? 'focused' : ''))}>{timetableTypeCredit[3]}</span>
                <span className={classNames('mobile-hidden', 'focused')}>{singleFocusedTypeCreditStr[3]}</span>
                <span className={classNames('mobile-unhidden', ((isTypeCreditMultiFocused(3) || isTypeCreditSingleFocused(3)) ? 'focused' : ''))}>{overallTypeCredit[3]}</span>
              </div>
            </div>
            <div className={classNames('attribute')} onMouseOver={() => this.setFocusOnType('Etc')} onMouseOut={() => this.clearFocus()}>
              <span className={classNames(t('jsx.className.fixedByLang'))}>{t('ui.type.etcShort')}</span>
              <div>
                <span className={classNames('mobile-hidden', (isTypeCreditMultiFocused(5) ? 'focused' : ''))}>{timetableTypeCredit[5]}</span>
                <span className={classNames('mobile-hidden', 'focused')}>{singleFocusedTypeCreditStr[5]}</span>
                <span className={classNames('mobile-unhidden', ((isTypeCreditMultiFocused(5) || isTypeCreditSingleFocused(5)) ? 'focused' : ''))}>{overallTypeCredit[5]}</span>
              </div>
            </div>
          </div>
        </div>
        <div className={classNames('scores')}>
          <div onMouseOver={() => this.setFocusOnCredit('Credit')} onMouseOut={() => this.clearFocus()}>
            <div>
              <span className={classNames('normal', ((isCreditSingleFocused || isCreditMultiFocused) ? 'focused' : ''))}>{overallCredit}</span>
            </div>
            <div>{t('ui.score.credit')}</div>
          </div>
          <div onMouseOver={() => this.setFocusOnCredit('Credit AU')} onMouseOut={() => this.clearFocus()}>
            <div>
              <span className={classNames('normal', ((isAuSingleFocused || isAuMultiFocused) ? 'focused' : ''))}>{overallAu}</span>
            </div>
            <div>{t('ui.score.au')}</div>
          </div>
        </div>
        <div className={classNames('scores')}>
          <div onMouseOver={() => this.setFocusOnScore('Grade')} onMouseOut={() => this.clearFocus()}>
            <div className={classNames((isGradeMultiFocused ? 'focused' : ''))}>{(targetNum !== 0) ? getAverageScoreLabel(timetableGrade / targetNum) : '?'}</div>
            <div>{t('ui.score.grade')}</div>
          </div>
          <div onMouseOver={() => this.setFocusOnScore('Load')} onMouseOut={() => this.clearFocus()}>
            <div className={classNames((isLoadMultiFocused ? 'focused' : ''))}>{(targetNum !== 0) ? getAverageScoreLabel(timetableLoad / targetNum) : '?'}</div>
            <div>{t('ui.score.load')}</div>
          </div>
          <div onMouseOver={() => this.setFocusOnScore('Speech')} onMouseOut={() => this.clearFocus()}>
            <div className={classNames((isSpeechMultiFocused ? 'focused' : ''))}>{(targetNum !== 0) ? getAverageScoreLabel(timetableSpeech / targetNum) : '?'}</div>
            <div>{t('ui.score.speech')}</div>
          </div>
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

SummarySubSection.propTypes = {
  selectedTimetable: timetableShape,
  lectureFocus: lectureFocusShape.isRequired,

  setMultipleFocusDispatch: PropTypes.func.isRequired,
  clearMultipleFocusDispatch: PropTypes.func.isRequired,
};


export default withTranslation()(connect(mapStateToProps, mapDispatchToProps)(SummarySubSection));
