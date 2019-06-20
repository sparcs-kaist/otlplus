import React from 'react';
import { pure } from 'recompose';

import CourseShape from '../../shapes/CourseShape';


const CourseSimpleBlock = ({ course }) => {
  return (
      // eslint-disable-next-line react/jsx-indent
      <div className="block block--course-simple">
        <div className="block--course-simple__title">
          { course.title }
        </div>
        <div className="block--course-simple__subtitle">
          { course.old_code }
        </div>
      </div>
  );
};

CourseSimpleBlock.propTypes = {
  course: CourseShape.isRequired,
};


export default pure(CourseSimpleBlock);
