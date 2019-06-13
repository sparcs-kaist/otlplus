import React from 'react';
import { pure } from 'recompose';


const CourseSimpleBlock = (props) => {
  return (
      // eslint-disable-next-line react/jsx-indent
      <div className="block block--course-simple">
        <div className="block--course-simple__title">
          문제해결기법
        </div>
        <div className="block--course-simple__subtitle">
          CS202
        </div>
      </div>
  );
};


export default pure(CourseSimpleBlock);
