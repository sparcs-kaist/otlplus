import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { appBoundClassNames as classNames } from '../../common/boundClassNames';
import { getProfessorsShortStr } from '../../utils/lectureUtils';
import { getSingleScoreLabel } from '../../utils/scoreUtils';
import { getSemesterName } from '../../utils/semesterUtils';
import { performSubmitReview } from '../../common/commonOperations';

import lectureShape from '../../shapes/model/subject/LectureShape';
import reviewShape from '../../shapes/model/review/ReviewShape';


const ReviewWriteBlock = ({
  t,
  lecture, review,
  pageFrom,
  updateOnSubmit,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [content, setContent] = useState(review ? review.content : '');
  const [grade, setGrade] = useState(review ? review.grade : undefined);
  const [load, setLoad] = useState(review ? review.load : undefined);
  const [speech, setSpeech] = useState(review ? review.speech : undefined);

  const onContentChange = (e) => {
    setContent(e.target.value);
  };

  const onScoreChange = (e) => {
    const { name, value } = e.target;
    if (name === 'grade') {
      setGrade(Number(value));
    }
    else if (name === 'load') {
      setLoad(Number(value));
    }
    else if (name === 'speech') {
      setSpeech(Number(value));
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const beforeRequest = () => {
      setIsUploading(true);
    };
    const afterResponse = (newReview) => {
      setIsUploading(false);
      if (updateOnSubmit !== undefined) {
        updateOnSubmit(newReview, true);
      }
    };
    performSubmitReview(
      review,
      lecture, content, grade, speech, load,
      isUploading,
      `Page : ${pageFrom}`,
      beforeRequest, afterResponse,
    );
  };

  const hasChange = (
    !review
    || (content !== review.content)
    || (grade !== review.grade)
    || (load !== review.load)
    || (speech !== review.speech)
  );
  const getScoreOptionLabel = (name, value, checkedValue) => {
    const inputId = `${lecture.id}-${name}-${value}`;
    return (
      <label className={classNames('block--review-write__score__option')} htmlFor={inputId}>
        <input id={inputId} type="radio" name={name} value={`${value}`} checked={checkedValue === value} onChange={onScoreChange} />
        <span>{getSingleScoreLabel(value)}</span>
      </label>
    );
  };

  return (
    <form className={classNames('block', 'block--review-write')} onSubmit={onSubmit}>
      <div className={classNames('block--review-write__title')}>
        <strong>{lecture[t('js.property.title')]}</strong>
        <span>{getProfessorsShortStr(lecture)}</span>
        <span>{`${lecture.year} ${getSemesterName(lecture.semester)}`}</span>
      </div>
      <textarea className={classNames('block--review-write__content')} placeholder={t('ui.placeholder.reviewContent')} value={content} onChange={onContentChange} />
      <div>
        <div className={classNames('block--review-write__score')}>
          <span className={classNames('block--review-write__score__name')}>{t('ui.score.grade')}</span>
          {getScoreOptionLabel('grade', 5, grade)}
          {getScoreOptionLabel('grade', 4, grade)}
          {getScoreOptionLabel('grade', 3, grade)}
          {getScoreOptionLabel('grade', 2, grade)}
          {getScoreOptionLabel('grade', 1, grade)}
        </div>
        <div className={classNames('block--review-write__score')}>
          <span className={classNames('block--review-write__score__name')}>{t('ui.score.load')}</span>
          {getScoreOptionLabel('load', 5, load)}
          {getScoreOptionLabel('load', 4, load)}
          {getScoreOptionLabel('load', 3, load)}
          {getScoreOptionLabel('load', 2, load)}
          {getScoreOptionLabel('load', 1, load)}
        </div>
        <div className={classNames('block--review-write__score')}>
          <span className={classNames('block--review-write__score__name')}>{t('ui.score.speech')}</span>
          {getScoreOptionLabel('speech', 5, speech)}
          {getScoreOptionLabel('speech', 4, speech)}
          {getScoreOptionLabel('speech', 3, speech)}
          {getScoreOptionLabel('speech', 2, speech)}
          {getScoreOptionLabel('speech', 1, speech)}
        </div>
      </div>
      <div className={classNames('block--review-write__buttons')}>
        { hasChange
          ? (
            <button className={classNames('text-button', 'text-button--review-write-block')} type="submit">
              {review ? t('ui.button.edit') : t('ui.button.upload')}
            </button>
          )
          : (
            <button className={classNames('text-button', 'text-button--review-write-block', 'text-button--disabled')}>
              {review ? t('ui.button.edit') : t('ui.button.upload')}
            </button>
          )
        }
      </div>
    </form>
  );
};

ReviewWriteBlock.propTypes = {
  lecture: lectureShape.isRequired,
  review: reviewShape,
  pageFrom: PropTypes.string.isRequired,
  updateOnSubmit: PropTypes.func.isRequired,
};

export default withTranslation()(
  React.memo(
    ReviewWriteBlock
  )
);
