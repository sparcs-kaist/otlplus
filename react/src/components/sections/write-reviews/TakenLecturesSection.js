import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import ReactGA from 'react-ga';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';

import Scroller from '../../Scroller';
import LectureSimpleBlock from '../../blocks/LectureSimpleBlock';

import { setLectureSelected, clearLectureSelected } from '../../../actions/write-reviews/lectureSelected';

import userShape from '../../../shapes/UserShape';
import lectureShape from '../../../shapes/LectureShape';

import { unique, sum } from '../../../common/utilFunctions';


class TakenLecturesSection extends Component {
  handleBlockClick = (lecture) => (e) => {
    const {
      selectedLecture,
      setLectureSelectedDispatch, clearLectureSelectedDispatch,
    } = this.props;

    if (selectedLecture && (lecture.id === selectedLecture.id)) {
      clearLectureSelectedDispatch();

      ReactGA.event({
        category: 'Write Reviews - Selection',
        action: 'Selected Lecture',
        label: `Lecture : ${lecture.id}`,
      });
    }
    else {
      setLectureSelectedDispatch(lecture);

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

    if (!user) {
      return (
        <div className={classNames('section-content', 'section-content--taken-lectures')}>
          <Scroller expandTop={12}>
            <div className={classNames('title')}>
              {t('ui.title.takenLectures')}
            </div>
            <div className={classNames('scores')}>
              <div>
                <div>
                  <span>-</span>
                  <span>/-</span>
                </div>
                <div>{t('ui.score.reviewsWritten')}</div>
              </div>
              <div>
                <div>
                  -
                </div>
                <div>{t('ui.score.likes')}</div>
              </div>
            </div>
            <div className={classNames('divider')} />
            <div className={classNames('list-placeholder')}>{t('ui.placeholder.noResults')}</div>
          </Scroller>
        </div>
      );
    }

    const writableTakenLectures = user.review_writable_lectures;
    const editableReviews = user.reviews.filter((r) => writableTakenLectures.some((l) => l.id === r.lecture.id));

    // eslint-disable-next-line fp/no-mutating-methods
    const targetSemesters = unique(
      writableTakenLectures.map((l) => ({ year: l.year, semester: l.semester })),
      (a, b) => ((a.year === b.year) && (a.semester === b.semester)),
    )
      .sort((a, b) => ((a.year !== b.year) ? (b.year - a.year) : (b.semester - a.semester)));

    const semesterNames = [
      null,
      t('ui.semester.spring'),
      t('ui.semester.summer'),
      t('ui.semester.fall'),
      t('ui.semester.winter'),
    ];

    return (
      <div className={classNames('section-content', 'section-content--taken-lectures')}>
        <Scroller expandTop={12}>
          <div className={classNames('title')}>
            {t('ui.title.takenLectures')}
          </div>
          <div className={classNames('scores')}>
            <div>
              <div>
                <span>{editableReviews.length}</span>
                <span>{`/${writableTakenLectures.length}`}</span>
              </div>
              <div>{t('ui.score.reviewsWritten')}</div>
            </div>
            <div>
              <div>
                {sum(editableReviews, (r) => r.like)}
              </div>
              <div>{t('ui.score.likes')}</div>
            </div>
          </div>
          {targetSemesters.length
            ? targetSemesters.map((s) => (
              <React.Fragment key={`${s.year}-${s.semester}`}>
                <div className={classNames('divider')} />
                <div className={classNames('small-title')}>
                  {`${s.year} ${semesterNames[s.semester]}`}
                </div>
                <div className={classNames('taken-lectures')}>

                  {writableTakenLectures
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
                            onClick={this.handleBlockClick(l)}
                          />
                        )
                        : (
                          <LectureSimpleBlock
                            key={l.id}
                            lecture={l}
                            isRaised={selectedLecture.id === l.id}
                            isDimmed={selectedLecture.id !== l.id}
                            hasReview={user.reviews.some((r) => (r.lecture.id === l.id))}
                            onClick={this.handleBlockClick(l)}
                          />
                        )
                    ))
                  }
                  <div className={classNames('taken-lectures__dummy')} />
                  <div className={classNames('taken-lectures__dummy')} />
                  <div className={classNames('taken-lectures__dummy')} />
                  <div className={classNames('taken-lectures__dummy')} />
                  <div className={classNames('taken-lectures__dummy')} />
                </div>
              </React.Fragment>
            ))
            : <div className={classNames('list-placeholder')}>{t('ui.placeholder.noResults')}</div>
          }
        </Scroller>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.common.user.user,
  selectedLecture: state.writeReviews.lectureSelected.lecture,
});

const mapDispatchToProps = (dispatch) => ({
  setLectureSelectedDispatch: (lecture) => {
    dispatch(setLectureSelected(lecture));
  },
  clearLectureSelectedDispatch: () => {
    dispatch(clearLectureSelected());
  },
});

TakenLecturesSection.propTypes = {
  user: userShape,
  selectedLecture: lectureShape,

  setLectureSelectedDispatch: PropTypes.func.isRequired,
  clearLectureSelectedDispatch: PropTypes.func.isRequired,
};


export default withTranslation()(connect(mapStateToProps, mapDispatchToProps)(TakenLecturesSection));
