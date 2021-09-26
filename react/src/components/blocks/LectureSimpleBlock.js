import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { appBoundClassNames as classNames } from '../../common/boundClassNames';

import lectureShape from '../../shapes/LectureShape';


const LectureSimpleBlock = ({
  t,
  lecture,
  isRaised, isDimmed, hasReview,
  onClick,
// eslint-disable-next-line arrow-body-style
}) => {
  return (
    <div
      className={classNames(
        'block',
        'block--lecture-simple',
        (isRaised ? 'block--raised' : ''),
        (isDimmed ? 'block--dimmed' : ''),
        (hasReview ? 'block--completed' : ''),
      )}
      onClick={onClick}
    >
      <div className={classNames('block__completed-text')}>{t('ui.others.written')}</div>
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
  isRaised: PropTypes.bool.isRequired,
  isDimmed: PropTypes.bool.isRequired,
  hasReview: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
};


export default withTranslation()(
  React.memo(
    LectureSimpleBlock
  )
);
