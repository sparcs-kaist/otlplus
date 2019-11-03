import React from 'react';
import { pure } from 'recompose';

import { appBoundClassNames as classNames } from '../../common/boundClassNames';
import lectureShape from '../../shapes/NestedLectureShape';


const ReviewWriteBlock = ({ lecture }) => {
  return (

    <form className={classNames('block', 'block--review-write')}>
      <div className={classNames('block--review-write__title')}>
        <strong>{lecture.title}</strong>
        <span>{lecture.professor_short}</span>
        <span>{`${lecture.year} ${[undefined, '봄', '여름', '가을', '겨울'][lecture.semester]}`}</span>
      </div>
      <textarea className={classNames('block--review-write__content')} placeholder="학점, 로드 등의 평가에 대하여 왜 그렇게 평가를 했는지 서술해주세요." />
      <div>
        <div className={classNames('block--review-write__score')}>
          <span className={classNames('block--review-write__score__name')}>성적</span>
          <label className={classNames('block--review-write__score__option')}>
            <input type="radio" name="grade" value="A" />
            <span>A</span>
          </label>
          <label className={classNames('block--review-write__score__option')}>
            <input type="radio" name="grade" value="B" />
            <span>B</span>
          </label>
          <label className={classNames('block--review-write__score__option')}>
            <input type="radio" name="grade" value="C" />
            <span>C</span>
          </label>
          <label className={classNames('block--review-write__score__option')}>
            <input type="radio" name="grade" value="D" />
            <span>D</span>
          </label>
          <label className={classNames('block--review-write__score__option')}>
            <input type="radio" name="grade" value="F" />
            <span>F</span>
          </label>
        </div> 
        <div className={classNames('block--review-write__score')}>
          <span className={classNames('block--review-write__score__name')}>널널</span>
          <label className={classNames('block--review-write__score__option')}>
            <input type="radio" name="load" value="A" />
            <span>A</span>
          </label>
          <label className={classNames('block--review-write__score__option')}>
            <input type="radio" name="load" value="B" />
            <span>B</span>
          </label>
          <label className={classNames('block--review-write__score__option')}>
            <input type="radio" name="load" value="C" />
            <span>C</span>
          </label>
          <label className={classNames('block--review-write__score__option')}>
            <input type="radio" name="load" value="D" />
            <span>D</span>
          </label>
          <label className={classNames('block--review-write__score__option')}>
            <input type="radio" name="load" value="F" />
            <span>F</span>
          </label>
        </div> 
        <div className={classNames('block--review-write__score')}>
          <span className={classNames('block--review-write__score__name')}>강의</span>
          <label className={classNames('block--review-write__score__option')}>
            <input type="radio" name="speech" value="B" />
            <span>B</span>
          </label>
          <label className={classNames('block--review-write__score__option')}>
            <input type="radio" name="speech" value="C" />
            <span>C</span>
          </label>
          <label className={classNames('block--review-write__score__option')}>
            <input type="radio" name="speech" value="A" />
            <span>A</span>
          </label>
          <label className={classNames('block--review-write__score__option')}>
            <input type="radio" name="speech" value="D" />
            <span>D</span>
          </label>
          <label className={classNames('block--review-write__score__option')}>
            <input type="radio" name="speech" value="F" />
            <span>F</span>
          </label>
        </div> 
      </div>
      <div className={classNames('block--review-write__buttons')}>
        <button className={classNames('text-button', 'text-button--review-write-block')} type="submit">
          업로드
        </button>
      </div>
    </form>
  );
};

ReviewWriteBlock.propTypes = {
  lecture: lectureShape.isRequired,
};

export default pure(ReviewWriteBlock);
