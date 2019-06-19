import React from 'react';
import { pure } from 'recompose';

import CourseShape from '../../shapes/CourseShape';


const CourseSimpleBlock = (props) => {
  return (
      // eslint-disable-next-line react/jsx-indent
      <div className="block block--course-simple">
        <div className="block--course-simple__title">
          { props.course.title }
        </div>
        <div className="block--course-simple__subtitle">
          { props.course.old_code }
        </div>
      </div>
  );
};

CourseSimpleBlock.propTypes = {
  course: CourseShape.isRequired,
};


export default pure(CourseSimpleBlock);
