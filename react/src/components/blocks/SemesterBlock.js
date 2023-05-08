import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { appBoundClassNames as classNames } from '../../common/boundClassNames';

import semesterShape from '../../shapes/model/subject/SemesterShape';

import { getSemesterName } from '../../utils/semesterUtils';


const SemesterBlock = ({
  t,
  semester,
  isRaised,
  onClick,
}) => {
  const handleClick = onClick
    ? (event) => {
      onClick(semester);
    }
    : null;

  const title = (semester === 'ALL')
    ? t('ui.semester.all')
    : `${semester.year} ${getSemesterName(semester.semester)}`;

  return (
    <div
      className={classNames(
        'block',
        'block--semester',
        (onClick ? 'block--clickable' : null),
        (isRaised ? 'block--raised' : null),
      )}
      onClick={handleClick}
    >
      <div className={classNames('block--semester__title')}>{ title }</div>
    </div>
  );
};


SemesterBlock.propTypes = {
  semester: PropTypes.oneOfType([semesterShape, PropTypes.oneOf(['ALL'])]).isRequired,
  isRaised: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
};


export default withTranslation()(
  React.memo(
    SemesterBlock
  )
);
