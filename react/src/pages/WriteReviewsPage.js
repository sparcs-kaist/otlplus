import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { appBoundClassNames as classNames } from '../common/boundClassNames';

import TakenLecturesSection from '../components/sections/write-reviews/TakenLecturesSection';
import LectureReviewsSection from '../components/sections/write-reviews/LectureReviewsSection';
import LatestReviewsSection from '../components/sections/write-reviews/LatestReviewsSection';
import MyReviewsSection from '../components/sections/write-reviews/MyReviewsSection';
import LikedReviewsSection from '../components/sections/write-reviews/LikedReviewsSection';

import { reset as resetReviewsFocus, setReviewsFocus } from '../actions/write-reviews/reviewsFocus';
import { reset as resetLatestReviews } from '../actions/write-reviews/latestReviews';
import { reset as resetLikedReviews } from '../actions/write-reviews/likedReviews';
import { reset as resetRankedReviews } from '../actions/write-reviews/rankedReviews';
import {
  NONE, LECTURE, LATEST, MY, LIKED, RANKED,
} from '../reducers/write-reviews/reviewsFocus';

import reviewsFocusShape from '../shapes/ReviewsFocusShape';
import RankedReviewsSection from '../components/sections/write-reviews/RankedReviewsSection';


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
      if (focusFrom === LECTURE) {
        return <LectureReviewsSection />;
      }
      if (focusFrom === LATEST) {
        return <LatestReviewsSection />;
      }
      if (focusFrom === MY) {
        return <MyReviewsSection />;
      }
      if (focusFrom === LIKED) {
        return <LikedReviewsSection />;
      }
      if (focusFrom === RANKED) {
        return <RankedReviewsSection />;
      }
      return null;
    };

    const rightSectionPlaceholder = (
      <div className={classNames('section-content', 'section-content--flex', 'section-content--write-reviews-right')} ref={this.rightSectionRef}>
        <div className={classNames('close-button-wrap')}>
          <button onClick={this.unfix}>
            <i className={classNames('icon', 'icon--close-section')} />
          </button>
        </div>
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

    return (
      <>
        <section className={classNames('content', 'content--no-scroll')}>
          <div className={classNames('page-grid', 'page-grid--write-reviews')}>
            <div className={classNames('section', 'section--taken-lectures')}>
              <TakenLecturesSection />
            </div>
            <div className={classNames('section', 'section--write-reviews-right', 'section--mobile-modal', ((reviewsFocus.from !== NONE) ? '' : 'mobile-hidden'))}>
              {
                reviewsFocus.from === NONE
                  ? rightSectionPlaceholder
                  : getReviewsSubSection(reviewsFocus.from)
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
      startList: PropTypes.oneOf([NONE, LECTURE, LATEST, MY, LIKED, RANKED]),
    }),
  }).isRequired,

  reviewsFocus: reviewsFocusShape.isRequired,

  setReviewsFocusDispatch: PropTypes.func.isRequired,
  resetReviewsFocusDispatch: PropTypes.func.isRequired,
  resetLatestReviewsDispatch: PropTypes.func.isRequired,
  resetLikedReviewsDispatch: PropTypes.func.isRequired,
  resetRankedReviewsDispatch: PropTypes.func.isRequired,
};


export default withTranslation()(connect(mapStateToProps, mapDispatchToProps)(WriteReviewsPage));
