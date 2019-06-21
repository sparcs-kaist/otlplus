import React from 'react';
import { pure } from 'recompose';

import { appBoundClassNames as classNames } from '../../common/boundClassNames';
import CourseShape from '../../shapes/CourseShape';


const CourseBlock = ({ course }) => {
  return (
      // eslint-disable-next-line react/jsx-indent
      <div className={classNames('block', 'block--course')}>
        <div className={classNames('block--course__title')}>
          <strong>{ course.title }</strong>
            &nbsp;
          <span>{ course.old_code }</span>
        </div>
        <div className={classNames('attributes')}>
          <div>
            <div>
              분류
            </div>
            <div>
              {`${course.department.name}, ${course.type}`}
            </div>
          </div>
          <div>
            <div>
              교수
            </div>
            <div>
              {course.professors_str}
            </div>
          </div>
          <div>
            <div>
              설명
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
};


export default pure(CourseBlock);
