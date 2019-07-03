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
    const { showLectureInfoFlag, showTimetableListFlag, showLectureListFlag } = this.props;

    return (
      <div>
        <div className={showLectureInfoFlag ? classNames('modal-lecture-info') : null}>
          <div className={showTimetableListFlag ? classNames('modal-timetable-list') : null}>
            <div className={showLectureListFlag ? classNames('mobile-lecture-list') : null}>
              <Header />
              <section className={classNames('content', 'content--no-scroll')}>
                { /* eslint-disable-next-line react/jsx-indent */}
                  <div className={classNames('section-wrap', 'section-wrap--timetable-left')}>
                    <div className={classNames('section-wrap', 'section-wrap--lecture-detail')}>
                      <DetailSection />
                    </div>
                    <div className={classNames('section-wrap', 'section-wrap--lecture-list')}>
                      <div className={classNames('tab--lecture-list')}>
                        <ListTabs />
                      </div>
                      <ListSection />
                    </div>
                  </div>
                { /* eslint-disable-next-line react/jsx-indent */}
                  <div className={classNames('section-wrap', 'section-wrap--timetable-center-right')}>
                    <div className={classNames('section-wrap', 'section-wrap--timetable-tabs')}>
                      {
                        showTimetableListFlag
                          ? (
                            <div>
                              <SemesterSection />
                              <TimetableTabs />
                            </div>
                          )
                          : (
                            <div>
                              <TimetableTabs />
                              <SemesterSection />
                            </div>
                          )
                      }
                    </div>
                    <div className={classNames('section', 'section--timetable')}>
                      <TimetableSubSection />
                      <div className={classNames('divider', 'divider--vertical')} />
                      <div className={classNames('section-wrap', 'section-wrap--timetable-right')}>
                        <MapSubSection />
                        <SummarySubSection />
                        <ExamSubSection />
                        <ShareSubSection />
                      </div>
                    </div>
                  </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  showLectureListFlag: state.timetable.mobile.showLectureListFlag,
  showTimetableListFlag: state.timetable.mobile.showTimetableListFlag,
  showLectureInfoFlag: state.timetable.mobile.showLectureInfoFlag,
});


TimetablePage.propTypes = {
  showLectureListFlag: PropTypes.bool.isRequired,
  showTimetableListFlag: PropTypes.bool.isRequired,
  showLectureInfoFlag: PropTypes.bool.isRequired,
};

export default connect(mapStateToProps, null)(TimetablePage);
