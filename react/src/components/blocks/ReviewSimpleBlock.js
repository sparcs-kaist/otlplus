import React from 'react';
import { Link } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import qs from 'qs';

import { appBoundClassNames as classNames } from '../../common/boundClassNames';
import { getSingleScoreLabel } from '../../common/scoreFunctions';

import reviewShape from '../../shapes/ReviewShape';


// eslint-disable-next-line arrow-body-style
const ReviewSimpleBlock = ({ t, review }) => {
  return (
    <Link
      to={{ pathname: '/dictionary', search: qs.stringify({ startCourseId: review.course.id }) }}
      className={classNames('block', 'block--review-simple')}
    >
      <div>
        {review.content}
      </div>
      <div>
        <span>
          {t('ui.score.likes')}
          &nbsp;
          <strong>{review.like}</strong>
        </span>
        <span>
          {t('ui.score.grade')}
          &nbsp;
          <strong>{getSingleScoreLabel(review.grade)}</strong>
        </span>
        <span>
          {t('ui.score.load')}
          &nbsp;
          <strong>{getSingleScoreLabel(review.load)}</strong>
        </span>
        <span>
          {t('ui.score.speech')}
          &nbsp;
          <strong>{getSingleScoreLabel(review.speech)}</strong>
        </span>
      </div>
    </Link>
  );
};

ReviewSimpleBlock.propTypes = {
  review: reviewShape.isRequired,
};

export default withTranslation()(React.memo(ReviewSimpleBlock));
