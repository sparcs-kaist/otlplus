import React from 'react';
import PropTypes from 'prop-types';
import { pure } from 'recompose';
import { withTranslation } from 'react-i18next';

import { appBoundClassNames as classNames } from '../../common/boundClassNames';
import CourseShape from '../../shapes/CourseShape';


// eslint-disable-next-line arrow-body-style
const CourseBlock = ({ t, course, isClicked, isHover, isInactive, listHover, listOut, listClick }) => {
  return (
    <div className={classNames('block', 'block--course', (isClicked ? classNames('block--clicked') : (isHover ? classNames('block--active') : (isInactive ? classNames('block--inactive') : ''))))} onClick={listClick ? listClick(course) : null} onMouseOver={listHover ? listHover(course) : null} onMouseOut={listOut}>
      <div className={classNames('block--course__title')}>
        <strong>{ course.title }</strong>
        &nbsp;
        <span>{ course.old_code }</span>
      </div>
      <div>
        <div className={classNames('attribute')}>
          <div>
            {t('ui.attribute.classification')}
          </div>
          <div>
            {`${course.department[t('js.property.name')]}, ${course[t('js.property.type')]}`}
          </div>
        </div>
        <div className={classNames('attribute')}>
          <div>
            {t('ui.attribute.professor')}
          </div>
          <div>
            {course[t('js.property.professors_str')]}
          </div>
        </div>
        <div className={classNames('attribute')}>
          <div>
            {t('ui.attribute.description')}
          </div>
          <div>
            {course.summary}
          </div>
        </div>
      </div>
    </div>
  );
};

CourseBlock.propTypes = {
  course: CourseShape.isRequired,
  isClicked: PropTypes.bool,
  isHover: PropTypes.bool,
  isInactive: PropTypes.bool,
  listHover: PropTypes.func,
  listOut: PropTypes.func,
  listClick: PropTypes.func,
};


export default withTranslation()(pure(CourseBlock));
