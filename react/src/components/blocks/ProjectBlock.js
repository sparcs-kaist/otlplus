import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { appBoundClassNames as classNames } from '../../common/boundClassNames';


const ProjectBlock = ({
  t,
  index,
  isRaised,
  onClick,
  mainTitle, subTitle, period,
}) => {
  return (
    <div
      className={classNames(
        'block',
        'block--project',
        (isRaised ? 'block--raised' : ''),
      )}
      onClick={() => onClick(index)}
      key={index}
    >
      <div className={classNames('block--project__title')}>{mainTitle}</div>
      <div className={classNames('block--project__title')}>{subTitle}</div>
      <div className={classNames('block--project__content')}>{period}</div>
    </div>
  );
};


ProjectBlock.propTypes = {
  index: PropTypes.number.isRequired,
  onClick: PropTypes.func.isRequired,
  isRaised: PropTypes.bool.isRequired,
  mainTitle: PropTypes.string.isRequired,
  subTitle: PropTypes.string.isRequired,
  period: PropTypes.string.isRequired,
};


export default withTranslation()(
  React.memo(
    ProjectBlock
  )
);
