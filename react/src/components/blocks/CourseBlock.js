import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { appBoundClassNames as classNames } from '../../common/boundClassNames';
import { getProfessorsFullStr } from '../../utils/courseUtils';

import courseShape from '../../shapes/CourseShape';


const CourseBlock = ({
  t,
  course,
  shouldShowReadStatus, isRead, isRaised, isHighlighted, isDimmed,
  listHover, listOut, listClick,
}) => {
  return (
    <div
      className={classNames(
        'block',
        'block--course',
        (isRaised ? 'block--raised' : ''),
        (isHighlighted ? 'block--highlighted' : ''),
        (isDimmed ? 'block--dimmed' : ''),
      )}
      onClick={listClick ? listClick(course) : null}
      onMouseOver={listHover ? listHover(course) : null}
      onMouseOut={listOut}
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
    </div>
  );
};

CourseBlock.propTypes = {
  course: courseShape.isRequired,
  shouldShowReadStatus: PropTypes.bool,
  isRead: PropTypes.bool,
  isRaised: PropTypes.bool,
  isHighlighted: PropTypes.bool,
  isDimmed: PropTypes.bool,
  listHover: PropTypes.func,
  listOut: PropTypes.func,
  listClick: PropTypes.func,
};


export default withTranslation()(
  React.memo(
    CourseBlock
  )
);
