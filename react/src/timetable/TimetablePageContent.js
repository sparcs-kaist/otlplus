import React, { Component } from 'react';
import { connect } from 'react-redux';

import Header from "../componenets/Header";
import Detail from "./components/Detail";
import List from "./components/List";
import TimetableTabs from "./components/TimetableTabs";
import Semester from "./components/Semester";
import Timetable from "./components/Timetable";
import Map from "./components/Map";
import Summary from "./components/Summary";
import Exam from "./components/Exam";
import Share from "./components/Share";


class TimetablePageContent extends Component {
  render() {
    return (
        <div  className={ this.props.showLectureInfoFlag ? 'modal-lecture-info' : null} >
        <div className={ this.props.showTimetableListFlag ? 'modal-timetable-list' : null }>
        <div className={ this.props.showLectureListFlag ? 'mobile-lecture-list' : null }>
        <Header user={this.props.user} />
        <section id="content" className="container-fluid" style={{backgroundColor:"#f9f0f0"}}>
          <div id="page-container">
            <div id="left-side">
              <Detail/>
              <List/>
            </div>
            <div id="center">
              <div id="timetable-menu">
          {this.props.showTimetableListFlag ? <div> <Semester/> <TimetableTabs/> </div>  : <div><TimetableTabs/> <Semester/> </div>}

              </div>
              <div id="timetable">
                <Timetable/>
                <div id="right-side">
                  <Map/>
                  <Summary/>
                  <Exam/>
                  <Share/>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
    showLectureListFlag: state.timetable.mobile.showLectureListFlag ,
    showTimetableListFlag: state.timetable.mobile.showTimetableListFlag,
    showLectureInfoFlag : state.timetable.mobile.showLectureInfoFlag,
});
TimetablePageContent = connect(mapStateToProps)(TimetablePageContent);

export default TimetablePageContent;
