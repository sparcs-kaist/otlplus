import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { pure } from 'recompose';
import { withTranslation } from 'react-i18next';
import ReactGA from 'react-ga';

import { appBoundClassNames as classNames } from '../../common/boundClassNames';
import axios from '../../common/presetAxios';
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
    axios.post(
      `/api/review/insert/${lecture.id}`,
      {
        content: content,
        gradescore: grade,
        speechscore: speech,
        loadscore: load,
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
          updateOnSubmit(response.data);
        }
      })
      .catch((error) => {
      });

    ReactGA.event({
      category: 'Review',
      action: !review ? 'Uploaded Review' : 'Edited Review',
      label: `Lecture : ${lecture.id} / From : Page : ${pageFrom}`,
    });
  };

  const hasChange = (content !== savedContent) || (grade !== savedGrade) || (load !== savedLoad) || (speech !== savedSpeech);

  return (
    <form className={classNames('block', 'block--review-write')} onSubmit={onSubmit}>
      <div className={classNames('block--review-write__title')}>
        <strong>{lecture[t('js.property.title')]}</strong>
        <span>{lecture[t('js.property.professors_str_short')]}</span>
        <span>{`${lecture.year} ${[undefined, t('ui.semester.spring'), t('ui.semester.summer'), t('ui.semester.fall'), t('ui.semester.winter')][lecture.semester]}`}</span>
      </div>
      <textarea className={classNames('block--review-write__content')} placeholder={t('ui.placeholder.reviewContent')} value={content} onChange={onContentChange} />
      <div>
        <div className={classNames('block--review-write__score')}>
          <span className={classNames('block--review-write__score__name')}>{t('ui.score.grade')}</span>
          <label className={classNames('block--review-write__score__option')}>
            <input type="radio" name="grade" value="5" checked={grade === 5} onChange={onScoreChange} />
            <span>A</span>
          </label>
          <label className={classNames('block--review-write__score__option')}>
            <input type="radio" name="grade" value="4" checked={grade === 4} onChange={onScoreChange} />
            <span>B</span>
          </label>
          <label className={classNames('block--review-write__score__option')}>
            <input type="radio" name="grade" value="3" checked={grade === 3} onChange={onScoreChange} />
            <span>C</span>
          </label>
          <label className={classNames('block--review-write__score__option')}>
            <input type="radio" name="grade" value="2" checked={grade === 2} onChange={onScoreChange} />
            <span>D</span>
          </label>
          <label className={classNames('block--review-write__score__option')}>
            <input type="radio" name="grade" value="1" checked={grade === 1} onChange={onScoreChange} />
            <span>F</span>
          </label>
        </div>
        <div className={classNames('block--review-write__score')}>
          <span className={classNames('block--review-write__score__name')}>{t('ui.score.load')}</span>
          <label className={classNames('block--review-write__score__option')}>
            <input type="radio" name="load" value="5" checked={load === 5} onChange={onScoreChange} />
            <span>A</span>
          </label>
          <label className={classNames('block--review-write__score__option')}>
            <input type="radio" name="load" value="4" checked={load === 4} onChange={onScoreChange} />
            <span>B</span>
          </label>
          <label className={classNames('block--review-write__score__option')}>
            <input type="radio" name="load" value="3" checked={load === 3} onChange={onScoreChange} />
            <span>C</span>
          </label>
          <label className={classNames('block--review-write__score__option')}>
            <input type="radio" name="load" value="2" checked={load === 2} onChange={onScoreChange} />
            <span>D</span>
          </label>
          <label className={classNames('block--review-write__score__option')}>
            <input type="radio" name="load" value="1" checked={load === 1} onChange={onScoreChange} />
            <span>F</span>
          </label>
        </div>
        <div className={classNames('block--review-write__score')}>
          <span className={classNames('block--review-write__score__name')}>{t('ui.score.speech')}</span>
          <label className={classNames('block--review-write__score__option')}>
            <input type="radio" name="speech" value="5" checked={speech === 5} onChange={onScoreChange} />
            <span>A</span>
          </label>
          <label className={classNames('block--review-write__score__option')}>
            <input type="radio" name="speech" value="4" checked={speech === 4} onChange={onScoreChange} />
            <span>B</span>
          </label>
          <label className={classNames('block--review-write__score__option')}>
            <input type="radio" name="speech" value="3" checked={speech === 3} onChange={onScoreChange} />
            <span>C</span>
          </label>
          <label className={classNames('block--review-write__score__option')}>
            <input type="radio" name="speech" value="2" checked={speech === 2} onChange={onScoreChange} />
            <span>D</span>
          </label>
          <label className={classNames('block--review-write__score__option')}>
            <input type="radio" name="speech" value="1" checked={speech === 1} onChange={onScoreChange} />
            <span>F</span>
          </label>
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

export default withTranslation()(pure(ReviewWriteBlock));
