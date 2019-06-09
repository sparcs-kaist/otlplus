import React, { Component } from 'react';
import { connect } from 'react-redux';

import '../static/css/timetable/components/syllabus.scss';

class SyllabusPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentShowingLecture: this.getFirstLecture(props),
    };
  }

  getFirstLecture = props => (
    props.location.state.lectures[0]
  )

  getLectureUrl = lecture => (
    `https://cais.kaist.ac.kr/syllabusInfo?year=${lecture.year}&term=${lecture.semester}&subject_no=${lecture.code}&lecture_class=${lecture.class_no}&dept_id=${lecture.department}`
  )

  updateShowingLecture = (lecture) => {
    this.setState({ currentShowingLecture: lecture });
  }

  render() {
    const { lectures } = this.props.location.state;
    const { currentShowingLecture } = this.state;
    return (
      <div className="syllabus-page">
        <div className="syllabus-wrapper">
          <div className="lecture-tab-container">
            {
              lectures.map(lecture => (
                <div className={`lecture-tab ${this.state.currentShowingLecture === lecture ? 'active' : ''}`} onClick={() => this.updateShowingLecture(lecture)}>
                  { lecture.common_title }
                </div>
              ))
            }
          </div>
          <div className="syllabus-iframe-wrapper">
            <iframe className="syllabus-iframe" src={this.getLectureUrl(currentShowingLecture)} title={`syllabus-${currentShowingLecture.title}`}>
              { currentShowingLecture.common_title }
            </iframe>
          </div>
        </div>
      </div>

    );
  }
}

const mapStateToProps = state => ({
  currentTimetable: state.timetable.timetable.currentTimetable,
});

SyllabusPage = connect(mapStateToProps, null)(SyllabusPage);

export default SyllabusPage;
