import React, { Component } from 'react';
import { connect } from 'react-redux';

import { appBoundClassNames as classNames } from '../common/boundClassNames';

import Header from '../componenets/Header';
import DetailSection from '../componenets/sections/timetable/DetailSection';
import ListTabs from '../componenets/tabs/ListTabs';
import ListSection from '../componenets/sections/timetable/ListSection';
import TimetableTabs from '../componenets/tabs/TimetableTabs';
import SemesterSection from '../componenets/sections/timetable/SemesterSection';
import TimetableSubSection from '../componenets/sections/timetable/TimetableSubSection';
import MapSubSection from '../componenets/sections/timetable/MapSubSection';
import SummarySubSection from '../componenets/sections/timetable/SummarySubSection';
import ExamSubSection from '../componenets/sections/timetable/ExamSubSection';
import ShareSubSection from '../componenets/sections/timetable/ShareSubSection';
import lectureActiveShape from '../shapes/LectureActiveShape';

class TimetablePage extends Component {
  render() {
    const { lectureActive } = this.props;
    return (
      <div>
        { /* eslint-disable-next-line react/jsx-indent */}
              <Header />
        { /* eslint-disable-next-line react/jsx-indent */}
              <section className={classNames('content', 'content--no-scroll', 'content--timetable')}>
                { /* eslint-disable-next-line react/jsx-indent */}
                  <div className={classNames('section-wrap', 'section-wrap--timetable-left')}>
                    <div className={classNames('section-wrap', 'section-wrap--lecture-detail', (lectureActive.clicked ? '' : 'mobile-hidden'))}>
                      <div className={classNames('section')}>
                        <DetailSection />
                      </div>
                    </div>
                    <div className={classNames('section-wrap', 'section-wrap--lecture-list')}>
                      <ListTabs />
                      <div className={classNames('section', 'section--with-tabs')}>
                        <ListSection />
                      </div>
                    </div>
                  </div>
                { /* eslint-disable-next-line react/jsx-indent */}
                  <div className={classNames('section-wrap', 'section-wrap--timetable-center-right')}>
                    <div className={classNames('section-wrap', 'section-wrap--timetable-tabs')}>
                      <div>
                        <TimetableTabs />
                        <SemesterSection />
                      </div>
                    </div>
                    <div className={classNames('section', 'section--with-tabs', 'section--timetable')}>
                      <TimetableSubSection />
                      <div className={classNames('divider', 'divider--vertical', 'divider--mobile-horizontal')} />
                      <div className={classNames('section-wrap', 'section-wrap--timetable-right')}>
                        <MapSubSection />
                        <div className={classNames('divider', 'mobile-hidden')} />
                        <SummarySubSection />
                        <div className={classNames('divider', 'mobile-hidden')} />
                        <ExamSubSection />
                        <div className={classNames('divider', 'mobile-hidden')} />
                        <ShareSubSection />
                      </div>
                    </div>
                  </div>
              </section>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  lectureActive: state.timetable.lectureActive,
});


TimetablePage.propTypes = {
  lectureActive: lectureActiveShape.isRequired,
};

export default connect(mapStateToProps, null)(TimetablePage);
