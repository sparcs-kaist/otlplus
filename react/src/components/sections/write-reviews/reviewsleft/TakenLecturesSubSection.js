import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import ReactGA from 'react-ga';

import { appBoundClassNames as classNames } from '../../../../common/boundClassNames';

import Divider from '../../../Divider';
import Scroller from '../../../Scroller';
import LectureSimpleBlock from '../../../blocks/LectureSimpleBlock';

import { setReviewsFocus, clearReviewsFocus } from '../../../../actions/write-reviews/reviewsFocus';
import { ReviewsFocusFrom } from '../../../../reducers/write-reviews/reviewsFocus';

import { unique } from '../../../../utils/commonUtils';
import { getSemesterName } from '../../../../utils/semesterUtils';

import userShape from '../../../../shapes/model/session/UserShape';
import lectureShape from '../../../../shapes/model/subject/LectureShape';


class TakenLecturesSubSection extends Component {
  focusLectureWithClick = (lecture) => {
    const {
      selectedLecture,
      setReviewsFocusDispatch, clearReviewsFocusDispatch,
    } = this.props;

    if (selectedLecture && (lecture.id === selectedLecture.id)) {
      clearReviewsFocusDispatch();

      ReactGA.event({
        category: 'Write Reviews - Selection',
        action: 'Selected Lecture',
        label: `Lecture : ${lecture.id}`,
      });
    }
    else {
      setReviewsFocusDispatch(ReviewsFocusFrom.LECTURE, lecture);

      ReactGA.event({
        category: 'Write Reviews - Selection',
        action: 'Unelected Lecture',
        label: `Lecture : ${lecture.id}`,
      });
    }
  }


  render() {
    const { t } = this.props;
    const { user, selectedLecture } = this.props;

    const writableTakenLectures = user ? user.review_writable_lectures : [];
    // eslint-disable-next-line fp/no-mutating-methods
    const targetSemesters = unique(
      writableTakenLectures.map((l) => ({ year: l.year, semester: l.semester })),
      (a, b) => ((a.year === b.year) && (a.semester === b.semester))
    )
      .sort((a, b) => ((a.year !== b.year) ? (b.year - a.year) : (b.semester - a.semester)));

    const getTakenLecturesArea = () => {
      if (!user) {
        return (
          <div className={classNames('list-placeholder')}>{t('ui.placeholder.loginRequired')}</div>
        );
      }
      if (targetSemesters.length === 0) {
        return (
          <div className={classNames('list-placeholder')}>{t('ui.placeholder.noResults')}</div>
        );
      }
      return (
        <Scroller expandTop={12}>
          {
            targetSemesters.map((s, i) => (
              <React.Fragment key={`${s.year}-${s.semester}`}>
                {
                  (i !== 0)
                    ? <Divider orientation={Divider.Orientation.HORIZONTAL} isVisible={true} />
                    : null
                }
                <div className={classNames('small-title')}>
                  {`${s.year} ${getSemesterName(s.semester)}`}
                </div>
                <div className={classNames('block-grid')}>
                  {
                    writableTakenLectures
                      .filter((l) => (l.year === s.year && l.semester === s.semester))
                      .map((l) => (
                        !selectedLecture
                          ? (
                            <LectureSimpleBlock
                              key={l.id}
                              lecture={l}
                              isRaised={false}
                              isDimmed={false}
                              hasReview={user.reviews.some((r) => (r.lecture.id === l.id))}
                              onClick={this.focusLectureWithClick}
                            />
                          )
                          : (
                            <LectureSimpleBlock
                              key={l.id}
                              lecture={l}
                              isRaised={selectedLecture.id === l.id}
                              isDimmed={selectedLecture.id !== l.id}
                              hasReview={user.reviews.some((r) => (r.lecture.id === l.id))}
                              onClick={this.focusLectureWithClick}
                            />
                          )
                      ))
                  }
                </div>
              </React.Fragment>
            ))
          }
        </Scroller>
      );
    };

    return (
      <div className={classNames('subsection', 'subsection--taken-lectures')}>
        { getTakenLecturesArea() }
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.common.user.user,
  selectedLecture: state.writeReviews.reviewsFocus.lecture,
});

const mapDispatchToProps = (dispatch) => ({
  setReviewsFocusDispatch: (from, lecture) => {
    dispatch(setReviewsFocus(from, lecture));
  },
  clearReviewsFocusDispatch: () => {
    dispatch(clearReviewsFocus());
  },
});

TakenLecturesSubSection.propTypes = {
  user: userShape,
  selectedLecture: lectureShape,

  setReviewsFocusDispatch: PropTypes.func.isRequired,
  clearReviewsFocusDispatch: PropTypes.func.isRequired,
};


export default withTranslation()(
  connect(mapStateToProps, mapDispatchToProps)(
    TakenLecturesSubSection
  )
);
