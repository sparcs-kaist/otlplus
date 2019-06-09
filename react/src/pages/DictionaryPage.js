import React, { Component } from 'react';

import Header from '../componenets/Header';
import CourseListSection from '../componenets/sections/dictionary/CourseListSection';
import CourseDetailSection from '../componenets/sections/dictionary/CourseDetailSection';

import '../App.scss';


class DictionaryPage extends Component {
  render() {
    return (
      <div>
        <Header user={this.props.user} />
        <section className="content content--no-scroll">
          <div className="section-wrap section-wrap--course-list">
            <div className="tab--course-list" />
            <div className="section section--with-tabs">
              <CourseListSection />
            </div>
          </div>
          <div className="section-wrap section-wrap--course-detail">
            <div className="section">
              <CourseDetailSection />
            </div>
          </div>
        </section>
      </div>
    );
  }
}


export default DictionaryPage;
