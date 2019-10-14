import React from 'react';
import { pure } from 'recompose';

import { timetableBoundClassNames as classNames } from '../../common/boundClassNames';

import reviewShape from '../../shapes/ReviewShape';


const ReviewSimpleBlock = ({ review }) => {
  return (
      // eslint-disable-next-line react/jsx-indent
      <a href={`/review/result/comment/${review.id}`} target="_blank" rel="noopener noreferrer" style={{ display: 'block' }}>
        <div className={classNames('review-elem')}>
          <div className={classNames('review-body')}>
            {review.comment}
          </div>
          <div className={classNames('review-score-wrap')}>
            <span className={classNames('review-score')}>
              추천&nbsp;
              <strong>{review.like}</strong>
            </span>
            <span className={classNames('review-score')}>
              성적&nbsp;
              <strong>{review.grade_letter}</strong>
            </span>
            <span className={classNames('review-score')}>
              널널&nbsp;
              <strong>{review.load_letter}</strong>
            </span>
            <span className={classNames('review-score')}>
              강의&nbsp;
              <strong>{review.speech_letter}</strong>
            </span>
          </div>
        </div>
      </a>
  );
};

ReviewSimpleBlock.propTypes = {
  review: reviewShape.isRequired,
};

export default pure(ReviewSimpleBlock);
