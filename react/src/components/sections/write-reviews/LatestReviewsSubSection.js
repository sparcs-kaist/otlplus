import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import qs from 'qs';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';

import ReviewBlock from '../../blocks/ReviewBlock';

import reviewShape from '../../../shapes/ReviewShape';


class LatestReviewsSubSection extends Component {
  render() {
    const { t } = this.props;
    const { reviews } = this.props;

    if (reviews.length === 0) {
      return (
        <div className={classNames('section-content', 'section-content--latest-reviews')}>
          <div className={classNames('title')}>{t('ui.title.latestReviews')}</div>
          <div className={classNames('list-placeholder')}>
            <div>{t('ui.placeholder.noResults')}</div>
          </div>
        </div>
      );
    }

    return (
      <div className={classNames('section-content', 'section-content--latest-reviews')}>
        <div className={classNames('title')}>{t('ui.title.latestReviews')}</div>
        <div className={classNames('section-contentt--latest-reviews__list-area')}>
          {reviews.map((r) => (
            <ReviewBlock review={r} shouldLimitLines={false} linkTo={{ pathname: '/dictionary', search: qs.stringify({ startCourseId: r.course.id }) }} pageFrom="Write Reviews" key={r.id} />
          ))}
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  reviews: state.writeReviews.latestReviews.reviews,
});

const mapDispatchToProps = (dispatch) => ({
});

LatestReviewsSubSection.propTypes = {
  reviews: PropTypes.arrayOf(reviewShape),
};


export default withTranslation()(connect(mapStateToProps, mapDispatchToProps)(LatestReviewsSubSection));
