import React, { Component } from 'react';

import Scroller from '../../Scroller';
import CourseBlock from '../../blocks/CourseBlock';
import courses from '../../../dummy/courses';


class CourseListSection extends Component {
  render() {
    return (
      <div className="section-content section-content--flex section-content--course-list">
        <div className="title">
          전산학부
        </div>
        <Scroller>
          { courses.map(c => <CourseBlock course={c} />)}
        </Scroller>
      </div>
    );
  }
}


export default CourseListSection;
