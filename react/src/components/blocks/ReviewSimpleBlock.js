import React from 'react';
import { pure } from 'recompose';
import { Link } from 'react-router-dom';

import { appBoundClassNames as classNames } from '../../common/boundClassNames';

import reviewShape from '../../shapes/ReviewShape';


// eslint-disable-next-line arrow-body-style
const ReviewSimpleBlock = ({ review }) => {
  return (
    <Link to={{ pathname: '/dictionary', state: { startCourseId: review.course.id } }}>
      <div className={classNames('block', 'block--review-simple')}>
        <div>
          {review.comment}
        </div>
        <div>
          <span>
            추천&nbsp;
            <strong>{review.like}</strong>
          </span>
          <span>
            성적&nbsp;
            <strong>{review.grade_letter}</strong>
          </span>
          <span>
            널널&nbsp;
            <strong>{review.load_letter}</strong>
          </span>
          <span>
            강의&nbsp;
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

export default pure(ReviewSimpleBlock);
