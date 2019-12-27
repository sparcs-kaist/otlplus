import React from 'react';
import { pure } from 'recompose';
import { withTranslation } from 'react-i18next';

import { appBoundClassNames as classNames } from '../../common/boundClassNames';
import lectureShape from '../../shapes/NestedLectureShape';


// eslint-disable-next-line arrow-body-style
const ReviewWriteBlock = ({ t, lecture }) => {
  return (
    <form className={classNames('block', 'block--review-write')}>
      <div className={classNames('block--review-write__title')}>
        <strong>{lecture[t('js.property.title')]}</strong>
        <span>{lecture[t('js.property.professor_short')]}</span>
        <span>{`${lecture.year} ${[undefined, t('ui.semester.spring'), t('ui.semester.summer'), t('ui.semester.fall'), t('ui.semester.winter')][lecture.semester]}`}</span>
      </div>
      <textarea className={classNames('block--review-write__content')} placeholder={t('ui.placeholder.reviewContent')} />
      <div>
        <div className={classNames('block--review-write__score')}>
          <span className={classNames('block--review-write__score__name')}>{t('ui.score.grade')}</span>
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
          <span className={classNames('block--review-write__score__name')}>{t('ui.score.load')}</span>
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
          <span className={classNames('block--review-write__score__name')}>{t('ui.score.speech')}</span>
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
          {t('ui.button.upload')}
        </button>
      </div>
    </form>
  );
};

ReviewWriteBlock.propTypes = {
  lecture: lectureShape.isRequired,
};

export default withTranslation()(pure(ReviewWriteBlock));
