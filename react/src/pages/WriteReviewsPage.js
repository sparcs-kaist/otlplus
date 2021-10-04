import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { appBoundClassNames as classNames } from '../common/boundClassNames';

import TakenLecturesSection from '../components/sections/write-reviews/TakenLecturesSection';
import LectureReviewsSubSection from '../components/sections/write-reviews/LectureReviewsSubSection';
import LatestReviewsSubSection from '../components/sections/write-reviews/LatestReviewsSubSection';
import MyReviewsSubSection from '../components/sections/write-reviews/MyReviewsSubSection';
import LikedReviewsSubSection from '../components/sections/write-reviews/LikedReviewsSubSection';
import RankedReviewsSubSection from '../components/sections/write-reviews/RankedReviewsSubSection';

import { reset as resetReviewsFocus, setReviewsFocus } from '../actions/write-reviews/reviewsFocus';
import { reset as resetLatestReviews } from '../actions/write-reviews/latestReviews';
import { reset as resetLikedReviews } from '../actions/write-reviews/likedReviews';
import { reset as resetRankedReviews } from '../actions/write-reviews/rankedReviews';
import { ReviewsFocusFrom } from '../reducers/write-reviews/reviewsFocus';

import reviewsFocusShape from '../shapes/ReviewsFocusShape';


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
    const { t, reviewsFocus } = this.props;

    const getReviewsSubSection = (focusFrom) => {
      if (focusFrom === ReviewsFocusFrom.NONE) {
        return (
          <div className={classNames('section-content', 'section-content--flex', 'section-content--write-reviews-right')}>
            <div className={classNames('otlplus-placeholder')}>
              <div>
                OTL PLUS
              </div>
              <div>
                <Link to="/credits/">{t('ui.menu.credit')}</Link>
                &nbsp;|&nbsp;
                <Link to="/licenses/">{t('ui.menu.licences')}</Link>
              </div>
              <div>
                <a href="mailto:otlplus@sparcs.org">otlplus@sparcs.org</a>
              </div>
              <div>
                © 2016,&nbsp;
                <a href="http://sparcs.org">SPARCS</a>
                &nbsp;OTL Team
              </div>
            </div>
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
            <TakenLecturesSection />
            <div className={classNames('section', 'section--write-reviews-right', 'section--mobile-modal', ((reviewsFocus.from !== ReviewsFocusFrom.NONE) ? '' : 'mobile-hidden'))}>
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
