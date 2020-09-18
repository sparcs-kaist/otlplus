import React from 'react';
import PropTypes from 'prop-types';
import { pure } from 'recompose';
import { withTranslation } from 'react-i18next';

import { appBoundClassNames as classNames } from '../../common/boundClassNames';

import lectureShape from '../../shapes/LectureShape';


// eslint-disable-next-line arrow-body-style
const LectureSimpleBlock = ({
  t,
  lecture,
  isClicked, isDimmed, hasReview,
  onClick,
}) => {
  return (
    <div
      className={classNames('block', 'block--lecture-simple', (isClicked ? 'block--clicked' : ''), (isDimmed ? 'block--dimmed' : ''), (hasReview ? 'block--has-review' : ''))}
      onClick={onClick}
    >
      <div className={classNames('block--lecture-simple__title')}>
        { lecture[t('js.property.title')] }
      </div>
      <div className={classNames('block--lecture-simple__subtitle')}>
        { lecture.old_code }
      </div>
    </div>
  );
};

LectureSimpleBlock.propTypes = {
  lecture: lectureShape.isRequired,
  isClicked: PropTypes.bool.isRequired,
  isDimmed: PropTypes.bool.isRequired,
  hasReview: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
};


export default withTranslation()(pure(LectureSimpleBlock));
