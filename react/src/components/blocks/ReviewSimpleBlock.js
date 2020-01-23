import React from 'react';
import { pure } from 'recompose';
import { Link } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import qs from 'qs';

import { appBoundClassNames as classNames } from '../../common/boundClassNames';

import reviewShape from '../../shapes/ReviewShape';


// eslint-disable-next-line arrow-body-style
const ReviewSimpleBlock = ({ t, review }) => {
  return (
    <Link to={{ pathname: '/dictionary', search: qs.stringify({ startCourseId: review.course.id }) }}>
      <div className={classNames('block', 'block--review-simple')}>
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
            <strong>{review.grade_letter}</strong>
          </span>
          <span>
            {t('ui.score.load')}
            &nbsp;
            <strong>{review.load_letter}</strong>
          </span>
          <span>
            {t('ui.score.speech')}
            &nbsp;
            <strong>{review.speech_letter}</strong>
          </span>
        </div>
      </div>
    </Link>
  );
};

ReviewSimpleBlock.propTypes = {
  review: reviewShape.isRequired,
};

export default withTranslation()(pure(ReviewSimpleBlock));
