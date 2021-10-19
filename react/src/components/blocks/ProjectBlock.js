import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { appBoundClassNames as classNames } from '../../common/boundClassNames';


const ProjectBlock = ({
  t,
  project,
  isRaised,
  onClick,
}) => {
  const handleClick = onClick
    ? (event) => {
      onClick(project);
    }
    : null;

  return (
    <div
      className={classNames(
        'block',
        'block--project',
        (onClick ? 'block--clickable' : null),
        (isRaised ? 'block--raised' : null),
      )}
      onClick={handleClick}
    >
      <div className={classNames('block--project__title')}>{project.mainTitle}</div>
      <div className={classNames('block--project__title')}>{project.subTitle}</div>
      <div className={classNames('block--project__content')}>{project.period}</div>
    </div>
  );
};


ProjectBlock.propTypes = {
  project: PropTypes.shape({
    index: PropTypes.number.isRequired,
    mainTitle: PropTypes.string.isRequired,
    subTitle: PropTypes.string.isRequired,
    period: PropTypes.string.isRequired,
  }).isRequired,
  onClick: PropTypes.func,
  isRaised: PropTypes.bool.isRequired,
};


export default withTranslation()(
  React.memo(
    ProjectBlock
  )
);
