import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import '../static/css/timetable/timetable.css';

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
      <div className="timetable_page">
        <div className={showLectureInfoFlag ? 'modal-lecture-info' : null}>
          <div className={showTimetableListFlag ? 'modal-timetable-list' : null}>
            <div className={showLectureListFlag ? 'mobile-lecture-list' : null}>
              <Header />
              <section id="content" className="container-fluid" style={{ backgroundColor: '#f9f0f0' }}>
                <div id="page-container">
                  <div id="left-side">
                    <DetailSection />
                    <div id="lecture-lists">
                      <ListTabs />
                      <ListSection />
                    </div>
                  </div>
                  <div id="center">
                    <div id="timetable-menu">
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
                    <div id="timetable">
                      <TimetableSubSection />
                      <div id="right-side">
                        <MapSubSection />
                        <SummarySubSection />
                        <ExamSubSection />
                        <ShareSubSection />
                      </div>
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
