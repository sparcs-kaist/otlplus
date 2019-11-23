import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';
import CourseBlock from '../../blocks/CourseBlock';
import courses from '../../../dummy/courses';


class RelatedCourseSection extends Component {
  render() {
    return (
      <div className={classNames('section-content', 'section-content--widget')}>
        <div className={classNames('title')}>
          연관 과목 - 데이타구조
        </div>
        { courses.map(c => (
          <Link to={{ pathname: '/dictionary', state: { startCourseId: c.id } }}>
            <CourseBlock course={c} key={c.id} />
          </Link>
        ))}
        <div className={classNames('buttons')}>
        <Link to={{ pathname: '/dictionary', state: { startCourseId: 746 } }}>
          <button className={classNames('text-button')}>
            자세히 보기
          </button>
        </Link>
        </div>
      </div>
    );
  }
}


export default RelatedCourseSection;
