import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { appBoundClassNames as classNames } from '../../common/boundClassNames';
import { getProfessorsFullStr } from '../../utils/courseUtils';

import courseShape from '../../shapes/CourseShape';
import linkShape from '../../shapes/LinkShape';


const CourseBlock = ({
  t,
  course,
  shouldShowReadStatus, isRead, isRaised, isDimmed,
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

  const RootTag = linkTo ? Link : 'div';

  return (
    <RootTag
      className={classNames(
        'block',
        'block--course',
        (onClick ? 'block--clickable' : ''),
        (isRaised ? 'block--raised' : ''),
        (isDimmed ? 'block--dimmed' : ''),
      )}
      onClick={handleClick}
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
      to={linkTo}
    >
      <div className={classNames('block--course__title')}>
        { !shouldShowReadStatus
          ? null
          : (isRead
            ? <i className={classNames('icon', 'icon--status-read')} />
            : <i className={classNames('icon', 'icon--status-unread')} />
          )
        }
        <strong>{ course[t('js.property.title')] }</strong>
        &nbsp;
        <span>{ course.old_code }</span>
      </div>
      <div>
        <div className={classNames('attribute', 'attribute--long-info')}>
          <div>{ t('ui.attribute.classification') }</div>
          <div>{ `${course.department[t('js.property.name')]}, ${course[t('js.property.type')]}` }</div>
        </div>
        <div className={classNames('attribute', 'attribute--long-info')}>
          <div>{ t('ui.attribute.professors') }</div>
          <div>{ getProfessorsFullStr(course) }</div>
        </div>
        <div className={classNames('attribute', 'attribute--long-info')}>
          <div>{ t('ui.attribute.description') }</div>
          <div>{ course.summary }</div>
        </div>
      </div>
    </RootTag>
  );
};

CourseBlock.propTypes = {
  course: courseShape.isRequired,
  shouldShowReadStatus: PropTypes.bool,
  isRead: PropTypes.bool,
  isRaised: PropTypes.bool,
  isDimmed: PropTypes.bool,
  onMouseOver: PropTypes.func,
  onMouseOut: PropTypes.func,
  onClick: PropTypes.func,
  linkTo: linkShape,
};


export default withTranslation()(
  React.memo(
    CourseBlock
  )
);
