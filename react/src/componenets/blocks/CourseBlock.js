import React from 'react';
import { pure } from 'recompose';

import CourseShape from '../../shapes/CourseShape';


const CourseBlock = (props) => {
  return (
      // eslint-disable-next-line react/jsx-indent
      <div className="block block--course">
        <div className="block--course__title">
          <strong>{ props.course.title }</strong>
            &nbsp;
          <span>{ props.course.old_code }</span>
        </div>
        <div className="attributes">
          <div>
            <div>
              분류
            </div>
            <div>
              {`${props.course.department.name}, ${props.course.type}`}
            </div>
          </div>
          <div>
            <div>
              교수
            </div>
            <div>
              {props.course.professors_str}
            </div>
          </div>
          <div>
            <div>
              설명
            </div>
            <div>
              {props.course.summary}
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
