import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { appBoundClassNames as classNames } from '../../common/boundClassNames';
import { getProfessorsFullStr } from '../../utils/courseUtils';

import courseShape from '../../shapes/model/subject/CourseShape';
import linkShape from '../../shapes/LinkShape';
import Attributes from '../Attributes';


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
        (onClick ? 'block--clickable' : null),
        (isRaised ? 'block--raised' : null),
        (isDimmed ? 'block--dimmed' : null),
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
      <Attributes
        entries={[
          { name: t('ui.attribute.classification'), info: `${course.department[t('js.property.name')]}, ${course[t('js.property.type')]}` },
          { name: t('ui.attribute.professors'), info: getProfessorsFullStr(course) },
          { name: t('ui.attribute.description'), info: course.summary },
        ]}
        longInfo
      />
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
