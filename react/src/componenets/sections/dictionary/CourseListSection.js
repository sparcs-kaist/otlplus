import React, { Component } from 'react';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';
import Scroller from '../../Scroller';
import CourseBlock from '../../blocks/CourseBlock';
import courses from '../../../dummy/courses';


class CourseListSection extends Component {
  render() {
    return (
      <div className={classNames('section-content', 'section-content--flex', 'section-content--course-list')}>
        <div className={classNames('title')}>
          전산학부
        </div>
        <Scroller>
          { courses.map(c => <CourseBlock course={c} key={c.id} />)}
        </Scroller>
      </div>
    );
  }
}


export default CourseListSection;
