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
import { NONE, LECTURE, LATEST, MY, LIKED, RANKED } from '../reducers/write-reviews/reviewsFocus';

import reviewsFocusShape from '../shapes/ReviewsFocusShape';
import userShape from '../shapes/UserShape';
import RankedReviewsSection from '../components/sections/write-reviews/RankedReviewsSection';


class WriteReviewsPage extends Component {
  componentDidMount() {
    const { setReviewsFocusDispatch } = this.props;
    const { startList } = this.props.location.state || {};

    if (startList) {
      setReviewsFocusDispatch(startList, null);
    }
  }


  componentWillUnmount() {
    const { resetReviewsFocusDispatch, resetLatestReviewsDispatch, resetLikedReviewsDispatch } = this.props;

    resetReviewsFocusDispatch();
    resetLatestReviewsDispatch();
    resetLikedReviewsDispatch();
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
          <div className={classNames('section-wrap', 'section-wrap--desktop-1v3--left', 'section-wrap--mobile-full')}>
            <div className={classNames('section')}>
              <TakenLecturesSection />
            </div>
          </div>
          <div
            className={classNames(
              'section-wrap',
              'section-wrap--desktop-1v3--right',
              'mobile-modal',
              ((reviewsFocus.from !== NONE) ? '' : 'mobile-hidden'),
            )}
          >
            <div className={classNames('section')}>
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
  user: state.common.user.user,
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
});

WriteReviewsPage.propTypes = {
  user: userShape,
  reviewsFocus: reviewsFocusShape.isRequired,

  setReviewsFocusDispatch: PropTypes.func.isRequired,
  resetReviewsFocusDispatch: PropTypes.func.isRequired,
  resetLatestReviewsDispatch: PropTypes.func.isRequired,
  resetLikedReviewsDispatch: PropTypes.func.isRequired,
};


export default withTranslation()(connect(mapStateToProps, mapDispatchToProps)(WriteReviewsPage));
