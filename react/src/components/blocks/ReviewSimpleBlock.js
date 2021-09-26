import React from 'react';
import { Link } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import qs from 'qs';

import { appBoundClassNames as classNames } from '../../common/boundClassNames';
import { isSpecialLecture } from '../../utils/lectureUtils';
import { getSingleScoreLabel } from '../../utils/scoreUtils';
import { getSemesterName } from '../../utils/semesterUtils';

import reviewShape from '../../shapes/ReviewShape';


// eslint-disable-next-line arrow-body-style
const ReviewSimpleBlock = ({ t, review }) => {
  return (
    <Link
      to={{ pathname: '/dictionary', search: qs.stringify({ startCourseId: review.course.id }) }}
      className={classNames('block', 'block--review-simple')}
    >
      <div>
        <span>
          {`${review.lecture.year} ${getSemesterName(review.lecture.semester)}`}
        </span>
        {
          isSpecialLecture(review.lecture)
            ? <span>{review.lecture[t('js.property.class_title')]}</span>
            : null
        }
      </div>
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

export default withTranslation()(
  React.memo(
    ReviewSimpleBlock
  )
);
