import React from 'react';
import { pure } from 'recompose';

import { appBoundClassNames as classNames } from '../../common/boundClassNames';
import CourseShape from '../../shapes/CourseShape';


const CourseSimpleBlock = ({ course }) => {
  return (
    <div className={classNames('block', 'block--course-simple')}>
      <div className={classNames('block--course-simple__title')}>
        { course.title }
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


export default pure(CourseSimpleBlock);
