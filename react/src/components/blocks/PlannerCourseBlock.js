import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { appBoundClassNames as classNames } from '../../common/boundClassNames';

import courseShape from '../../shapes/model/CourseShape';
import linkShape from '../../shapes/LinkShape';


const PlannerCourseBlock = ({
  t,
  course,
  isRaised, isDimmed,
  onMouseOver, onMouseOut, onClick,
  linkTo,
}) => {
  const handleMouseOver = onMouseOver
    ? (event) => {
      onMouseOver(course);
    }
    : null;
  const handleMouseOut = onMouseOut
    ? (event) => {
      onMouseOut(course);
    }
    : null;
  const handleClick = onClick
    ? (event) => {
      onClick(course);
    }
    : null;

  return (
    <div
      className={classNames(
        'block',
        'block--course-simple',
        (onClick ? 'block--clickable' : null),
        (isRaised ? 'block--raised' : null),
        (isDimmed ? 'block--dimmed' : null),
      )}
      onClick={handleClick}
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
      to={linkTo}
    >
      <div className={classNames('block--course-simple__title')}>
        { course[t('js.property.title')] }
      </div>
      <div className={classNames('block--course-simple__subtitle')}>
        { course.old_code }
      </div>
    </div>
  );
};

PlannerCourseBlock.propTypes = {
  course: courseShape.isRequired,
  isRaised: PropTypes.bool,
  isDimmed: PropTypes.bool,
  onMouseOver: PropTypes.func,
  onMouseOut: PropTypes.func,
  onClick: PropTypes.func,
  linkTo: linkShape,
};


export default withTranslation()(
  React.memo(
    PlannerCourseBlock
  )
);
