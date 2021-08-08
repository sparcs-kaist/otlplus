import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import qs from 'qs';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';

import ReviewBlock from '../../blocks/ReviewBlock';

import { getSemesterName } from '../../../common/semesterFunctions';

import { RANKED } from '../../../reducers/write-reviews/reviewsFocus';

import reviewShape from '../../../shapes/ReviewShape';
import semesterShape from '../../../shapes/SemesterShape';


class RankedReviewFeedSection extends Component {
  render() {
    const { t } = this.props;
    const { semester, reviews } = this.props;

    const semesterName = semester ? `${semester.year} ${getSemesterName(semester.semester)}` : t('ui.semester.all');

    return (
      <div className={classNames('section-content', 'section-content--feed')}>
        <div className={classNames('title')}>
          {`${t('ui.title.rankedReviews')} - ${semesterName}`}
        </div>
        {reviews.map((r) => (
          <ReviewBlock
            review={r}
            shouldLimitLines={true}
            linkTo={{ pathname: '/dictionary', search: qs.stringify({ startCourseId: r.course.id }) }}
            pageFrom="Main"
            key={r.id}
          />
        ))}
        <div className={classNames('buttons')}>
          <Link
            to={{ pathname: '/write-reviews', search: qs.stringify({ startList: RANKED }) }}
            className={classNames('text-button')}
          >
            {t('ui.button.seeMoreReviews')}
          </Link>
        </div>
      </div>
    );
  }
}

RankedReviewFeedSection.propTypes = {
  semester: semesterShape,
  reviews: PropTypes.arrayOf(reviewShape).isRequired,
};


export default withTranslation()(RankedReviewFeedSection);
