import React from 'react';
import { pure } from 'recompose';

import ReviewShape from '../../shapes/ReviewShape';


const ReviewBlock = (props) => {
  return (
      // eslint-disable-next-line react/jsx-indent
      <div className="block block--review">
        <div className="block--review__title">
          <strong>{props.review.lecture.title}</strong>
          <span>{props.review.lecture.professor_short}</span>
          <span>{`${props.review.lecture.year} ${['', '봄', '여름', '가을', '겨울'][props.review.lecture.semester]}`}</span>
        </div>
        <div className="block--review__content">
          {props.review.comment}
        </div>
        <div className="block--review__menus">
          <span className="block--review__menus__score">
            추천&nbsp;
            <strong>{props.review.like}</strong>
          </span>
          <span className="block--review__menus__score">
            성적&nbsp;
            <strong>{props.review.grade_letter}</strong>
          </span>
          <span className="block--review__menus__score">
            널널&nbsp;
            <strong>{props.review.load_letter}</strong>
          </span>
          <span className="block--review__menus__score">
            강의&nbsp;
            <strong>{props.review.speech_letter}</strong>
          </span>
          <button className="text-button text-button--review-block">
            좋아요
          </button>
          <button className="text-button text-button--black text-button--review-block">
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
