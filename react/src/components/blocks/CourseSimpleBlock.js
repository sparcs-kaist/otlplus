import React from 'react';
import { withTranslation } from 'react-i18next';

import { appBoundClassNames as classNames } from '../../common/boundClassNames';

import courseShape from '../../shapes/model/subject/CourseShape';


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
  course: courseShape.isRequired,
};


export default withTranslation()(
  React.memo(
    CourseSimpleBlock
  )
);
