import React from 'react';
import { pure } from 'recompose';
import { withTranslation } from 'react-i18next';

import { appBoundClassNames as classNames } from '../../common/boundClassNames';

import CourseShape from '../../shapes/CourseShape';


// eslint-disable-next-line arrow-body-style
const CourseSimpleBlock = ({ t, course }) => {
  return (
    <div className={classNames('block', 'block--course-simple')}>
      <div className={classNames('block--course-simple__title')}>
        { course[t('js.property.title')] }
      </div>
      <div className={classNames('block--course-simple__subtitle')}>
        { course.old_code }
      </div>
    </div>
  );
};

CourseSimpleBlock.propTypes = {
  course: CourseShape.isRequired,
};


export default withTranslation()(pure(CourseSimpleBlock));
