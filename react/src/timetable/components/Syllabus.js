import React, { Component } from 'react';
import { connect } from 'react-redux';

import '../../static/css/timetable/components/syllabus.scss';

class Syllabus extends Component {

  constructor(props) {
    super(props);
    this.state = {
      currentShowingLecture: this.getFirstLecture(props),
    };
  }

  getFirstLecture = (props) => {
    return props.location.state.lectures[0];
  }

  getLectureUrl = (lecture) => {
    return `https://cais.kaist.ac.kr/syllabusInfo?year=${lecture.year}&term=${lecture.semester}&subject_no=${lecture.code}&lecture_class=${lecture.class_no}&dept_id=${lecture.department}`;
  }

  updateShowingLecture = (lecture) => {
    this.setState({ currentShowingLecture: lecture });
  }

  render() {
    const { lectures } = this.props.location.state;
    const { currentShowingLecture } = this.state;
    return (
      <div class="syllabus-page">
        <div class="syllabus-wrapper">
          <div class="lecture-tab-container">
            {
              lectures.map(lecture =>
                <div class={`lecture-tab ${this.state.currentShowingLecture == lecture?'active': ''}`} onClick={()=> this.updateShowingLecture(lecture)}>
                  { lecture.common_title }
                 </div>
              )
            }
          </div>
          <div class="syllabus-iframe-wrapper">
            <iframe class="syllabus-iframe" src={this.getLectureUrl(currentShowingLecture)}>
              { currentShowingLecture.common_title }
            </iframe>
          </div>
        </div>
      </div>

    );
  }
}

let mapStateToProps = (state) => {
  return {
    currentTimetable: state.timetable.timetable.currentTimetable,
  };
};

Syllabus = connect(mapStateToProps, null)(Syllabus);

export default Syllabus;
