import React, { Component } from 'react';
import { connect } from 'react-redux';

import '../static/css/timetable/timetable.css';

import Header from '../componenets/Header';
import Detail from '../timetable/components/Detail';
import List from '../timetable/components/List';
import TimetableTabs from '../timetable/components/TimetableTabs';
import Semester from '../timetable/components/Semester';
import Timetable from '../timetable/components/Timetable';
import Map from '../timetable/components/Map';
import Summary from '../timetable/components/Summary';
import Exam from '../timetable/components/Exam';
import Share from '../timetable/components/Share';

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
                    <Detail />
                    <List />
                  </div>
                  <div id="center">
                    <div id="timetable-menu">
                      {
                        this.props.showTimetableListFlag
                          ? (
                            <div>
                              <Semester />
                              <TimetableTabs />
                            </div>
                          )
                          : (
                            <div>
                              <TimetableTabs />
                              <Semester />
                            </div>
                          )
                      }
                    </div>
                    <div id="timetable">
                      <Timetable />
                      <div id="right-side">
                        <Map />
                        <Summary />
                        <Exam />
                        <Share />
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
