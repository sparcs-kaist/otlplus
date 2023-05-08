import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import ReactGA from 'react-ga';

import { appBoundClassNames as classNames } from '../../../../common/boundClassNames';

import { setReviewsFocus } from '../../../../actions/write-reviews/reviewsFocus';
import { ReviewsFocusFrom } from '../../../../reducers/write-reviews/reviewsFocus';

import userShape from '../../../../shapes/model/session/UserShape';
import reviewsFocusShape from '../../../../shapes/state/write-reviews/ReviewsFocusShape';


class ReviewsMenusSubSection extends Component {
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
    const { user, reviewsFocus } = this.props;

    return (
      <div className={classNames('subsection', 'subsection--reviews-menus')}>
        <div>
          <button
            className={classNames(
              'text-button',
              ((reviewsFocus.from === ReviewsFocusFrom.REVIEWS_LATEST) ? 'text-button--disabled' : null),
            )}
            onClick={this.handleMenuClick(ReviewsFocusFrom.REVIEWS_LATEST)}
          >
            {t('ui.title.latestReviews')}
          </button>
        </div>
        <div>
          <button
            className={classNames(
              'text-button',
              ((reviewsFocus.from === ReviewsFocusFrom.REVIEWS_RANKED) ? 'text-button--disabled' : null),
            )}
            onClick={this.handleMenuClick(ReviewsFocusFrom.REVIEWS_RANKED)}
          >
            {t('ui.title.rankedReviews')}
          </button>
        </div>
        <div>
          <button
            className={classNames(
              'text-button',
              ((!user || (reviewsFocus.from === ReviewsFocusFrom.REVIEWS_MY)) ? 'text-button--disabled' : null),
            )}
            onClick={this.handleMenuClick(ReviewsFocusFrom.REVIEWS_MY)}
          >
            {t('ui.title.myReviews')}
          </button>
        </div>
        <div>
          <button
            className={classNames(
              'text-button',
              ((!user || (reviewsFocus.from === ReviewsFocusFrom.REVIEWS_LIKED)) ? 'text-button--disabled' : null),
            )}
            onClick={this.handleMenuClick(ReviewsFocusFrom.REVIEWS_LIKED)}
          >
            {t('ui.title.likedReviews')}
          </button>
        </div>
      </div>
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
});

ReviewsMenusSubSection.propTypes = {
  user: userShape,
  reviewsFocus: reviewsFocusShape.isRequired,

  setReviewsFocusDispatch: PropTypes.func.isRequired,
};


export default withTranslation()(
  connect(mapStateToProps, mapDispatchToProps)(
    ReviewsMenusSubSection
  )
);
