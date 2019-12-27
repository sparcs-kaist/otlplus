import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';

import { clearMultipleDetail, setMultipleDetail } from '../../../actions/timetable/lectureActive';
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
    const { t } = this.props;
    const { lectureActiveFrom, currentTimetable, setMultipleDetailDispatch } = this.props;

    if (lectureActiveFrom !== 'NONE' || !currentTimetable) {
      return;
    }

    const lectures = currentTimetable.lectures
      .filter(lecture => (indexOfType(lecture.type_en) === indexOfType(type)))
      .map(lecture => ({
        id: lecture.id,
        title: lecture[t('js.property.title')],
        info: (lecture.credit > 0) ? t('ui.others.creditCount', { count: lecture.credit }) : t('ui.others.auCount', { count: lecture.credit_au }),
      }));
    setMultipleDetailDispatch(type, lectures);
    this.setState({ active: type });
  }

  creditFocus(type) {
    const { t } = this.props;
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
            title: lecture[t('js.property.title')],
            info: t('ui.others.creditCount', { count: lecture.credit }),
          }))
      )
      : (
        (type === 'Credit AU')
          ? (
            currentTimetable.lectures
              .filter(lecture => (lecture.credit_au > 0))
              .map(lecture => ({
                id: lecture.id,
                title: lecture[t('js.property.title')],
                info: t('ui.others.auCount', { count: lecture.credit_au }),
              }))
          )
          : []
      );
    setMultipleDetailDispatch(type, lectures);
    this.setState({ active: type });
  }

  scoreFocus(type) {
    const { t } = this.props;
    const { lectureActiveFrom, currentTimetable, setMultipleDetailDispatch } = this.props;

    if (lectureActiveFrom !== 'NONE' || !currentTimetable) {
      return;
    }

    const lectures = currentTimetable.lectures.map(lecture => ({
      id: lecture.id,
      title: lecture[t('js.property.title')],
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
    const { t } = this.props;
    const { active } = this.state;
    const { currentTimetable, lectureActiveLecture, lectureActiveFrom } = this.props;

    const timetableLectures = currentTimetable
      ? currentTimetable.lectures
      : [];
    const currentTypeCredit = [0, 1, 2, 3, 4, 5].map(index => (
      timetableLectures
        .filter(lecture => (indexOfType(lecture.type_en) === index))
        .reduce((acc, lecture) => (acc + (lecture.credit + lecture.credit_au)), 0)
    ));
    const alec = lectureActiveLecture;
    const allCreditCredit = timetableLectures.reduce((acc, lecture) => (acc + lecture.credit), 0)
      + (alec && !inTimetable(alec, currentTimetable) ? alec.credit : 0);
    const allAuCredit = timetableLectures.reduce((acc, lecture) => (acc + lecture.credit_au), 0)
      + (alec && !inTimetable(alec, currentTimetable) ? alec.credit_au : 0);
    const targetNum = timetableLectures.reduce((acc, lecture) => (acc + (lecture.credit + lecture.credit_au)), 0);
    const grade = timetableLectures.reduce((acc, lecture) => (acc + (lecture.grade * (lecture.credit + lecture.credit_au))), 0);
    const load = timetableLectures.reduce((acc, lecture) => (acc + (lecture.load * (lecture.credit + lecture.credit_au))), 0);
    const speech = timetableLectures.reduce((acc, lecture) => (acc + (lecture.speech * (lecture.credit + lecture.credit_au))), 0);
    const letters = ['?', 'F', 'F', 'F', 'D-', 'D', 'D+', 'C-', 'C', 'C+', 'B-', 'B', 'B+', 'A-', 'A', 'A+'];

    const isLectureActiveFromType = (laf, lal, typeIndex) => (
      (laf === LIST || lectureActiveFrom === TABLE)
      && (indexOfType(lal.type_en) === typeIndex)
    );
    const activeTypeCredit = [0, 1, 2, 3, 4, 5].map(i => (
      !isLectureActiveFromType(lectureActiveFrom, lectureActiveLecture, i)
        ? ''
        : inTimetable(lectureActiveLecture, currentTimetable)
          ? `(${lectureActiveLecture.credit + lectureActiveLecture.credit_au})`
          : `+${lectureActiveLecture.credit + lectureActiveLecture.credit_au}`
    ));
    const totalTypeCredit = [0, 1, 2, 3, 4, 5].map(i => (
      !isLectureActiveFromType(lectureActiveFrom, lectureActiveLecture, i)
        ? currentTypeCredit[i]
        : inTimetable(lectureActiveLecture, currentTimetable)
          ? currentTypeCredit[i]
          : currentTypeCredit[i] + lectureActiveLecture.credit + lectureActiveLecture.credit_au
    ));

    const creditAct = (lectureActiveLecture !== null) && (lectureActiveLecture.credit > 0);
    const creditAuAct = (lectureActiveLecture !== null) && (lectureActiveLecture.credit_au > 0);

    return (
      <div className={classNames('section-content--summary')}>
        <div className={classNames('section-content--summary__type')}>
          <div>
            <div className={classNames('attribute')} onMouseOver={() => this.typeFocus('Basic Required')} onMouseOut={() => this.clearFocus()}>
              <span className={classNames(t('jsx.className.fixedByLang'))}>{t('ui.type.basicRequiredShort')}</span>
              <div>
                <span className={classNames('mobile-hidden', (active === 'Basic Required' ? 'active' : ''))}>{currentTypeCredit[0]}</span>
                <span className={classNames('mobile-hidden', 'active')}>{activeTypeCredit[0]}</span>
                <span className={classNames('mobile-unhidden', (isLectureActiveFromType(lectureActiveFrom, lectureActiveLecture, 0) ? 'active' : ''))}>{totalTypeCredit[0]}</span>
              </div>
            </div>
            <div className={classNames('attribute')} onMouseOver={() => this.typeFocus('Major Required')} onMouseOut={() => this.clearFocus()}>
              <span className={classNames(t('jsx.className.fixedByLang'))}>{t('ui.type.majorRequiredShort')}</span>
              <div>
                <span className={classNames('mobile-hidden', (active === 'Major Required' ? 'active' : ''))}>{currentTypeCredit[2]}</span>
                <span className={classNames('mobile-hidden', 'active')}>{activeTypeCredit[2]}</span>
                <span className={classNames('mobile-unhidden', (isLectureActiveFromType(lectureActiveFrom, lectureActiveLecture, 2) ? 'active' : ''))}>{totalTypeCredit[2]}</span>
              </div>
            </div>
            <div className={classNames('attribute')} onMouseOver={() => this.typeFocus('Humanities & Social Elective')} onMouseOut={() => this.clearFocus()}>
              <span className={classNames(t('jsx.className.fixedByLang'))}>{t('ui.type.humanitiesSocialElectiveShort')}</span>
              <div>
                <span className={classNames('mobile-hidden', (active === 'Humanities & Social Elective' ? 'active' : ''))}>{currentTypeCredit[4]}</span>
                <span className={classNames('mobile-hidden', 'active')}>{activeTypeCredit[4]}</span>
                <span className={classNames('mobile-unhidden', (isLectureActiveFromType(lectureActiveFrom, lectureActiveLecture, 4) ? 'active' : ''))}>{totalTypeCredit[4]}</span>
              </div>
            </div>
          </div>
          <div>
            <div className={classNames('attribute')} onMouseOver={() => this.typeFocus('Basic Elective')} onMouseOut={() => this.clearFocus()}>
              <span className={classNames(t('jsx.className.fixedByLang'))}>{t('ui.type.basicElectiveShort')}</span>
              <div>
                <span className={classNames('mobile-hidden', (active === 'Basic Elective' ? 'active' : ''))}>{currentTypeCredit[1]}</span>
                <span className={classNames('mobile-hidden', 'active')}>{activeTypeCredit[1]}</span>
                <span className={classNames('mobile-unhidden', (isLectureActiveFromType(lectureActiveFrom, lectureActiveLecture, 1) ? 'active' : ''))}>{totalTypeCredit[1]}</span>
              </div>
            </div>
            <div className={classNames('attribute')} onMouseOver={() => this.typeFocus('Major Elective')} onMouseOut={() => this.clearFocus()}>
              <span className={classNames(t('jsx.className.fixedByLang'))}>{t('ui.type.majorElectiveShort')}</span>
              <div>
                <span className={classNames('mobile-hidden', (active === 'Major Elective' ? 'active' : ''))}>{currentTypeCredit[3]}</span>
                <span className={classNames('mobile-hidden', 'active')}>{activeTypeCredit[3]}</span>
                <span className={classNames('mobile-unhidden', (isLectureActiveFromType(lectureActiveFrom, lectureActiveLecture, 3) ? 'active' : ''))}>{totalTypeCredit[3]}</span>
              </div>
            </div>
            <div className={classNames('attribute')} onMouseOver={() => this.typeFocus('Etc')} onMouseOut={() => this.clearFocus()}>
              <span className={classNames(t('jsx.className.fixedByLang'))}>{t('ui.type.etcShort')}</span>
              <div>
                <span className={classNames('mobile-hidden', (active === 'Etc' ? 'active' : ''))}>{currentTypeCredit[5]}</span>
                <span className={classNames('mobile-hidden', 'active')}>{activeTypeCredit[5]}</span>
                <span className={classNames('mobile-unhidden', (isLectureActiveFromType(lectureActiveFrom, lectureActiveLecture, 5) ? 'active' : ''))}>{totalTypeCredit[5]}</span>
              </div>
            </div>
          </div>
        </div>
        <div className={classNames('scores')}>
          <div onMouseOver={() => this.creditFocus('Credit')} onMouseOut={() => this.clearFocus()}>
            <div>
              <span className={classNames('normal', (creditAct ? 'active' : active === 'Credit' ? 'active' : ''))}>{allCreditCredit}</span>
            </div>
            <div>{t('ui.score.credit')}</div>
          </div>
          <div onMouseOver={() => this.creditFocus('Credit AU')} onMouseOut={() => this.clearFocus()}>
            <div>
              <span className={classNames('normal', (creditAuAct ? 'active' : active === 'Credit AU' ? 'active' : ''))}>{allAuCredit}</span>
            </div>
            <div>{t('ui.score.au')}</div>
          </div>
        </div>
        <div className={classNames('scores')}>
          <div onMouseOver={() => this.scoreFocus('Grade')} onMouseOut={() => this.clearFocus()}>
            <div className={classNames((active === 'Grade' ? 'active' : ''))}>{(targetNum !== 0) ? letters[Math.round(grade / targetNum)] : '?'}</div>
            <div>{t('ui.score.grade')}</div>
          </div>
          <div onMouseOver={() => this.scoreFocus('Load')} onMouseOut={() => this.clearFocus()}>
            <div className={classNames((active === 'Load' ? 'active' : ''))}>{(targetNum !== 0) ? letters[Math.round(load / targetNum)] : '?'}</div>
            <div>{t('ui.score.load')}</div>
          </div>
          <div onMouseOver={() => this.scoreFocus('Speech')} onMouseOut={() => this.clearFocus()}>
            <div className={classNames((active === 'Speech' ? 'active' : ''))}>{(targetNum !== 0) ? letters[Math.round(speech / targetNum)] : '?'}</div>
            <div>{t('ui.score.speech')}</div>
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


export default withTranslation()(connect(mapStateToProps, mapDispatchToProps)(SummarySubSection));
