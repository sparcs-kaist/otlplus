import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import axios from 'axios';
import ReactGA from 'react-ga';

import { appBoundClassNames as classNames } from '../../common/boundClassNames';
import { getProfessorsShortStr } from '../../utils/lectureUtils';
import { getSingleScoreLabel } from '../../utils/scoreUtils';

import reviewShape from '../../shapes/model/review/ReviewShape';
import linkShape from '../../shapes/LinkShape';

import { formatNewlineToBr } from '../../utils/commonUtils';
import { getSemesterName } from '../../utils/semesterUtils';
import { CONTACT } from '../../common/constants';


const ReviewBlock = ({
  t,
  review,
  shouldLimitLines, linkTo, pageFrom,
}) => {
  const [changedLikes, setChangedLikes] = useState(review.like);
  const [changedIsLiked, setChangedIsLiked] = useState(review.userspecific_is_liked);

  const onLikeClick = (e) => {
    e.stopPropagation();
    e.preventDefault();

    axios.post(
      `/api/reviews/${review.id}/like`,
      {
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
    alert(t('ui.message.reportUnderDevelopment', { contact: CONTACT }));

    ReactGA.event({
      category: 'Review',
      action: 'Reported Review',
      label: `Review : ${review.id} / From : Page : ${pageFrom}`,
    });
  };

  const RootTag = linkTo ? Link : 'div';

  const contentDisplay = formatNewlineToBr(review.content);

  return (
    <RootTag className={classNames('block', 'block--review')} to={linkTo}>
      <div className={classNames('block--review__title')}>
        <strong>{review.lecture[t('js.property.title')]}</strong>
        <span>{getProfessorsShortStr(review.lecture)}</span>
        <span>{`${review.lecture.year} ${getSemesterName(review.lecture.semester)}`}</span>
      </div>
      <div
        className={classNames(
          'block--review__content',
          (shouldLimitLines ? 'block--review__content--limit-5' : null),
        )}
      >
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
            <strong>{getSingleScoreLabel(review.grade)}</strong>
          </span>
          <span className={classNames('block--review__menus__score')}>
            {t('ui.score.load')}
            &nbsp;
            <strong>{getSingleScoreLabel(review.load)}</strong>
          </span>
          <span className={classNames('block--review__menus__score')}>
            {t('ui.score.speech')}
            &nbsp;
            <strong>{getSingleScoreLabel(review.speech)}</strong>
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
    </RootTag>
  );
};

ReviewBlock.propTypes = {
  review: reviewShape.isRequired,
  shouldLimitLines: PropTypes.bool.isRequired,
  linkTo: linkShape,
  pageFrom: PropTypes.string.isRequired,
};


export default withTranslation()(
  React.memo(
    ReviewBlock
  )
);
