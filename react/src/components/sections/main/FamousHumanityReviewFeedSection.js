import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import qs from 'qs';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';

import { CourseListCode } from '../../../reducers/dictionary/list';

import ReviewBlock from '../../blocks/ReviewBlock';

import reviewShape from '../../../shapes/model/review/ReviewShape';


class FamousHumanityReviewFeedSection extends Component {
  render() {
    const { t } = this.props;
    const { reviews } = this.props;

    return (
    // eslint-disable-next-line react/jsx-indent
    <div className={classNames('section', 'section--feed')}>
      <div className={classNames('subsection', 'subsection--feed')}>
        <div className={classNames('title')}>
          {t('ui.title.famousHumanityReviews')}
        </div>
        <div className={classNames('block-list')}>
          {
            reviews.map((r) => (
              <ReviewBlock
                review={r}
                shouldLimitLines={true}
                linkTo={{ pathname: '/dictionary', search: qs.stringify({ startCourseId: r.course.id }) }}
                pageFrom="Main"
                key={r.id}
              />
            ))
          }
        </div>
        <div className={classNames('buttons')}>
          <Link
            to={{ pathname: '/dictionary', search: qs.stringify({ startTab: CourseListCode.HUMANITY }) }}
            className={classNames('text-button')}
          >
            {t('ui.button.seeMoreReviews')}
          </Link>
        </div>
      </div>
    </div>
    );
  }
}

FamousHumanityReviewFeedSection.propTypes = {
  reviews: PropTypes.arrayOf(reviewShape).isRequired,
};


export default withTranslation()(
  FamousHumanityReviewFeedSection
);
