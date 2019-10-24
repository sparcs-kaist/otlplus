import React from 'react';
import { pure } from 'recompose';

import { appBoundClassNames as classNames } from '../../common/boundClassNames';
import ReviewShape from '../../shapes/ReviewShape';


const ReviewBlock = ({ review }) => {
  return (
      // eslint-disable-next-line react/jsx-indent
      <div className={classNames('block', 'block--review')}>
        <div className={classNames('block--review__title')}>
          <strong>{review.lecture.title}</strong>
          <span>{review.lecture.professor_short}</span>
          <span>{`${review.lecture.year} ${['', '봄', '여름', '가을', '겨울'][review.lecture.semester]}`}</span>
        </div>
        <div className={classNames('block--review__content')}>
          {review.comment}
        </div>
        <div className={classNames('block--review__menus')}>
          <span className={classNames('block--review__menus__score')}>
            추천&nbsp;
            <strong>{review.like}</strong>
          </span>
          <span className={classNames('block--review__menus__score')}>
            성적&nbsp;
            <strong>{review.grade_letter}</strong>
          </span>
          <span className={classNames('block--review__menus__score')}>
            널널&nbsp;
            <strong>{review.load_letter}</strong>
          </span>
          <span className={classNames('block--review__menus__score')}>
            강의&nbsp;
            <strong>{review.speech_letter}</strong>
          </span>
          <button className={classNames('text-button', 'text-button--review-block')}>
            좋아요
          </button>
          <button className={classNames('text-button', 'text-button--black', 'text-button--review-block')}>
            신고하기
          </button>
        </div>
      </div>
  );
};

ReviewBlock.propTypes = {
  review: ReviewShape.isRequired,
};


export default pure(ReviewBlock);
