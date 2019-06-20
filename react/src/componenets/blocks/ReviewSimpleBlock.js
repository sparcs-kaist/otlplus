import React from 'react';
import { pure } from 'recompose';

import reviewShape from '../../shapes/ReviewShape';


const ReviewSimpleBlock = ({ review }) => {
  return (
      // eslint-disable-next-line react/jsx-indent
      <a href={`/review/result/comment/${review.id}`} target="_blank" rel="noopener noreferrer" style={{ display: 'block' }}>
        <div className="review-elem">
          <div className="review-body">
            {review.body}
          </div>
          <div className="review-score-wrap">
            <span className="review-score">
              추천&nbsp;
              <strong>{review.recommend}</strong>
            </span>
            <span className="review-score">
              성적&nbsp;
              <strong>{review.score_letter}</strong>
            </span>
            <span className="review-score">
              널널&nbsp;
              <strong>{review.load_letter}</strong>
            </span>
            <span className="review-score">
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
