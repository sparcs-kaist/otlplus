import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { appBoundClassNames as classNames } from '../../common/boundClassNames';
import { getProfessorsStr } from '../../common/courseFunctions';

import courseShape from '../../shapes/CourseShape';


// eslint-disable-next-line arrow-body-style
const CourseBlock = ({
  t,
  course,
  showReadStatus, isRead, isClicked, isFocused, isDimmed,
  listHover, listOut, listClick,
}) => {
  return (
    <div
      className={classNames(
        'block',
        'block--course',
        (isClicked ? 'block--clicked' : ''),
        ((isFocused && !isClicked) ? 'block--highlighted' : ''),
        (isDimmed ? 'block--dimmed' : ''),
      )}
      onClick={listClick ? listClick(course) : null}
      onMouseOver={listHover ? listHover(course) : null}
      onMouseOut={listOut}
    >
      <div className={classNames('block--course__title')}>
        { !showReadStatus
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
        <div className={classNames('attribute', 'attribute--semi-long')}>
          <div>{ t('ui.attribute.classification') }</div>
          <div>{ `${course.department[t('js.property.name')]}, ${course[t('js.property.type')]}` }</div>
        </div>
        <div className={classNames('attribute', 'attribute--semi-long')}>
          <div>{ t('ui.attribute.professors') }</div>
          <div>{ getProfessorsStr(course) }</div>
        </div>
        <div className={classNames('attribute', 'attribute--semi-long')}>
          <div>{ t('ui.attribute.description') }</div>
          <div>{ course.summary }</div>
        </div>
      </div>
    </div>
  );
};

CourseBlock.propTypes = {
  course: courseShape.isRequired,
  showReadStatus: PropTypes.bool,
  isRead: PropTypes.bool,
  isClicked: PropTypes.bool,
  isFocused: PropTypes.bool,
  isDimmed: PropTypes.bool,
  listHover: PropTypes.func,
  listOut: PropTypes.func,
  listClick: PropTypes.func,
};


export default withTranslation()(React.memo(CourseBlock));
