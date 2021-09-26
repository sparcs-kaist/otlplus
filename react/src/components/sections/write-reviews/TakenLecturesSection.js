import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import ReactGA from 'react-ga';
import { sumBy } from 'lodash';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';

import Divider from '../../Divider';
import Scroller from '../../Scroller';
import LectureSimpleBlock from '../../blocks/LectureSimpleBlock';

import { setReviewsFocus, clearReviewsFocus } from '../../../actions/write-reviews/reviewsFocus';
import {
  LECTURE, LATEST, MY, LIKED, RANKED,
} from '../../../reducers/write-reviews/reviewsFocus';

import { unique } from '../../../utils/commonUtils';
import { getSemesterName } from '../../../utils/semesterUtils';

import userShape from '../../../shapes/UserShape';
import lectureShape from '../../../shapes/LectureShape';
import reviewsFocusShape from '../../../shapes/ReviewsFocusShape';


class TakenLecturesSection extends Component {
  handleBlockClick = (lecture) => (e) => {
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
      setReviewsFocusDispatch(LECTURE, lecture);

      ReactGA.event({
        category: 'Write Reviews - Selection',
        action: 'Unelected Lecture',
        label: `Lecture : ${lecture.id}`,
      });
    }
  }


  handleMenuClick = (from) => (e) => {
    const {
      setReviewsFocusDispatch,
    } = this.props;

    setReviewsFocusDispatch(from, null);

    ReactGA.event({
      category: 'Write Reviews - Selection',
      action: 'Selected List',
      label: `List : ${from}`,
    });
  }


  render() {
    const { t } = this.props;
    const { user, selectedLecture, reviewsFocus } = this.props;

    if (!user) {
      return (
      // eslint-disable-next-line react/jsx-indent
      <div className={classNames('section', 'section--taken-lectures')}>
        <div className={classNames('section-content', 'section-content--taken-lectures')}>
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
          <Divider orientation={Divider.Orientation.HORIZONTAL} isVisible={true} />
          <Scroller expandTop={12}>
            <div className={classNames('list-placeholder')}>{t('ui.placeholder.loginRequired')}</div>
          </Scroller>
          <Divider orientation={Divider.Orientation.HORIZONTAL} isVisible={true} />
          <div className={classNames('section-content--taken-lectures__menus-list')}>
            <div>
              <button
                className={classNames(
                  'text-button',
                  ((reviewsFocus.from === LATEST) ? 'text-button--disabled' : ''),
                )}
                onClick={this.handleMenuClick(LATEST)}
              >
                {t('ui.title.latestReviews')}
              </button>
            </div>
            <div>
              <button
                className={classNames(
                  'text-button',
                  ((reviewsFocus.from === RANKED) ? 'text-button--disabled' : ''),
                )}
                onClick={this.handleMenuClick(RANKED)}
              >
                {t('ui.title.rankedReviews')}
              </button>
            </div>
            <div>
              <button
                className={classNames(
                  'text-button',
                  'text-button--disabled',
                )}
                onClick={this.handleMenuClick(MY)}
              >
                {t('ui.title.myReviews')}
              </button>
            </div>
            <div>
              <button
                className={classNames(
                  'text-button',
                  'text-button--disabled',
                )}
              >
                {t('ui.title.likedReviews')}
              </button>
            </div>
          </div>
        </div>
      </div>
      );
    }

    const writableTakenLectures = user.review_writable_lectures;
    const editableReviews = user.reviews
      .filter((r) => writableTakenLectures.some((l) => l.id === r.lecture.id));

    // eslint-disable-next-line fp/no-mutating-methods
    const targetSemesters = unique(
      writableTakenLectures.map((l) => ({ year: l.year, semester: l.semester })),
      (a, b) => ((a.year === b.year) && (a.semester === b.semester))
    )
      .sort((a, b) => ((a.year !== b.year) ? (b.year - a.year) : (b.semester - a.semester)));

    return (
    // eslint-disable-next-line react/jsx-indent
    <div className={classNames('section', 'section--taken-lectures')}>
      <div className={classNames('section-content', 'section-content--taken-lectures')}>
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
              {sumBy(editableReviews, (r) => r.like)}
            </div>
            <div>{t('ui.score.likes')}</div>
          </div>
        </div>
        <Divider orientation={Divider.Orientation.HORIZONTAL} isVisible={true} />
        <Scroller expandTop={12}>
          {targetSemesters.length
            ? targetSemesters.map((s, i) => (
              <React.Fragment key={`${s.year}-${s.semester}`}>
                { (i !== 0) ? <Divider orientation={Divider.Orientation.HORIZONTAL} isVisible={true} /> : null }
                <div className={classNames('small-title')}>
                  {`${s.year} ${getSemesterName(s.semester)}`}
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
                </div>
              </React.Fragment>
            ))
            : <div className={classNames('list-placeholder')}>{t('ui.placeholder.noResults')}</div>
          }
        </Scroller>
        <Divider orientation={Divider.Orientation.HORIZONTAL} isVisible={true} />
        <div className={classNames('section-content--taken-lectures__menus-list')}>
          <div>
            <button
              className={classNames(
                'text-button',
                ((reviewsFocus.from === LATEST) ? 'text-button--disabled' : ''),
              )}
              onClick={this.handleMenuClick(LATEST)}
            >
              {t('ui.title.latestReviews')}
            </button>
          </div>
          <div>
            <button
              className={classNames(
                'text-button',
                ((reviewsFocus.from === RANKED) ? 'text-button--disabled' : ''),
              )}
              onClick={this.handleMenuClick(RANKED)}
            >
              {t('ui.title.rankedReviews')}
            </button>
          </div>
          <div>
            <button
              className={classNames(
                'text-button',
                ((reviewsFocus.from === MY) ? 'text-button--disabled' : ''),
              )}
              onClick={this.handleMenuClick(MY)}
            >
              {t('ui.title.myReviews')}
            </button>
          </div>
          <div>
            <button
              className={classNames(
                'text-button',
                ((reviewsFocus.from === LIKED) ? 'text-button--disabled' : ''),
              )}
              onClick={this.handleMenuClick(LIKED)}
            >
              {t('ui.title.likedReviews')}
            </button>
          </div>
        </div>
      </div>
    </div>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.common.user.user,
  selectedLecture: state.writeReviews.reviewsFocus.lecture,
  reviewsFocus: state.writeReviews.reviewsFocus,
});

const mapDispatchToProps = (dispatch) => ({
  setReviewsFocusDispatch: (from, lecture) => {
    dispatch(setReviewsFocus(from, lecture));
  },
  clearReviewsFocusDispatch: () => {
    dispatch(clearReviewsFocus());
  },
});

TakenLecturesSection.propTypes = {
  user: userShape,
  selectedLecture: lectureShape,
  reviewsFocus: reviewsFocusShape.isRequired,

  setReviewsFocusDispatch: PropTypes.func.isRequired,
  clearReviewsFocusDispatch: PropTypes.func.isRequired,
};


export default withTranslation()(
  connect(mapStateToProps, mapDispatchToProps)(
    TakenLecturesSection
  )
);
