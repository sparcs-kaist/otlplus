import React, { Component } from 'react';

import { appBoundClassNames as classNames } from '../common/boundClassNames';
import Header from '../componenets/Header';
import CourseListSection from '../componenets/sections/dictionary/CourseListSection';
import CourseDetailSection from '../componenets/sections/dictionary/CourseDetailSection';
import courses from '../dummy/courses';
import CourseListTabs from '../componenets/tabs/CourseListTabs';


class DictionaryPage extends Component {
  render() {
    return (
      <div>
        <Header />
        <section className={classNames('content', 'content--no-scroll')}>
          <div className={classNames('section-wrap', 'section-wrap--course-list')}>
            <CourseListTabs />
            <div className={classNames('section', 'section--with-tabs')}>
              <CourseListSection />
            </div>
          </div>
          <div className={classNames('section-wrap', 'section-wrap--course-detail')}>
            <div className={classNames('section')}>
              <CourseDetailSection course={courses[0]} />
            </div>
          </div>
        </section>
      </div>
    );
  }
}


export default DictionaryPage;
