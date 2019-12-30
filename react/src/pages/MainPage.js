import React, { Component } from 'react';

import { appBoundClassNames as classNames } from '../common/boundClassNames';

import Footer from '../components/guideline/Footer';

import MyTimetableSection from '../components/sections/main/MyTimetableSection';
import AcademicScheduleSection from '../components/sections/main/AcademicScheduleSection';
import RelatedCourseSection from '../components/sections/main/RelatedCourseSection';
import LatestReviewSection from '../components/sections/main/LatestReviewSection';
import FamousReviewSection from '../components/sections/main/FamousReviewSection';
import ReviewWriteSection from '../components/sections/main/ReviewWriteSection';
import MainSearchSection from '../components/sections/main/MainSearchSection';


class MainPage extends Component {
  render() {
    return (
      <>
        <section className={classNames('main-image')}>
          {/* eslint-disable-next-line react/jsx-indent */}
        <div className={classNames('section-wrap', 'section-wrap--main-search')}>
          <div className={classNames('section')}>
            <MainSearchSection />
          </div>
        </div>
        </section>
        <section className={classNames('content')}>
          <div className={classNames('section-wrap')}>
            <div className={classNames('section')}>
              <MyTimetableSection />
            </div>
          </div>
          <div className={classNames('section-wrap')}>
            <div className={classNames('section')}>
              <AcademicScheduleSection />
            </div>
          </div>
          <div className={classNames('main-date')}>
            오늘
          </div>
          <div className={classNames('section-wrap')}>
            <div className={classNames('section')}>
              <ReviewWriteSection />
            </div>
          </div>
          <div className={classNames('section-wrap')}>
            <div className={classNames('section')}>
              <RelatedCourseSection />
            </div>
          </div>
          <div className={classNames('section-wrap')}>
            <div className={classNames('section')}>
              <LatestReviewSection />
            </div>
          </div>
          <div className={classNames('section-wrap')}>
            <div className={classNames('section')}>
              <FamousReviewSection />
            </div>
          </div>
        </section>
        <Footer />
      </>
    );
  }
}

export default MainPage;
