import React from 'react';
import PropTypes from 'prop-types';
import { pure } from 'recompose';

import { appBoundClassNames as classNames } from '../../common/boundClassNames';
import CourseShape from '../../shapes/CourseShape';


const CourseBlock = ({ course, isClicked, isHover, isInactive, listHover, listOut, listClick }) => {
  return (
      // eslint-disable-next-line react/jsx-indent
      <div className={classNames('block', 'block--course', (isClicked ? classNames('block--clicked') : (isHover ? classNames('block--active') : (isInactive ? classNames('block--inactive') : ''))))} onClick={listClick ? listClick(course) : null} onMouseOver={listHover ? listHover(course) : null} onMouseOut={listOut}>
        <div className={classNames('block--course__title')}>
          <strong>{ course.title }</strong>
            &nbsp;
          <span>{ course.old_code }</span>
        </div>
        <div>
          <div className={classNames('attribute')}>
            <div>
              분류
            </div>
            <div>
              {`${course.department.name}, ${course.type}`}
            </div>
          </div>
          <div className={classNames('attribute')}>
            <div>
              교수
            </div>
            <div>
              {course.professors_str}
            </div>
          </div>
          <div className={classNames('attribute')}>
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
  isClicked: PropTypes.bool,
  isHover: PropTypes.bool,
  isInactive: PropTypes.bool,
  listHover: PropTypes.func,
  listOut: PropTypes.func,
  listClick: PropTypes.func,
};


export default pure(CourseBlock);
