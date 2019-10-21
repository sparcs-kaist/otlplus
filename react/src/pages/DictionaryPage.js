import React, { Component } from 'react';
import { connect } from 'react-redux';

import { appBoundClassNames as classNames } from '../common/boundClassNames';
import CourseListSection from '../componenets/sections/dictionary/CourseListSection';
import CourseDetailSection from '../componenets/sections/dictionary/CourseDetailSection';
import courses from '../dummy/courses';
import CourseListTabs from '../componenets/tabs/CourseListTabs';
import courseActiveShape from '../shapes/CourseActiveShape';


class DictionaryPage extends Component {
  render() {
    const { courseActive } = this.props;

    return (
      <div>
        <section className={classNames('content', 'content--no-scroll')}>
          <div className={classNames('section-wrap', 'section-wrap--course-list')}>
            <CourseListTabs />
            <div className={classNames('section', 'section--with-tabs')}>
              <CourseListSection />
            </div>
          </div>
          <div className={classNames('section-wrap', 'section-wrap--course-detail', ((courseActive.course && courseActive.clicked) ? '' : 'mobile-hidden'))}>
            <div className={classNames('section')}>
              <CourseDetailSection course={courses[0]} />
            </div>
          </div>
        </section>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  courseActive: state.dictionary.courseActive,
});

DictionaryPage.propTypes = {
  courseActive: courseActiveShape.isRequired,
};


export default connect(mapStateToProps, null)(DictionaryPage);
