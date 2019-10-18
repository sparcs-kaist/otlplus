import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

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

class TimetablePage extends Component {
  render() {
    return (
      <div>
        { /* eslint-disable-next-line react/jsx-indent */}
              <Header />
        { /* eslint-disable-next-line react/jsx-indent */}
              <section className={classNames('content', 'content--no-scroll')}>
                { /* eslint-disable-next-line react/jsx-indent */}
                  <div className={classNames('section-wrap', 'section-wrap--timetable-left')}>
                    <div className={classNames('section-wrap', 'section-wrap--lecture-detail')}>
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
                      <div className={classNames('divider', 'divider--vertical')} />
                      <div className={classNames('section-wrap', 'section-wrap--timetable-right')}>
                        <MapSubSection />
                        <div className={classNames('divider')} />
                        <SummarySubSection />
                        <div className={classNames('divider')} />
                        <ExamSubSection />
                        <div className={classNames('divider')} />
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
});


TimetablePage.propTypes = {
};

export default connect(mapStateToProps, null)(TimetablePage);
