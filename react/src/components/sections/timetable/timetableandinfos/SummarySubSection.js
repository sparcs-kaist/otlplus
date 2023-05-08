import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { sumBy } from 'lodash';

import { appBoundClassNames as classNames } from '../../../../common/boundClassNames';
import { getAverageScoreLabel } from '../../../../utils/scoreUtils';

import { clearMultipleFocus, setMultipleFocus } from '../../../../actions/timetable/lectureFocus';

import { LectureFocusFrom } from '../../../../reducers/timetable/lectureFocus';

import lectureFocusShape from '../../../../shapes/state/timetable/LectureFocusShape';
import timetableShape, { myPseudoTimetableShape } from '../../../../shapes/model/timetable/TimetableShape';

import { inTimetable, getOverallLectures } from '../../../../utils/lectureUtils';
import Attributes from '../../../Attributes';
import Scores from '../../../Scores';


const TAGET_TYPES = ['Basic Required', 'Basic Elective', 'Major Required', 'Major Elective', 'Humanities & Social Elective'];

const indexOfType = (type) => {
  const index = TAGET_TYPES.findIndex((t) => type.startsWith(t));
  if (index === -1) {
    return 5;
  }
  return index;
};

const typeOfIndex = (index) => {
  if (index === 5) {
    return 'Etc';
  }
  return TAGET_TYPES[index];
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

    if (lectureFocus.from !== LectureFocusFrom.NONE || !selectedTimetable) {
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

    if (lectureFocus.from !== LectureFocusFrom.NONE || !selectedTimetable) {
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

    if (lectureFocus.from !== LectureFocusFrom.NONE || !selectedTimetable) {
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

    if (lectureFocus.from !== LectureFocusFrom.MULTIPLE) {
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
      (lectureFocus.from === LectureFocusFrom.LIST || lectureFocus.from === LectureFocusFrom.TABLE)
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
        ? null
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
    const isCreditSingleFocused = (
      lectureFocus.lecture !== null
      && lectureFocus.lecture.credit > 0
    );
    const isAuSingleFocused = (
      lectureFocus.lecture !== null
      && lectureFocus.lecture.credit_au > 0
    );
    const isCreditMultiFocused = (multipleFocusCode === 'Credit');
    const isAuMultiFocused = (multipleFocusCode === 'Credit AU');

    const timetableLecturesWithReview = timetableLectures.filter((l) => (
      l.review_total_weight > 0
    ));
    const getWeightOfLecture = (lecture) => (lecture.credit + lecture.credit_au);
    const totalWeight = sumBy(
      timetableLecturesWithReview,
      (l) => getWeightOfLecture(l)
    );
    const gradeWeightedSum = sumBy(
      timetableLecturesWithReview,
      (l) => (l.grade * getWeightOfLecture(l))
    );
    const loadWeightedSum = sumBy(
      timetableLecturesWithReview,
      (l) => (l.load * getWeightOfLecture(l))
    );
    const timetableWeightedSum = sumBy(
      timetableLecturesWithReview,
      (l) => (l.speech * getWeightOfLecture(l))
    );
    const isGradeMultiFocused = (multipleFocusCode === 'Grade');
    const isLoadMultiFocused = (multipleFocusCode === 'Load');
    const isSpeechMultiFocused = (multipleFocusCode === 'Speech');

    return (
      <div className={classNames('subsection--summary')}>
        <div className={classNames('subsection--summary__type')}>
          <Attributes
            entries={
              [
                [0, t('ui.type.basicRequiredShort'), 'Basic Required'],
                [2, t('ui.type.majorRequiredShort'), 'Major Required'],
                [4, t('ui.type.humanitiesSocialElectiveShort'), 'Humanities & Social Elective'],
              ]
                .map(([ti, tn]) => ({
                  name: tn,
                  info: (
                    <>
                      <span className={classNames('mobile-hidden', (isTypeCreditMultiFocused(ti) ? 'focused' : null))}>{timetableTypeCredit[ti]}</span>
                      <span className={classNames('mobile-hidden', 'focused')}>{singleFocusedTypeCreditStr[ti]}</span>
                      <span className={classNames('desktop-hidden', ((isTypeCreditMultiFocused(ti) || isTypeCreditSingleFocused(ti)) ? 'focused' : null))}>{overallTypeCredit[ti]}</span>
                    </>
                  ),
                  onMouseOver: () => this.setFocusOnType(typeOfIndex(ti)),
                  onMouseOut: () => this.clearFocus(),
                }))
            }
            fixedWidthName
          />
          <Attributes
            entries={
              [
                [1, t('ui.type.basicElectiveShort'), 'Basic Elective'],
                [3, t('ui.type.majorElectiveShort'), 'Major Elective'],
                [5, t('ui.type.etcShort'), 'Etc'],
              ]
                .map(([ti, tn]) => ({
                  name: tn,
                  info: (
                    <>
                      <span className={classNames('mobile-hidden', (isTypeCreditMultiFocused(ti) ? 'focused' : null))}>{timetableTypeCredit[ti]}</span>
                      <span className={classNames('mobile-hidden', 'focused')}>{singleFocusedTypeCreditStr[ti]}</span>
                      <span className={classNames('desktop-hidden', ((isTypeCreditMultiFocused(ti) || isTypeCreditSingleFocused(ti)) ? 'focused' : null))}>{overallTypeCredit[ti]}</span>
                    </>
                  ),
                  onMouseOver: () => this.setFocusOnType(typeOfIndex(ti)),
                  onMouseOut: () => this.clearFocus(),
                }))
            }
            fixedWidthName
          />
        </div>
        <Scores
          entries={[
            {
              name: t('ui.score.credit'),
              score: <span className={classNames(((isCreditSingleFocused || isCreditMultiFocused) ? 'focused' : null))}>{overallCredit}</span>,
              onMouseOver: () => this.setFocusOnCredit('Credit'),
              onMouseOut: () => this.clearFocus(),
            },
            {
              name: t('ui.score.au'),
              score: <span className={classNames(((isAuSingleFocused || isAuMultiFocused) ? 'focused' : null))}>{overallAu}</span>,
              onMouseOver: () => this.setFocusOnCredit('Credit AU'),
              onMouseOut: () => this.clearFocus(),
            },
          ]}
        />
        <Scores
          entries={[
            {
              name: t('ui.score.grade'),
              score: <span className={classNames((isGradeMultiFocused ? 'focused' : null))}>{(totalWeight !== 0) ? getAverageScoreLabel(gradeWeightedSum / totalWeight) : '?'}</span>,
              onMouseOver: () => this.setFocusOnScore('Grade'),
              onMouseOut: () => this.clearFocus(),
            },
            {
              name: t('ui.score.load'),
              score: <span className={classNames((isLoadMultiFocused ? 'focused' : null))}>{(totalWeight !== 0) ? getAverageScoreLabel(loadWeightedSum / totalWeight) : '?'}</span>,
              onMouseOver: () => this.setFocusOnScore('Load'),
              onMouseOut: () => this.clearFocus(),
            },
            {
              name: t('ui.score.speech'),
              score: <span className={classNames((isSpeechMultiFocused ? 'focused' : null))}>{(totalWeight !== 0) ? getAverageScoreLabel(timetableWeightedSum / totalWeight) : '?'}</span>,
              onMouseOver: () => this.setFocusOnScore('Speech'),
              onMouseOut: () => this.clearFocus(),
            },
          ]}
        />
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
  selectedTimetable: PropTypes.oneOfType([timetableShape, myPseudoTimetableShape]),
  lectureFocus: lectureFocusShape.isRequired,

  setMultipleFocusDispatch: PropTypes.func.isRequired,
  clearMultipleFocusDispatch: PropTypes.func.isRequired,
};


export default withTranslation()(
  connect(mapStateToProps, mapDispatchToProps)(
    SummarySubSection
  )
);
