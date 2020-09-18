import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';
import { getAverageScoreLabel } from '../../../common/scoreFunctions';

import { clearMultipleDetail, setMultipleDetail } from '../../../actions/timetable/lectureFocus';

import { NONE, LIST, TABLE, MULTIPLE } from '../../../reducers/timetable/lectureFocus';

import lectureShape from '../../../shapes/LectureShape';
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
    const { lectureFocusFrom, currentTimetable, setMultipleDetailDispatch } = this.props;

    if (lectureFocusFrom !== 'NONE' || !currentTimetable) {
      return;
    }

    const lectures = currentTimetable.lectures
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
    const { lectureFocusFrom, currentTimetable, setMultipleDetailDispatch } = this.props;

    if (lectureFocusFrom !== 'NONE' || !currentTimetable) {
      return;
    }

    const lectures = (type === 'Credit')
      ? (
        currentTimetable.lectures
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
            currentTimetable.lectures
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
    const { lectureFocusFrom, currentTimetable, setMultipleDetailDispatch } = this.props;

    if (lectureFocusFrom !== 'NONE' || !currentTimetable) {
      return;
    }

    const lectures = currentTimetable.lectures.map(l => ({
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
    const { lectureFocusFrom, clearMultipleDetailDispatch } = this.props;

    if (lectureFocusFrom !== 'MULTIPLE') {
      return;
    }

    clearMultipleDetailDispatch();
    this.setState({ multipleFocusCode: '' });
  }

  render() {
    const { t } = this.props;
    const { multipleFocusCode } = this.state;
    const { currentTimetable, lectureFocusLecture, lectureFocusFrom } = this.props;

    const timetableLectures = currentTimetable
      ? currentTimetable.lectures
      : [];
    const alec = lectureFocusLecture;

    const isLectureFocusFromType = (laf, lal, typeIndex) => (
      (laf === LIST || lectureFocusFrom === TABLE)
      && (indexOfType(lal.type_en) === typeIndex)
    );

    const currentTypeCredit = [0, 1, 2, 3, 4, 5].map((i) => {
      const lecturesWithType = timetableLectures.filter(l => (indexOfType(l.type_en) === i));
      return sum(lecturesWithType, l => (l.credit + l.credit_au));
    });
    const singleFocusedTypeCreditStr = [0, 1, 2, 3, 4, 5].map(i => (
      !isLectureFocusFromType(lectureFocusFrom, lectureFocusLecture, i)
        ? ''
        : inTimetable(lectureFocusLecture, currentTimetable)
          ? `(${lectureFocusLecture.credit + lectureFocusLecture.credit_au})`
          : `+${lectureFocusLecture.credit + lectureFocusLecture.credit_au}`
    ));
    const totalTypeCredit = [0, 1, 2, 3, 4, 5].map(i => (
      !isLectureFocusFromType(lectureFocusFrom, lectureFocusLecture, i)
        ? currentTypeCredit[i]
        : inTimetable(lectureFocusLecture, currentTimetable)
          ? currentTypeCredit[i]
          : currentTypeCredit[i] + lectureFocusLecture.credit + lectureFocusLecture.credit_au
    ));

    const totalCredit = sum(timetableLectures, l => l.credit)
      + (alec && !inTimetable(alec, currentTimetable) ? alec.credit : 0);
    const totalAu = sum(timetableLectures, l => l.credit_au)
      + (alec && !inTimetable(alec, currentTimetable) ? alec.credit_au : 0);
    const isCreditSingleFocused = (lectureFocusLecture !== null) && (lectureFocusLecture.credit > 0);
    const isAuSingleFocused = (lectureFocusLecture !== null) && (lectureFocusLecture.credit_au > 0);

    const timetableLecturesWithReview = timetableLectures.filter(l => (l.review_num > 0));
    const targetNum = sum(timetableLecturesWithReview, l => (l.credit + l.credit_au));
    const grade = sum(timetableLecturesWithReview, l => (l.grade * (l.credit + l.credit_au)));
    const load = sum(timetableLecturesWithReview, l => (l.load * (l.credit + l.credit_au)));
    const speech = sum(timetableLecturesWithReview, l => (l.speech * (l.credit + l.credit_au)));

    return (
      <div className={classNames('section-content--summary')}>
        <div className={classNames('section-content--summary__type')}>
          <div>
            <div className={classNames('attribute')} onMouseOver={() => this.typeFocus('Basic Required')} onMouseOut={() => this.clearFocus()}>
              <span className={classNames(t('jsx.className.fixedByLang'))}>{t('ui.type.basicRequiredShort')}</span>
              <div>
                <span className={classNames('mobile-hidden', (multipleFocusCode === 'Basic Required' ? 'focused' : ''))}>{currentTypeCredit[0]}</span>
                <span className={classNames('mobile-hidden', 'focused')}>{singleFocusedTypeCreditStr[0]}</span>
                <span className={classNames('mobile-unhidden', ((multipleFocusCode === 'Basic Required') || isLectureFocusFromType(lectureFocusFrom, lectureFocusLecture, 0) ? 'focused' : ''))}>{totalTypeCredit[0]}</span>
              </div>
            </div>
            <div className={classNames('attribute')} onMouseOver={() => this.typeFocus('Major Required')} onMouseOut={() => this.clearFocus()}>
              <span className={classNames(t('jsx.className.fixedByLang'))}>{t('ui.type.majorRequiredShort')}</span>
              <div>
                <span className={classNames('mobile-hidden', (multipleFocusCode === 'Major Required' ? 'focused' : ''))}>{currentTypeCredit[2]}</span>
                <span className={classNames('mobile-hidden', 'focused')}>{singleFocusedTypeCreditStr[2]}</span>
                <span className={classNames('mobile-unhidden', ((multipleFocusCode === 'Major Required') || isLectureFocusFromType(lectureFocusFrom, lectureFocusLecture, 2) ? 'focused' : ''))}>{totalTypeCredit[2]}</span>
              </div>
            </div>
            <div className={classNames('attribute')} onMouseOver={() => this.typeFocus('Humanities & Social Elective')} onMouseOut={() => this.clearFocus()}>
              <span className={classNames(t('jsx.className.fixedByLang'))}>{t('ui.type.humanitiesSocialElectiveShort')}</span>
              <div>
                <span className={classNames('mobile-hidden', (multipleFocusCode === 'Humanities & Social Elective' ? 'focused' : ''))}>{currentTypeCredit[4]}</span>
                <span className={classNames('mobile-hidden', 'focused')}>{singleFocusedTypeCreditStr[4]}</span>
                <span className={classNames('mobile-unhidden', ((multipleFocusCode === 'Humanities & Social Elective') || isLectureFocusFromType(lectureFocusFrom, lectureFocusLecture, 4) ? 'focused' : ''))}>{totalTypeCredit[4]}</span>
              </div>
            </div>
          </div>
          <div>
            <div className={classNames('attribute')} onMouseOver={() => this.typeFocus('Basic Elective')} onMouseOut={() => this.clearFocus()}>
              <span className={classNames(t('jsx.className.fixedByLang'))}>{t('ui.type.basicElectiveShort')}</span>
              <div>
                <span className={classNames('mobile-hidden', (multipleFocusCode === 'Basic Elective' ? 'focused' : ''))}>{currentTypeCredit[1]}</span>
                <span className={classNames('mobile-hidden', 'focused')}>{singleFocusedTypeCreditStr[1]}</span>
                <span className={classNames('mobile-unhidden', ((multipleFocusCode === 'Basic Elective') || isLectureFocusFromType(lectureFocusFrom, lectureFocusLecture, 1) ? 'focused' : ''))}>{totalTypeCredit[1]}</span>
              </div>
            </div>
            <div className={classNames('attribute')} onMouseOver={() => this.typeFocus('Major Elective')} onMouseOut={() => this.clearFocus()}>
              <span className={classNames(t('jsx.className.fixedByLang'))}>{t('ui.type.majorElectiveShort')}</span>
              <div>
                <span className={classNames('mobile-hidden', (multipleFocusCode === 'Major Elective' ? 'focused' : ''))}>{currentTypeCredit[3]}</span>
                <span className={classNames('mobile-hidden', 'focused')}>{singleFocusedTypeCreditStr[3]}</span>
                <span className={classNames('mobile-unhidden', ((multipleFocusCode === 'Major Elective') || isLectureFocusFromType(lectureFocusFrom, lectureFocusLecture, 3) ? 'focused' : ''))}>{totalTypeCredit[3]}</span>
              </div>
            </div>
            <div className={classNames('attribute')} onMouseOver={() => this.typeFocus('Etc')} onMouseOut={() => this.clearFocus()}>
              <span className={classNames(t('jsx.className.fixedByLang'))}>{t('ui.type.etcShort')}</span>
              <div>
                <span className={classNames('mobile-hidden', (multipleFocusCode === 'Etc' ? 'focused' : ''))}>{currentTypeCredit[5]}</span>
                <span className={classNames('mobile-hidden', 'focused')}>{singleFocusedTypeCreditStr[5]}</span>
                <span className={classNames('mobile-unhidden', ((multipleFocusCode === 'Etc') || isLectureFocusFromType(lectureFocusFrom, lectureFocusLecture, 5) ? 'focused' : ''))}>{totalTypeCredit[5]}</span>
              </div>
            </div>
          </div>
        </div>
        <div className={classNames('scores')}>
          <div onMouseOver={() => this.creditFocus('Credit')} onMouseOut={() => this.clearFocus()}>
            <div>
              <span className={classNames('normal', (isCreditSingleFocused ? 'focused' : multipleFocusCode === 'Credit' ? 'focused' : ''))}>{totalCredit}</span>
            </div>
            <div>{t('ui.score.credit')}</div>
          </div>
          <div onMouseOver={() => this.creditFocus('Credit AU')} onMouseOut={() => this.clearFocus()}>
            <div>
              <span className={classNames('normal', (isAuSingleFocused ? 'focused' : multipleFocusCode === 'Credit AU' ? 'focused' : ''))}>{totalAu}</span>
            </div>
            <div>{t('ui.score.au')}</div>
          </div>
        </div>
        <div className={classNames('scores')}>
          <div onMouseOver={() => this.scoreFocus('Grade')} onMouseOut={() => this.clearFocus()}>
            <div className={classNames((multipleFocusCode === 'Grade' ? 'focused' : ''))}>{(targetNum !== 0) ? getAverageScoreLabel(grade / targetNum) : '?'}</div>
            <div>{t('ui.score.grade')}</div>
          </div>
          <div onMouseOver={() => this.scoreFocus('Load')} onMouseOut={() => this.clearFocus()}>
            <div className={classNames((multipleFocusCode === 'Load' ? 'focused' : ''))}>{(targetNum !== 0) ? getAverageScoreLabel(load / targetNum) : '?'}</div>
            <div>{t('ui.score.load')}</div>
          </div>
          <div onMouseOver={() => this.scoreFocus('Speech')} onMouseOut={() => this.clearFocus()}>
            <div className={classNames((multipleFocusCode === 'Speech' ? 'focused' : ''))}>{(targetNum !== 0) ? getAverageScoreLabel(speech / targetNum) : '?'}</div>
            <div>{t('ui.score.speech')}</div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  currentTimetable: state.timetable.timetable.currentTimetable,
  lectureFocusLecture: state.timetable.lectureFocus.lecture,
  lectureFocusFrom: state.timetable.lectureFocus.from,
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
  lectureFocusLecture: lectureShape,
  lectureFocusFrom: PropTypes.oneOf([NONE, LIST, TABLE, MULTIPLE]).isRequired,

  setMultipleDetailDispatch: PropTypes.func.isRequired,
  clearMultipleDetailDispatch: PropTypes.func.isRequired,
};


export default withTranslation()(connect(mapStateToProps, mapDispatchToProps)(SummarySubSection));
