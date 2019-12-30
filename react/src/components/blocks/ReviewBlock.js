import React from 'react';
import { pure } from 'recompose';
import { withTranslation } from 'react-i18next';

import { appBoundClassNames as classNames } from '../../common/boundClassNames';
import ReviewShape from '../../shapes/ReviewShape';


// eslint-disable-next-line arrow-body-style
const ReviewBlock = ({ t, review }) => {
  return (
    <div className={classNames('block', 'block--review')}>
      <div className={classNames('block--review__title')}>
        <strong>{review.lecture[t('js.property.title')]}</strong>
        <span>{review.lecture[t('js.property.professor_short')]}</span>
        <span>{`${review.lecture.year} ${['', t('ui.semester.spring'), t('ui.semester.summer'), t('ui.semester.fall'), t('ui.semester.winter')][review.lecture.semester]}`}</span>
      </div>
      <div className={classNames('block--review__content')}>
        {review.comment}
      </div>
      <div className={classNames('block--review__menus')}>
        <span>
        <span className={classNames('block--review__menus__score')}>
          {t('ui.score.likes')}
          &nbsp;
          <strong>{review.like}</strong>
        </span>
        <span className={classNames('block--review__menus__score')}>
          {t('ui.score.grade')}
          &nbsp;
          <strong>{review.grade_letter}</strong>
        </span>
        <span className={classNames('block--review__menus__score')}>
          {t('ui.score.load')}
          &nbsp;
          <strong>{review.load_letter}</strong>
        </span>
        <span className={classNames('block--review__menus__score')}>
          {t('ui.score.speech')}
          &nbsp;
          <strong>{review.speech_letter}</strong>
        </span>
        </span>
        <span>
        <button className={classNames('text-button', 'text-button--review-block')}>
          {t('ui.button.like')}
        </button>
        <button className={classNames('text-button', 'text-button--black', 'text-button--review-block')}>
          {t('ui.button.report')}
        </button>
        </span>
      </div>
    </div>
  );
};

ReviewBlock.propTypes = {
  review: ReviewShape.isRequired,
};


export default withTranslation()(pure(ReviewBlock));
