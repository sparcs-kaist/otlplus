import React, { Component } from 'react';

import CourseBlock from '../../blocks/CourseBlock';
import courses from '../../../dummy/courses';


class RelatedCourseSection extends Component {
  render() {
    return (
      <div className="section-content section-content--widget">
        <div className="title">
          연관 과목 - 데이타구조
        </div>
        { courses.map(c => <CourseBlock course={c} />) }
        <div className="buttons">
          <button className="text-button">
            자세히 보기
          </button>
        </div>
      </div>
    );
  }
}


export default RelatedCourseSection;
