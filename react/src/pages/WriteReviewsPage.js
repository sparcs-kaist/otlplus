import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { appBoundClassNames as classNames } from '../common/boundClassNames';

import Divider from '../components/Divider';
import MySummarySubSection from '../components/sections/write-reviews/reviewsleft/MySummarySubSection';
import TakenLecturesSubSection from '../components/sections/write-reviews/reviewsleft/TakenLecturesSubSection';
import ReviewsMenusSubSection from '../components/sections/write-reviews/reviewsleft/ReviewsMenusSubSection';
import LectureReviewsSubSection from '../components/sections/write-reviews/reviewsright/LectureReviewsSubSection';
import LatestReviewsSubSection from '../components/sections/write-reviews/reviewsright/LatestReviewsSubSection';
import MyReviewsSubSection from '../components/sections/write-reviews/reviewsright/MyReviewsSubSection';
import LikedReviewsSubSection from '../components/sections/write-reviews/reviewsright/LikedReviewsSubSection';
import RankedReviewsSubSection from '../components/sections/write-reviews/reviewsright/RankedReviewsSubSection';

import { reset as resetReviewsFocus, setReviewsFocus } from '../actions/write-reviews/reviewsFocus';
import { reset as resetLatestReviews } from '../actions/write-reviews/latestReviews';
import { reset as resetLikedReviews } from '../actions/write-reviews/likedReviews';
import { reset as resetRankedReviews } from '../actions/write-reviews/rankedReviews';
import { ReviewsFocusFrom } from '../reducers/write-reviews/reviewsFocus';

import reviewsFocusShape from '../shapes/state/write-reviews/ReviewsFocusShape';
import OtlplusPlaceholder from '../components/OtlplusPlaceholder';


class WriteReviewsPage extends Component {
  componentDidMount() {
    const { setReviewsFocusDispatch } = this.props;
    // eslint-disable-next-line react/destructuring-assignment
    const { startList } = this.props.location.state || {};

    if (startList) {
      setReviewsFocusDispatch(startList, null);
    }
  }


  componentWillUnmount() {
    const {
      resetReviewsFocusDispatch, resetLatestReviewsDispatch,
      resetLikedReviewsDispatch, resetRankedReviewsDispatch,
    } = this.props;

    resetReviewsFocusDispatch();
    resetLatestReviewsDispatch();
    resetLikedReviewsDispatch();
    resetRankedReviewsDispatch();
  }


  render() {
    const { reviewsFocus } = this.props;

    const getReviewsSubSection = (focusFrom) => {
      if (focusFrom === ReviewsFocusFrom.NONE) {
        return (
          <div className={classNames('subsection', 'subsection--flex', 'subsection--write-reviews-right')}>
            <OtlplusPlaceholder />
          </div>
        );
      }
      if (focusFrom === ReviewsFocusFrom.LECTURE) {
        return <LectureReviewsSubSection />;
      }
      if (focusFrom === ReviewsFocusFrom.REVIEWS_LATEST) {
        return <LatestReviewsSubSection />;
      }
      if (focusFrom === ReviewsFocusFrom.REVIEWS_MY) {
        return <MyReviewsSubSection />;
      }
      if (focusFrom === ReviewsFocusFrom.REVIEWS_LIKED) {
        return <LikedReviewsSubSection />;
      }
      if (focusFrom === ReviewsFocusFrom.REVIEWS_RANKED) {
        return <RankedReviewsSubSection />;
      }
      return null;
    };

    return (
      <>
        <section className={classNames('content', 'content--no-scroll')}>
          <div className={classNames('page-grid', 'page-grid--write-reviews')}>
            <div className={classNames('section', 'section--write-reviews-left')}>
              <MySummarySubSection />
              <Divider orientation={Divider.Orientation.HORIZONTAL} isVisible={true} />
              <TakenLecturesSubSection />
              <Divider orientation={Divider.Orientation.HORIZONTAL} isVisible={true} />
              <ReviewsMenusSubSection />
            </div>
            <div
              className={classNames(
                'section',
                'section--write-reviews-right',
                'section--mobile-modal',
                ((reviewsFocus.from !== ReviewsFocusFrom.NONE) ? null : 'mobile-hidden'),
              )}
            >
              {
                getReviewsSubSection(reviewsFocus.from)
              }
            </div>
          </div>
        </section>
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  reviewsFocus: state.writeReviews.reviewsFocus,
});

const mapDispatchToProps = (dispatch) => ({
  setReviewsFocusDispatch: (from, lecture) => {
    dispatch(setReviewsFocus(from, lecture));
  },
  resetReviewsFocusDispatch: () => {
    dispatch(resetReviewsFocus());
  },
  resetLatestReviewsDispatch: () => {
    dispatch(resetLatestReviews());
  },
  resetLikedReviewsDispatch: () => {
    dispatch(resetLikedReviews());
  },
  resetRankedReviewsDispatch: () => {
    dispatch(resetRankedReviews());
  },
});

WriteReviewsPage.propTypes = {
  location: PropTypes.shape({
    state: PropTypes.shape({
      startList: PropTypes.oneOf(Object.values(ReviewsFocusFrom)),
    }),
  }).isRequired,

  reviewsFocus: reviewsFocusShape.isRequired,

  setReviewsFocusDispatch: PropTypes.func.isRequired,
  resetReviewsFocusDispatch: PropTypes.func.isRequired,
  resetLatestReviewsDispatch: PropTypes.func.isRequired,
  resetLikedReviewsDispatch: PropTypes.func.isRequired,
  resetRankedReviewsDispatch: PropTypes.func.isRequired,
};


export default withTranslation()(
  connect(mapStateToProps, mapDispatchToProps)(
    WriteReviewsPage
  )
);
