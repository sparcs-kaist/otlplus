import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import axios from 'axios';
import ReactGA from 'react-ga';

import { appBoundClassNames as classNames } from '../../common/boundClassNames';
import { getProfessorsStrShort } from '../../common/lectureFunctions';
import { getSingleScoreLabel } from '../../common/scoreFunctions';

import lectureShape from '../../shapes/NestedLectureShape';
import reviewShape from '../../shapes/ReviewShape';


// eslint-disable-next-line arrow-body-style
const ReviewWriteBlock = ({ t, lecture, review, pageFrom, updateOnSubmit }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [savedContent, setSavedContent] = useState(review ? review.content : '');
  const [savedGrade, setSavedGrade] = useState(review ? review.grade : undefined);
  const [savedLoad, setSavedLoad] = useState(review ? review.load : undefined);
  const [savedSpeech, setSavedSpeech] = useState(review ? review.speech : undefined);
  const [content, setContent] = useState(savedContent);
  const [grade, setGrade] = useState(savedGrade);
  const [load, setLoad] = useState(savedLoad);
  const [speech, setSpeech] = useState(savedSpeech);

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

    if (content.length === 0) {
      // eslint-disable-next-line no-alert
      alert(t('ui.message.emptyContent'));
      return;
    }
    if ((grade === undefined) || (load === undefined) || (speech === undefined)) {
      // eslint-disable-next-line no-alert
      alert(t('ui.message.scoreNotSelected'));
      return;
    }
    if (isUploading) {
      // eslint-disable-next-line no-alert
      alert(t('ui.message.alreadyUploading'));
      return;
    }

    setIsUploading(true);
    /* eslint-disable indent */
    if (!review) {
    axios.post(
      '/api/reviews',
      {
        lecture: lecture.id,
        content: content,
        grade: grade,
        speech: speech,
        load: load,
      },
      {
        metadata: {
          gaCategory: 'Review',
          gaVariable: 'POST / List',
        },
      },
    )
      .then((response) => {
        setSavedContent(content);
        setSavedGrade(grade);
        setSavedLoad(load);
        setSavedSpeech(speech);
        setIsUploading(false);
        if (updateOnSubmit !== undefined) {
          updateOnSubmit(response.data, true);
        }
      })
      .catch((error) => {
      });

    ReactGA.event({
      category: 'Review',
      action: 'Uploaded Review',
      label: `Lecture : ${lecture.id} / From : Page : ${pageFrom}`,
    });
    }
    else {
      axios.patch(
        `/api/reviews/${review.id}`,
        {
          content: content,
          grade: grade,
          speech: speech,
          load: load,
        },
        {
          metadata: {
            gaCategory: 'Review',
            gaVariable: 'POST / List',
          },
        },
      )
        .then((response) => {
          setSavedContent(content);
          setSavedGrade(grade);
          setSavedLoad(load);
          setSavedSpeech(speech);
          setIsUploading(false);
          if (updateOnSubmit !== undefined) {
            updateOnSubmit(response.data, false);
          }
        })
        .catch((error) => {
        });

      ReactGA.event({
        category: 'Review',
        action: 'Edited Review',
        label: `Lecture : ${lecture.id} / From : Page : ${pageFrom}`,
      });
    }
    /* eslint-enable indent */
  };

  const hasChange = (content !== savedContent)
    || (grade !== savedGrade)
    || (load !== savedLoad)
    || (speech !== savedSpeech);
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
        <span>{getProfessorsStrShort(lecture)}</span>
        <span>{`${lecture.year} ${[undefined, t('ui.semester.spring'), t('ui.semester.summer'), t('ui.semester.fall'), t('ui.semester.winter')][lecture.semester]}`}</span>
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

export default withTranslation()(React.memo(ReviewWriteBlock));
