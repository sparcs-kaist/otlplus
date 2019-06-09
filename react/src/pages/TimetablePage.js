import React, { Component } from 'react';
import { connect } from 'react-redux';

import '../static/css/timetable/timetable.css';

import Header from '../componenets/Header';
import DetailSection from '../componenets/sections/timetable/DetailSection';
import ListSection from '../componenets/sections/timetable/ListSection';
import TimetableTabs from '../componenets/tabs/TimetableTabs';
import SemesterSubSection from '../componenets/sections/timetable/SemesterSubSection';
import TimetableSubSection from '../componenets/sections/timetable/TimetableSubSection';
import MapSubSection from '../componenets/sections/timetable/MapSubSection';
import SummarySubSection from '../componenets/sections/timetable/SummarySubSection';
import ExamSubSection from '../componenets/sections/timetable/ExamSubSection';
import ShareSubSection from '../componenets/sections/timetable/ShareSubSection';

class TimetablePage extends Component {
  render() {
    return (
      <div className="timetable_page">
        <div className={this.props.showLectureInfoFlag ? 'modal-lecture-info' : null}>
          <div className={this.props.showTimetableListFlag ? 'modal-timetable-list' : null}>
            <div className={this.props.showLectureListFlag ? 'mobile-lecture-list' : null}>
              <Header user={this.props.user} />
              <section id="content" className="container-fluid" style={{ backgroundColor: '#f9f0f0' }}>
                <div id="page-container">
                  <div id="left-side">
                    <DetailSection />
                    <ListSection />
                  </div>
                  <div id="center">
                    <div id="timetable-menu">
                      {
                        this.props.showTimetableListFlag
                          ? (
                            <div>
                              <SemesterSubSection />
                              <TimetableTabs />
                            </div>
                          )
                          : (
                            <div>
                              <TimetableTabs />
                              <SemesterSubSection />
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
TimetablePage = connect(mapStateToProps, null)(TimetablePage);

export default TimetablePage;
