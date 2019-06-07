import React, { Component } from 'react';

import Header from '../componenets/Header';
import Footer from '../componenets/Footer';

import AcademicScheduleSection from '../componenets/sections/AcademicScheduleSection';
import RelatedCourseSection from '../componenets/sections/RelatedCourseSection';
import LatestReviewSection from '../componenets/sections/LatestReviewSection';
import FamousReviewSection from '../componenets/sections/FamousReviewSection';
import ReviewWriteSection from '../componenets/sections/ReviewWriteSection';


class MainPage extends Component {
  render() {
    return (
      <div>
        <Header user={this.props.user} />
        <section className="main-image">
          <form className="main-search">
            <i />
            <input type="text" placeholder="검색" />
            <button className="text-button" type="submit">검색</button>
          </form>
        </section>
        <section className="content">
          <div className="section-wrap">
            <div className="section">
              <AcademicScheduleSection />
            </div>
          </div>
          <div className="main-date">
            오늘
          </div>
          <div className="section-wrap">
            <div className="section">
              <ReviewWriteSection />
            </div>
          </div>
          <div className="section-wrap">
            <div className="section">
              <RelatedCourseSection />
            </div>
          </div>
          <div className="section-wrap">
            <div className="section">
              <LatestReviewSection />
            </div>
          </div>
          <div className="section-wrap">
            <div className="section">
              <FamousReviewSection />
            </div>
          </div>
        </section>
        <Footer />
      </div>
    );
  }
}

export default MainPage;
