import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';
import ReviewBlock from '../../blocks/ReviewBlock';
import reviewShape from '../../../shapes/ReviewShape';
import departmentShape from '../../../shapes/DepartmentShape';


class FamousMajorReviewSection extends Component {
  render() {
    const { t } = this.props;
    const { department, reviews } = this.props;

    return (
      <div className={classNames('section-content', 'section-content--widget')}>
        <div className={classNames('title')}>
          {`${t('ui.title.famousMajorReviews')} - ${department[t('js.property.name')]}`}
        </div>
        {reviews.map(r => (
          <Link to={{ pathname: '/dictionary', state: { startCourseId: r.course.id } }} key={r.id}>
            <ReviewBlock review={r} key={r.id} />
          </Link>
        ))}
        <div className={classNames('buttons')}>
          <Link to={{ pathname: '/dictionary', state: { startTab: department.code } }} className={classNames('text-button')}>
            {t('ui.button.seeMoreReviews')}
          </Link>
        </div>
      </div>
    );
  }
}

FamousMajorReviewSection.propTypes = {
  department: departmentShape.isRequired,
  reviews: PropTypes.arrayOf(reviewShape).isRequired,
};


export default withTranslation()(FamousMajorReviewSection);
