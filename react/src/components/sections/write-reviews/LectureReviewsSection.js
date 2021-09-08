import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import axios from 'axios';
import qs from 'qs';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';

import Scroller from '../../Scroller';
import ReviewWriteBlock from '../../blocks/ReviewWriteBlock';
import ReviewBlock from '../../blocks/ReviewBlock';

import { setReviews, clearReviewsFocus } from '../../../actions/write-reviews/reviewsFocus';
import { updateUserReview } from '../../../actions/common/user';
import { updateReview as UpdateLatestReview } from '../../../actions/write-reviews/latestReviews';

import userShape from '../../../shapes/UserShape';
import reviewsFocusShape from '../../../shapes/ReviewsFocusShape';


class LectureReviewsSection extends Component {
  componentDidMount() {
    this._fetchLectureRelatedReviews();
  }


  componentDidUpdate(prevProps) {
    const { reviewsFocus } = this.props;

    if (prevProps.reviewsFocus.lecture.id !== reviewsFocus.lecture.id) {
      this._fetchLectureRelatedReviews();
    }
  }


  _fetchLectureRelatedReviews = () => {
    const { reviewsFocus, setReviewsDispatch } = this.props;

    axios.get(
      `/api/lectures/${reviewsFocus.lecture.id}/related-reviews`,
      {
        metadata: {
          gaCategory: 'Course',
          gaVariable: 'GET Reviews / Instance',
        },
      },
    )
      .then((response) => {
        const newProps = this.props;
        if (!newProps.reviewsFocus.lecture
          || newProps.reviewsFocus.lecture.id !== reviewsFocus.lecture.id
        ) {
          return;
        }
        setReviewsDispatch(response.data);
      })
      .catch((error) => {
      });
  }


  updateOnReviewSubmit = (review, isNew) => {
    const { updateUserReviewDispatch, UpdateLatestReviewDispatch } = this.props;
    updateUserReviewDispatch(review);
    UpdateLatestReviewDispatch(review, isNew);
  }


  unfix = () => {
    const { clearReviewsFocusDispatch } = this.props;

    clearReviewsFocusDispatch();
  }


  render() {
    const { t } = this.props;
    const { user, reviewsFocus } = this.props;

    const selectedLecture = reviewsFocus.lecture;

    const reviews = reviewsFocus.reviews;
    const reviewBlocksArea = (reviews == null)
      ? <div className={classNames('section-content--latest-reviews__list-area', 'list-placeholder')}><div>{t('ui.placeholder.loading')}</div></div>
      : (reviews.length
        ? <div className={classNames('section-content--latest-reviews__list-area')}>{reviews.map((r) => <ReviewBlock review={r} shouldLimitLines={false} linkTo={{ pathname: '/dictionary', search: qs.stringify({ startCourseId: r.course.id }) }} pageFrom="Write Reviews" key={r.id} />)}</div>
        : <div className={classNames('section-content--latest-reviews__list-area', 'list-placeholder')}><div>{t('ui.placeholder.noResults')}</div></div>);

    return (
      <div className={classNames('section-content', 'section-content--flex', 'section-content--write-reviews-right')}>
        <div className={classNames('close-button-wrap')}>
          <button onClick={this.unfix}>
            <i className={classNames('icon', 'icon--close-section')} />
          </button>
        </div>
        <Scroller
          key={reviewsFocus.lecture.id}
          expandTop={12}
        >
          <div className={classNames('section-content', 'section-content--review-write')}>
            <div className={classNames('title')}>
              {`${t('ui.title.writeReview')} - ${selectedLecture[t('js.property.title')]}`}
            </div>
            <ReviewWriteBlock
              key={selectedLecture.id}
              lecture={selectedLecture}
              review={user.reviews.find((r) => (r.lecture.id === selectedLecture.id))}
              pageFrom="Write Reviews"
              updateOnSubmit={this.updateOnReviewSubmit}
            />
          </div>
          <div className={classNames('divider')} />
          <div className={classNames('section-content', 'section-content--latest-reviews')}>
            <div className={classNames('title')}>{`${t('ui.title.relatedReviews')} - ${reviewsFocus.lecture[t('js.property.title')]}`}</div>
            { reviewBlocksArea }
          </div>
        </Scroller>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.common.user.user,
  reviewsFocus: state.writeReviews.reviewsFocus,
});

const mapDispatchToProps = (dispatch) => ({
  setReviewsDispatch: (reviews) => {
    dispatch(setReviews(reviews));
  },
  updateUserReviewDispatch: (review) => {
    dispatch(updateUserReview(review));
  },
  UpdateLatestReviewDispatch: (review, isNew) => {
    dispatch(UpdateLatestReview(review, isNew));
  },
  clearReviewsFocusDispatch: () => {
    dispatch(clearReviewsFocus());
  },
});

LectureReviewsSection.propTypes = {
  user: userShape,
  reviewsFocus: reviewsFocusShape.isRequired,

  setReviewsDispatch: PropTypes.func.isRequired,
  updateUserReviewDispatch: PropTypes.func.isRequired,
  UpdateLatestReviewDispatch: PropTypes.func.isRequired,
  clearReviewsFocusDispatch: PropTypes.func.isRequired,
};


export default withTranslation()(connect(mapStateToProps, mapDispatchToProps)(LectureReviewsSection));