import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { pure } from 'recompose';
import { withTranslation } from 'react-i18next';
import ReactGA from 'react-ga';

import { appBoundClassNames as classNames } from '../../common/boundClassNames';
import axios from '../../common/presetAxios';

import reviewShape from '../../shapes/ReviewShape';


// eslint-disable-next-line arrow-body-style
const ReviewBlock = ({ t, review, pageFrom }) => {
  const [changedLikes, setChangedLikes] = useState(review.like);
  const [changedIsLiked, setChangedIsLiked] = useState(review.userspecific_is_liked);

  const onLikeClick = (e) => {
    e.stopPropagation();
    e.preventDefault();

    axios.post(
      '/api/review/like',
      {
        reviewid: review.id,
      },
      {
        metadata: {
          gaCategory: 'Review',
          gaVariable: 'POST Like / Instance',
        },
      },
    )
      .then((response) => {
        setChangedLikes(changedLikes + 1);
        setChangedIsLiked(true);
      })
      .catch((error) => {
      });

    ReactGA.event({
      category: 'Review',
      action: 'Liked Review',
      label: `Review : ${review.id} / From : Page : ${pageFrom}`,
    });
  };

  const onReportClick = (e) => {
    e.stopPropagation();
    e.preventDefault();

    // eslint-disable-next-line no-alert
    alert(t('ui.message.reportUnderDevelopment'));

    ReactGA.event({
      category: 'Review',
      action: 'Reported Review',
      label: `Review : ${review.id} / From : Page : ${pageFrom}`,
    });
  };

  const contentLines = review.content.split('\n');
  const contentDisplay = contentLines
    .map((l, i) => ({
      key: i,
      content: l,
    })) // Workaround key error
    .map((l, i) => (
      (i === contentLines.length - 1)
        ? (
          <React.Fragment key={l.key}>
            {l.content}
          </React.Fragment>
        )
        : (
          <React.Fragment key={l.key}>
            {l.content}
            <br />
          </React.Fragment>
        )
    ));

  return (
    <div className={classNames('block', 'block--review')}>
      <div className={classNames('block--review__title')}>
        <strong>{review.lecture[t('js.property.title')]}</strong>
        <span>{review.lecture[t('js.property.professors_str_short')]}</span>
        <span>{`${review.lecture.year} ${['', t('ui.semester.spring'), t('ui.semester.summer'), t('ui.semester.fall'), t('ui.semester.winter')][review.lecture.semester]}`}</span>
      </div>
      <div className={classNames('block--review__content')}>
        {contentDisplay}
      </div>
      <div className={classNames('block--review__menus')}>
        <span>
          <span className={classNames('block--review__menus__score')}>
            {t('ui.score.likes')}
            &nbsp;
            <strong>{changedLikes}</strong>
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
          {!changedIsLiked
            ? (
              <button className={classNames('text-button', 'text-button--review-block')} onClick={onLikeClick}>
                {t('ui.button.like')}
              </button>
            )
            : (
              <button className={classNames('text-button', 'text-button--disabled', 'text-button--review-block')}>
                {t('ui.button.like')}
              </button>
            )}
          <button className={classNames('text-button', 'text-button--black', 'text-button--review-block')} onClick={onReportClick}>
            {t('ui.button.report')}
          </button>
        </span>
      </div>
    </div>
  );
};

ReviewBlock.propTypes = {
  review: reviewShape.isRequired,
  pageFrom: PropTypes.string.isRequired,
};


export default withTranslation()(pure(ReviewBlock));
