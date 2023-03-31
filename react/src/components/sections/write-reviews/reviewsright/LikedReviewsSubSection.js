import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import axios from 'axios';
import qs from 'qs';

import { appBoundClassNames as classNames } from '../../../../common/boundClassNames';

import Scroller from '../../../Scroller';
import CloseButton from '../../../CloseButton';
import ReviewBlock from '../../../blocks/ReviewBlock';

import { setReviews } from '../../../../actions/write-reviews/likedReviews';
import { clearReviewsFocus } from '../../../../actions/write-reviews/reviewsFocus';

import userShape from '../../../../shapes/model/session/UserShape';
import reviewsFocusShape from '../../../../shapes/state/write-reviews/ReviewsFocusShape';
import reviewShape from '../../../../shapes/model/review/ReviewShape';


class LikedReviewsSubSection extends Component {
  componentDidMount() {
    const { user, likedReviews } = this.props;

    if (user && !likedReviews) {
      this._fetchLikedReviews();
    }
  }


  componentDidUpdate(prevProps) {
    const { user, likedReviews } = this.props;

    if (user && !prevProps.user && !likedReviews) {
      this._fetchLikedReviews();
    }
  }


  _fetchLikedReviews = () => {
    const { user, setReviewsDispatch } = this.props;

    if (!user) {
      return;
    }

    axios.get(
      `/api/users/${user.id}/liked-reviews`,
      {
        params: {
          order: ['-written_datetime', '-id'],
        },
        metadata: {
          gaCategory: 'User',
          gaVariable: 'GET Liked Reviews / Instance',
        },
      },
    )
      .then((response) => {
        setReviewsDispatch(response.data);
      })
      .catch((error) => {
      });
  }


  unfix = () => {
    const { clearReviewsFocusDispatch } = this.props;

    clearReviewsFocusDispatch();
  }


  render() {
    const { t } = this.props;
    const { user, reviewsFocus, likedReviews } = this.props;

    if (!user) {
      return null;
    }

    const reviews = likedReviews;
    const reviewBlocksArea = (
      reviews == null
        ? (
          <div className={classNames('list-placeholder', 'min-height-area')}>
            <div>{t('ui.placeholder.loading')}</div>
          </div>
        )
        : (
          reviews.length
            ? (
              <div className={classNames('block-list', 'min-height-area')}>
                {
                  reviews.map((r) => (
                    <ReviewBlock
                      review={r}
                      shouldLimitLines={false}
                      linkTo={{ pathname: '/dictionary', search: qs.stringify({ startCourseId: r.course.id }) }}
                      pageFrom="Write Reviews"
                      key={r.id}
                    />
                  ))
                }
              </div>
            )
            : (
              <div className={classNames('list-placeholder', 'min-height-area')}>
                <div>{t('ui.placeholder.noResults')}</div>
              </div>
            )
        )
    );

    return (
      <div className={classNames('subsection', 'subsection--flex', 'subsection--various-reviews')}>
        <CloseButton onClick={this.unfix} />
        <Scroller
          key={reviewsFocus.from}
          expandTop={12}
        >
          <div className={classNames('title')}>{t('ui.title.likedReviews')}</div>
          { reviewBlocksArea }
        </Scroller>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.common.user.user,
  reviewsFocus: state.writeReviews.reviewsFocus,
  likedReviews: state.writeReviews.likedReviews.reviews,
});

const mapDispatchToProps = (dispatch) => ({
  setReviewsDispatch: (reviews) => {
    dispatch(setReviews(reviews));
  },
  clearReviewsFocusDispatch: () => {
    dispatch(clearReviewsFocus());
  },
});

LikedReviewsSubSection.propTypes = {
  user: userShape,
  reviewsFocus: reviewsFocusShape.isRequired,
  likedReviews: PropTypes.arrayOf(reviewShape),

  setReviewsDispatch: PropTypes.func.isRequired,
  clearReviewsFocusDispatch: PropTypes.func.isRequired,
};


export default withTranslation()(
  connect(mapStateToProps, mapDispatchToProps)(
    LikedReviewsSubSection
  )
);
