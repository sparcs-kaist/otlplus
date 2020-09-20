import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import qs from 'qs';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';

import ReviewBlock from '../../blocks/ReviewBlock';

import reviewShape from '../../../shapes/ReviewShape';
import departmentShape from '../../../shapes/DepartmentShape';


class FamousMajorReviewFeedSection extends Component {
  render() {
    const { t } = this.props;
    const { department, reviews } = this.props;

    return (
      <div className={classNames('section-content', 'section-content--feed')}>
        <div className={classNames('title')}>
          {`${t('ui.title.famousMajorReviews')} - ${department[t('js.property.name')]}`}
        </div>
        {reviews.map((r) => (
          <ReviewBlock review={r} linkTo={{ pathname: '/dictionary', search: qs.stringify({ startCourseId: r.course.id }) }} pageFrom="Main" key={r.id} />
        ))}
        <div className={classNames('buttons')}>
          <Link to={{ pathname: '/dictionary', search: qs.stringify({ startTab: department.code }) }} className={classNames('text-button')}>
            {t('ui.button.seeMoreReviews')}
          </Link>
        </div>
      </div>
    );
  }
}

FamousMajorReviewFeedSection.propTypes = {
  department: departmentShape.isRequired,
  reviews: PropTypes.arrayOf(reviewShape).isRequired,
};


export default withTranslation()(FamousMajorReviewFeedSection);
