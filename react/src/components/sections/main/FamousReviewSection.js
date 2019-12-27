import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { withTranslation } from 'react-i18next';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';
import ReviewBlock from '../../blocks/ReviewBlock';
import reviews from '../../../dummy/reviews';


class FamousReviewSection extends Component {
  render() {
    const { t } = this.props;
    const department = {
      name: '전산학부',
      name_en: 'School of Computing',
      code: 'CS',
    };

    return (
      <div className={classNames('section-content', 'section-content--widget')}>
        <div className={classNames('title')}>
          {`${t('ui.title.famousReviews')} - ${department[t('js.property.name')]}`}
        </div>
        {reviews.map(r => (
          <Link to={{ pathname: '/dictionary', state: { startCourseId: r.course.id } }}>
            <ReviewBlock review={r} key={r.id} />
          </Link>
        ))}
        <div className={classNames('buttons')}>
          <Link to={{ pathname: '/dictionary', state: { startTab: 'CS' } }} className={classNames('text-button')}>
            {t('ui.button.seeMoreReviews')}
          </Link>
        </div>
      </div>
    );
  }
}


export default withTranslation()(FamousReviewSection);
