import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';
import ReviewBlock from '../../blocks/ReviewBlock';
import reviewShape from '../../../shapes/ReviewShape';
import departmentShape from '../../../shapes/DepartmentShape';


class FamousReviewSection extends Component {
  render() {
    const { t } = this.props;
    const { department, reviews } = this.props;

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

FamousReviewSection.propTypes = {
  department: departmentShape.isRequired,
  reviews: PropTypes.arrayOf(reviewShape).isRequired,
};


export default withTranslation()(FamousReviewSection);
