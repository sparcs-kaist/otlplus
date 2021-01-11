import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import qs from 'qs';
import axios from 'axios';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';

import { setReviews } from '../../../actions/write-reviews/reviewsFocus';
import {
  NONE, LECTURE, LATEST, MY,
} from '../../../reducers/write-reviews/reviewsFocus';

import ReviewBlock from '../../blocks/ReviewBlock';

import reviewShape from '../../../shapes/ReviewShape';
import userShape from '../../../shapes/UserShape';
import reviewsFocusShape from '../../../shapes/ReviewsFocusShape';


class ReviewsSubSection extends Component {
  componentDidMount() {
    const { reviewsFocus } = this.props;

    if (reviewsFocus.from === LECTURE) {
      this._fetchLectureRelatedReviews();
    }
  }

  componentDidUpdate(prevProps) {
    const { reviewsFocus } = this.props;

    if (reviewsFocus.from === LECTURE
      && (prevProps.reviewsFocus.from !== LECTURE
        || prevProps.reviewsFocus.lecture.id !== reviewsFocus.lecture.id
      )
    ) {
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


  render() {
    const { t } = this.props;
    const {
      reviewsFocus,
      latestReviews,
      user,
    } = this.props;

    const mapReviewsToElement = (reviews) => {
      if (reviews == null) {
        return <div>{t('ui.placeholder.loading')}</div>;
      }
      if (reviews.length === 0) {
        return <div>{t('ui.placeholder.noResults')}</div>;
      }
      return reviews.map((r) => (
        <ReviewBlock review={r} shouldLimitLines={false} linkTo={{ pathname: '/dictionary', search: qs.stringify({ startCourseId: r.course.id }) }} pageFrom="Write Reviews" key={r.id} />
      ));
    };

    const title = reviewsFocus.from === LECTURE
      ? `${t('ui.title.relatedReviews')} - ${reviewsFocus.lecture[t('js.property.title')]}`
      : (reviewsFocus.from === MY
        ? t('ui.title.myReviews')
        : t('ui.title.latestReviews')
      );
    const reviews = reviewsFocus.from === LECTURE
      ? reviewsFocus.reviews
      : (reviewsFocus.from === MY
        ? user.reviews
        : latestReviews
      );

    return (
      <div className={classNames('section-content', 'section-content--latest-reviews')}>
        <div className={classNames('title')}>{title}</div>
        <div className={classNames('section-contentt--latest-reviews__list-area')}>
          {mapReviewsToElement(reviews)}
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  reviewsFocus: state.writeReviews.reviewsFocus,
  user: state.common.user.user,
  latestReviews: state.writeReviews.latestReviews.reviews,
});

const mapDispatchToProps = (dispatch) => ({
  setReviewsDispatch: (reviews) => {
    dispatch(setReviews(reviews));
  },
});

ReviewsSubSection.propTypes = {
  reviewsFocus: reviewsFocusShape.isRequired,
  user: userShape,
  latestReviews: PropTypes.arrayOf(reviewShape),

  setReviewsDispatch: PropTypes.func.isRequired,
};


export default withTranslation()(connect(mapStateToProps, mapDispatchToProps)(ReviewsSubSection));
