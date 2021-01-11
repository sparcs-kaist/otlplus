import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';

import ReviewWriteBlock from '../../blocks/ReviewWriteBlock';

import { updateUserReview } from '../../../actions/common/user';
import { updateReview } from '../../../actions/write-reviews/latestReviews';

import userShape from '../../../shapes/UserShape';
import lectureShape from '../../../shapes/LectureShape';


class ReviewWriteSubSection extends Component {
  updateOnReviewSubmit = (review, isNew) => {
    const { updateUserReviewDispatch, updateReviewDispatch } = this.props;
    updateUserReviewDispatch(review);
    updateReviewDispatch(review, isNew);
  }


  render() {
    const { t } = this.props;
    const { user, selectedLecture } = this.props;

    if (!selectedLecture || !user) {
      return null;
    }

    return (
      <>
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
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.common.user.user,
  selectedLecture: state.writeReviews.reviewsFocus.lecture,
});

const mapDispatchToProps = (dispatch) => ({
  updateUserReviewDispatch: (review) => {
    dispatch(updateUserReview(review));
  },
  updateReviewDispatch: (review, isNew) => {
    dispatch(updateReview(review, isNew));
  },
});

ReviewWriteSubSection.propTypes = {
  user: userShape,
  selectedLecture: lectureShape,

  updateUserReviewDispatch: PropTypes.func.isRequired,
  updateReviewDispatch: PropTypes.func.isRequired,
};


export default withTranslation()(connect(mapStateToProps, mapDispatchToProps)(ReviewWriteSubSection));
