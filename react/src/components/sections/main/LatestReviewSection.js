import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { withTranslation } from 'react-i18next';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';
import ReviewBlock from '../../blocks/ReviewBlock';
import reviews from '../../../dummy/reviews';


class LatestReviewSection extends Component {
  render() {
    const { t } = this.props;

    return (
      <div className={classNames('section-content', 'section-content--widget')}>
        <div className={classNames('title')}>
          {t('ui.title.latestReviews')}
        </div>
        {reviews.map(r => (
          <Link to={{ pathname: '/dictionary', state: { startCourseId: r.course.id } }}>
            <ReviewBlock review={r} key={r.id} />
          </Link>
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


export default withTranslation()(LatestReviewSection);
