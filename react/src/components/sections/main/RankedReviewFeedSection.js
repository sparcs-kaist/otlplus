import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import qs from 'qs';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';

import ReviewBlock from '../../blocks/ReviewBlock';

import { getSemesterName } from '../../../utils/semesterUtils';

import { ReviewsFocusFrom } from '../../../reducers/write-reviews/reviewsFocus';

import reviewShape from '../../../shapes/model/review/ReviewShape';
import semesterShape from '../../../shapes/model/subject/SemesterShape';


class RankedReviewFeedSection extends Component {
  render() {
    const { t } = this.props;
    const { semester, reviews } = this.props;

    const semesterName = semester ? `${semester.year} ${getSemesterName(semester.semester)}` : t('ui.semester.all');

    return (
    // eslint-disable-next-line react/jsx-indent
    <div className={classNames('section', 'section--feed')}>
      <div className={classNames('subsection', 'subsection--feed')}>
        <div className={classNames('title')}>
          {`${t('ui.title.rankedReviews')} - ${semesterName}`}
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
            to={{ pathname: '/write-reviews', search: qs.stringify({ startList: ReviewsFocusFrom.REVIEWS_RANKED }) }}
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

RankedReviewFeedSection.propTypes = {
  semester: semesterShape,
  reviews: PropTypes.arrayOf(reviewShape).isRequired,
};


export default withTranslation()(
  RankedReviewFeedSection
);
