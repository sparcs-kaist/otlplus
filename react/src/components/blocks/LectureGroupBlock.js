import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { appBoundClassNames as classNames } from '../../common/boundClassNames';

import lectureShape from '../../shapes/model/subject/LectureShape';


const LectureGroupBlock = ({
  t,
  lectureGroup,
  isRaised, isDimmed, isTaken,
  children,
}) => {
  return (
    <div
      className={classNames(
        'block',
        'block--lecture-group',
        (isRaised ? 'block--raised' : null),
        (isDimmed ? 'block--dimmed' : null),
        (isTaken ? 'block--completed' : null),
      )}
    >
      <div className={classNames('block__completed-text')}>{t('ui.others.taken')}</div>
      <div className={classNames('block--lecture-group__title')}>
        <strong>{lectureGroup[0][t('js.property.common_title')]}</strong>
        {' '}
        {lectureGroup[0].old_code}
      </div>
      { children }
    </div>
  );
};

LectureGroupBlock.propTypes = {
  lectureGroup: PropTypes.arrayOf(lectureShape).isRequired,
  isRaised: PropTypes.bool.isRequired,
  isDimmed: PropTypes.bool.isRequired,
  isTaken: PropTypes.bool.isRequired,
};

export default withTranslation()(
  React.memo(
    LectureGroupBlock
  )
);
