import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import axios from 'axios';
import qs from 'qs';

import { appBoundClassNames as classNames } from '../../../../common/boundClassNames';

import Scroller from '../../../Scroller';
import CloseButton from '../../../CloseButton';
import Divider from '../../../Divider';
import ReviewWriteBlock from '../../../blocks/ReviewWriteBlock';
import ReviewBlock from '../../../blocks/ReviewBlock';

import { setReviews, clearReviewsFocus } from '../../../../actions/write-reviews/reviewsFocus';
import { updateUserReview } from '../../../../actions/common/user';
import { updateReview as UpdateLatestReview } from '../../../../actions/write-reviews/latestReviews';

import userShape from '../../../../shapes/model/session/UserShape';
import reviewsFocusShape from '../../../../shapes/state/write-reviews/ReviewsFocusShape';


class LectureReviewsSubSection extends Component {
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
        params: {
          order: ['-written_datetime', '-id'],
        },
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
          key={reviewsFocus.lecture.id}
          expandTop={12}
        >
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
          <Divider orientation={Divider.Orientation.HORIZONTAL} isVisible={true} />
          <div className={classNames('title')}>{`${t('ui.title.relatedReviews')} - ${reviewsFocus.lecture[t('js.property.title')]}`}</div>
          { reviewBlocksArea }
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

LectureReviewsSubSection.propTypes = {
  user: userShape,
  reviewsFocus: reviewsFocusShape.isRequired,

  setReviewsDispatch: PropTypes.func.isRequired,
  updateUserReviewDispatch: PropTypes.func.isRequired,
  UpdateLatestReviewDispatch: PropTypes.func.isRequired,
  clearReviewsFocusDispatch: PropTypes.func.isRequired,
};


export default withTranslation()(
  connect(mapStateToProps, mapDispatchToProps)(
    LectureReviewsSubSection
  )
);
