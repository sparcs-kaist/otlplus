import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import qs from 'qs';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';

import ReviewBlock from '../../blocks/ReviewBlock';

import reviews from '../../../dummy/reviews';


class LatestReviewFeedSection extends Component {
  render() {
    const { t } = this.props;

    return (
      <div className={classNames('section-content', 'section-content--feed')}>
        <div className={classNames('title')}>
          {t('ui.title.latestReviews')}
        </div>
        {reviews.map((r) => (
          <ReviewBlock review={r} shouldLimitLines={true} linkTo={{ pathname: '/dictionary', search: qs.stringify({ startCourseId: r.course.id }) }} pageFrom="Main" key={r.id} />
        ))}
        <div className={classNames('buttons')}>
          <button className={classNames('text-button')}>
            {t('ui.button.seeMoreReviews')}
          </button>
        </div>
      </div>
    );
  }
}


export default withTranslation()(LatestReviewFeedSection);
