import React, { Component } from 'react';

import { appBoundClassNames as classNames } from '../common/boundClassNames';

import Footer from '../components/guideline/Footer';

import CurrentTimetableSection from '../components/sections/main/CurrentTimetableSection';
import AcademicScheduleSection from '../components/sections/main/AcademicScheduleSection';
import RelatedCourseSection from '../components/sections/main/RelatedCourseSection';
import LatestReviewSection from '../components/sections/main/LatestReviewSection';
import FamousReviewSection from '../components/sections/main/FamousReviewSection';
import ReviewWriteSection from '../components/sections/main/ReviewWriteSection';


class MainPage extends Component {
  render() {
    return (
      <div>
        <section className={classNames('main-image')}>
          <form className={classNames('main-search')}>
            <i />
            <input type="text" placeholder="검색" />
            <button className={classNames('text-button')} type="submit">검색</button>
          </form>
        </section>
        <section className={classNames('content')}>
          <div className={classNames('section-wrap')}>
            <div className={classNames('section')}>
              <CurrentTimetableSection />
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
      </div>
    );
  }
}

export default MainPage;
