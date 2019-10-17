import React from 'react';
import PropTypes from 'prop-types';
import { pure } from 'recompose';

import { appBoundClassNames as classNames } from '../../common/boundClassNames';
import CourseShape from '../../shapes/CourseShape';


const CourseBlock = ({ course, isClicked, isHover, listHover, listOut, listClick }) => {
  return (
      // eslint-disable-next-line react/jsx-indent
      <div className={classNames('block', 'block--course', (isClicked ? classNames('block--clicked') : (isHover ? classNames('block--active') : '')))} onClick={() => listClick(course)()} onMouseOver={() => listHover(course)()} onMouseOut={() => listOut()}>
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
  isClicked: PropTypes.bool.isRequired,
  isHover: PropTypes.bool.isRequired,
  listHover: PropTypes.func.isRequired,
  listOut: PropTypes.func.isRequired,
  listClick: PropTypes.func.isRequired,
};


export default pure(CourseBlock);
