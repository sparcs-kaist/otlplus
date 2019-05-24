import React, { Component } from 'react';
import {connect} from "react-redux";

class Syllabus extends Component {

    constructor(props) {
        super(props);
        this.state = {
            currentShowingLecture: this.getFirstLecture(props),
        }
    }

    getFirstLecture(props) {
        return props.location.state.lectures[0]
    }

    getLectureUrl(lecture) {
        return `https://cais.kaist.ac.kr/syllabusInfo?year=${lecture.year}&term=${lecture.semester}&subject_no=${lecture.code}&lecture_class=${lecture.class_no}&dept_id=${lecture.department}`
    }

    updateShowingLecture(lecture) {
        this.setState({ currentShowingLecture: lecture })
    }

    render() {
        const { lectures } = this.props.location.state
        const { currentShowingLecture } = this.state
        return (
            <div>
                <div id="timetable-tabs">
                {
                    lectures.map(lecture =>
                        <div onClick={()=> this.updateShowingLecture(lecture)}>
                            { lecture.common_title }
                        </div>
                    )
                }
                </div>
                <iframe width="100%" height ="600" src={this.getLectureUrl(currentShowingLecture)}>
                    { currentShowingLecture.common_title }
                </iframe>
            </div>
            
        );
    }
}

let mapStateToProps = (state) => {
    return {
        currentTimetable : state.timetable.timetable.currentTimetable,
    }
};

Syllabus = connect(mapStateToProps, null)(Syllabus);

export default Syllabus;
