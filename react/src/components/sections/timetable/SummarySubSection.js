import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';
import { getAverageScoreLabel } from '../../../common/scoreFunctions';

import { clearMultipleDetail, setMultipleDetail } from '../../../actions/timetable/lectureFocus';

import { NONE, LIST, TABLE, MULTIPLE } from '../../../reducers/timetable/lectureFocus';

import lectureFocusShape from '../../../shapes/LectureFocusShape';
import timetableShape from '../../../shapes/TimetableShape';

import { inTimetable } from '../../../common/lectureFunctions';
import { sum } from '../../../common/utilFunctions';


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
      multipleFocusCode: '',
    };
  }

  typeFocus(type) {
    const { t } = this.props;
    const { lectureFocus, selectedTimetable, setMultipleDetailDispatch } = this.props;

    if (lectureFocus.from !== 'NONE' || !selectedTimetable) {
      return;
    }

    const lectures = selectedTimetable.lectures
      .filter(l => (indexOfType(l.type_en) === indexOfType(type)))
      .map(l => ({
        id: l.id,
        title: l[t('js.property.title')],
        info: (l.credit > 0) ? t('ui.others.creditCount', { count: l.credit }) : t('ui.others.auCount', { count: l.credit_au }),
      }));
    setMultipleDetailDispatch(type, lectures);
    this.setState({ multipleFocusCode: type });
  }

  creditFocus(type) {
    const { t } = this.props;
    const { lectureFocus, selectedTimetable, setMultipleDetailDispatch } = this.props;

    if (lectureFocus.from !== 'NONE' || !selectedTimetable) {
      return;
    }

    const lectures = (type === 'Credit')
      ? (
        selectedTimetable.lectures
          .filter(l => (l.credit > 0))
          .map(l => ({
            id: l.id,
            title: l[t('js.property.title')],
            info: t('ui.others.creditCount', { count: l.credit }),
          }))
      )
      : (
        (type === 'Credit AU')
          ? (
            selectedTimetable.lectures
              .filter(l => (l.credit_au > 0))
              .map(l => ({
                id: l.id,
                title: l[t('js.property.title')],
                info: t('ui.others.auCount', { count: l.credit_au }),
              }))
          )
          : []
      );
    setMultipleDetailDispatch(type, lectures);
    this.setState({ multipleFocusCode: type });
  }

  scoreFocus(type) {
    const { t } = this.props;
    const { lectureFocus, selectedTimetable, setMultipleDetailDispatch } = this.props;

    if (lectureFocus.from !== 'NONE' || !selectedTimetable) {
      return;
    }

    const lectures = selectedTimetable.lectures.map(l => ({
      id: l.id,
      title: l[t('js.property.title')],
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
    setMultipleDetailDispatch(type, lectures);
    this.setState({ multipleFocusCode: type });
  }


  clearFocus() {
    const { lectureFocus, clearMultipleDetailDispatch } = this.props;

    if (lectureFocus.from !== 'MULTIPLE') {
      return;
    }

    clearMultipleDetailDispatch();
    this.setState({ multipleFocusCode: '' });
  }

  render() {
    const { t } = this.props;
    const { multipleFocusCode } = this.state;
    const { selectedTimetable, lectureFocus } = this.props;

    const timetableLectures = selectedTimetable
      ? selectedTimetable.lectures
      : [];
    const alec = lectureFocus.lecture;

    const isSingleFocusedLectureFromType = typeIndex => (
      (lectureFocus.from === LIST || lectureFocus.from === TABLE)
      && (indexOfType(lectureFocus.lecture.type_en) === typeIndex)
    );

    const timetableTypeCredit = [0, 1, 2, 3, 4, 5].map((i) => {
      const lecturesWithType = timetableLectures.filter(l => (indexOfType(l.type_en) === i));
      return sum(lecturesWithType, l => (l.credit + l.credit_au));
    });
    const singleFocusedTypeCreditStr = [0, 1, 2, 3, 4, 5].map(i => (
      !isSingleFocusedLectureFromType(i)
        ? ''
        : inTimetable(lectureFocus.lecture, selectedTimetable)
          ? `(${lectureFocus.lecture.credit + lectureFocus.lecture.credit_au})`
          : `+${lectureFocus.lecture.credit + lectureFocus.lecture.credit_au}`
    ));
    const overallTypeCredit = [0, 1, 2, 3, 4, 5].map(i => (
      !isSingleFocusedLectureFromType(i)
        ? timetableTypeCredit[i]
        : inTimetable(lectureFocus.lecture, selectedTimetable)
          ? timetableTypeCredit[i]
          : timetableTypeCredit[i] + lectureFocus.lecture.credit + lectureFocus.lecture.credit_au
    ));

    const overallCredit = sum(timetableLectures, l => l.credit)
      + (alec && !inTimetable(alec, selectedTimetable) ? alec.credit : 0);
    const overallAu = sum(timetableLectures, l => l.credit_au)
      + (alec && !inTimetable(alec, selectedTimetable) ? alec.credit_au : 0);
    const isCreditSingleFocused = (lectureFocus.lecture !== null) && (lectureFocus.lecture.credit > 0);
    const isAuSingleFocused = (lectureFocus.lecture !== null) && (lectureFocus.lecture.credit_au > 0);

    const timetableLecturesWithReview = timetableLectures.filter(l => (l.review_num > 0));
    const targetNum = sum(timetableLecturesWithReview, l => (l.credit + l.credit_au));
    const timetableGrade = sum(timetableLecturesWithReview, l => (l.grade * (l.credit + l.credit_au)));
    const timetableLoad = sum(timetableLecturesWithReview, l => (l.load * (l.credit + l.credit_au)));
    const timetableSpeech = sum(timetableLecturesWithReview, l => (l.speech * (l.credit + l.credit_au)));

    return (
      <div className={classNames('section-content--summary')}>
        <div className={classNames('section-content--summary__type')}>
          <div>
            <div className={classNames('attribute')} onMouseOver={() => this.typeFocus('Basic Required')} onMouseOut={() => this.clearFocus()}>
              <span className={classNames(t('jsx.className.fixedByLang'))}>{t('ui.type.basicRequiredShort')}</span>
              <div>
                <span className={classNames('mobile-hidden', (multipleFocusCode === 'Basic Required' ? 'focused' : ''))}>{timetableTypeCredit[0]}</span>
                <span className={classNames('mobile-hidden', 'focused')}>{singleFocusedTypeCreditStr[0]}</span>
                <span className={classNames('mobile-unhidden', ((multipleFocusCode === 'Basic Required') || isSingleFocusedLectureFromType(0) ? 'focused' : ''))}>{overallTypeCredit[0]}</span>
              </div>
            </div>
            <div className={classNames('attribute')} onMouseOver={() => this.typeFocus('Major Required')} onMouseOut={() => this.clearFocus()}>
              <span className={classNames(t('jsx.className.fixedByLang'))}>{t('ui.type.majorRequiredShort')}</span>
              <div>
                <span className={classNames('mobile-hidden', (multipleFocusCode === 'Major Required' ? 'focused' : ''))}>{timetableTypeCredit[2]}</span>
                <span className={classNames('mobile-hidden', 'focused')}>{singleFocusedTypeCreditStr[2]}</span>
                <span className={classNames('mobile-unhidden', ((multipleFocusCode === 'Major Required') || isSingleFocusedLectureFromType(2) ? 'focused' : ''))}>{overallTypeCredit[2]}</span>
              </div>
            </div>
            <div className={classNames('attribute')} onMouseOver={() => this.typeFocus('Humanities & Social Elective')} onMouseOut={() => this.clearFocus()}>
              <span className={classNames(t('jsx.className.fixedByLang'))}>{t('ui.type.humanitiesSocialElectiveShort')}</span>
              <div>
                <span className={classNames('mobile-hidden', (multipleFocusCode === 'Humanities & Social Elective' ? 'focused' : ''))}>{timetableTypeCredit[4]}</span>
                <span className={classNames('mobile-hidden', 'focused')}>{singleFocusedTypeCreditStr[4]}</span>
                <span className={classNames('mobile-unhidden', ((multipleFocusCode === 'Humanities & Social Elective') || isSingleFocusedLectureFromType(4) ? 'focused' : ''))}>{overallTypeCredit[4]}</span>
              </div>
            </div>
          </div>
          <div>
            <div className={classNames('attribute')} onMouseOver={() => this.typeFocus('Basic Elective')} onMouseOut={() => this.clearFocus()}>
              <span className={classNames(t('jsx.className.fixedByLang'))}>{t('ui.type.basicElectiveShort')}</span>
              <div>
                <span className={classNames('mobile-hidden', (multipleFocusCode === 'Basic Elective' ? 'focused' : ''))}>{timetableTypeCredit[1]}</span>
                <span className={classNames('mobile-hidden', 'focused')}>{singleFocusedTypeCreditStr[1]}</span>
                <span className={classNames('mobile-unhidden', ((multipleFocusCode === 'Basic Elective') || isSingleFocusedLectureFromType(1) ? 'focused' : ''))}>{overallTypeCredit[1]}</span>
              </div>
            </div>
            <div className={classNames('attribute')} onMouseOver={() => this.typeFocus('Major Elective')} onMouseOut={() => this.clearFocus()}>
              <span className={classNames(t('jsx.className.fixedByLang'))}>{t('ui.type.majorElectiveShort')}</span>
              <div>
                <span className={classNames('mobile-hidden', (multipleFocusCode === 'Major Elective' ? 'focused' : ''))}>{timetableTypeCredit[3]}</span>
                <span className={classNames('mobile-hidden', 'focused')}>{singleFocusedTypeCreditStr[3]}</span>
                <span className={classNames('mobile-unhidden', ((multipleFocusCode === 'Major Elective') || isSingleFocusedLectureFromType(3) ? 'focused' : ''))}>{overallTypeCredit[3]}</span>
              </div>
            </div>
            <div className={classNames('attribute')} onMouseOver={() => this.typeFocus('Etc')} onMouseOut={() => this.clearFocus()}>
              <span className={classNames(t('jsx.className.fixedByLang'))}>{t('ui.type.etcShort')}</span>
              <div>
                <span className={classNames('mobile-hidden', (multipleFocusCode === 'Etc' ? 'focused' : ''))}>{timetableTypeCredit[5]}</span>
                <span className={classNames('mobile-hidden', 'focused')}>{singleFocusedTypeCreditStr[5]}</span>
                <span className={classNames('mobile-unhidden', ((multipleFocusCode === 'Etc') || isSingleFocusedLectureFromType(5) ? 'focused' : ''))}>{overallTypeCredit[5]}</span>
              </div>
            </div>
          </div>
        </div>
        <div className={classNames('scores')}>
          <div onMouseOver={() => this.creditFocus('Credit')} onMouseOut={() => this.clearFocus()}>
            <div>
              <span className={classNames('normal', (isCreditSingleFocused ? 'focused' : multipleFocusCode === 'Credit' ? 'focused' : ''))}>{overallCredit}</span>
            </div>
            <div>{t('ui.score.credit')}</div>
          </div>
          <div onMouseOver={() => this.creditFocus('Credit AU')} onMouseOut={() => this.clearFocus()}>
            <div>
              <span className={classNames('normal', (isAuSingleFocused ? 'focused' : multipleFocusCode === 'Credit AU' ? 'focused' : ''))}>{overallAu}</span>
            </div>
            <div>{t('ui.score.au')}</div>
          </div>
        </div>
        <div className={classNames('scores')}>
          <div onMouseOver={() => this.scoreFocus('Grade')} onMouseOut={() => this.clearFocus()}>
            <div className={classNames((multipleFocusCode === 'Grade' ? 'focused' : ''))}>{(targetNum !== 0) ? getAverageScoreLabel(timetableGrade / targetNum) : '?'}</div>
            <div>{t('ui.score.grade')}</div>
          </div>
          <div onMouseOver={() => this.scoreFocus('Load')} onMouseOut={() => this.clearFocus()}>
            <div className={classNames((multipleFocusCode === 'Load' ? 'focused' : ''))}>{(targetNum !== 0) ? getAverageScoreLabel(timetableLoad / targetNum) : '?'}</div>
            <div>{t('ui.score.load')}</div>
          </div>
          <div onMouseOver={() => this.scoreFocus('Speech')} onMouseOut={() => this.clearFocus()}>
            <div className={classNames((multipleFocusCode === 'Speech' ? 'focused' : ''))}>{(targetNum !== 0) ? getAverageScoreLabel(timetableSpeech / targetNum) : '?'}</div>
            <div>{t('ui.score.speech')}</div>
          </div>
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

SummarySubSection.propTypes = {
  selectedTimetable: timetableShape,
  lectureFocus: lectureFocusShape.isRequired,

  setMultipleDetailDispatch: PropTypes.func.isRequired,
  clearMultipleDetailDispatch: PropTypes.func.isRequired,
};


export default withTranslation()(connect(mapStateToProps, mapDispatchToProps)(SummarySubSection));
