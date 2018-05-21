import React, { Component } from 'react';
import {connect} from "react-redux";
import { setLectureActive } from "../actions";

class TimetableBlock extends Component {
    blockHover() {
        if (!this.props.lectureActiveClicked && !this.isDragging) {
            this.props.setLectureActiveDispatch(this.props.lecture,"TABLE", false);
        }
    }

    blockOut() {
        if (!this.props.lectureActiveClicked) {
            this.props.setLectureActiveDispatch(this.props.lecture,"NONE",false)
        }
    }

    blockClick() {
        if (this.props.lectureActiveClicked
            && this.props.lectureActiveFrom === 'TABLE'
            && this.props.lectureActiveLecture.id === this.props.lecture.id) {
            this.props.setLectureActiveDispatch(this.props.lecture,'TABLE',false);
        }
        else {
            this.props.setLectureActiveDispatch(this.props.lecture,'TABLE',true);
        }
    }

    render() {
        const indexOfTime = (time) => (time/30 - 16);

        let activeType = "";
        if (this.props.lectureActiveLecture && (this.props.lectureActiveLecture.id === this.props.lecture.id)) {
            if ((this.props.lectureActiveFrom === "TABLE") && (this.props.lectureActiveClicked === true))
                activeType = " click";
            else if (((this.props.lectureActiveFrom === "TABLE")) && (this.props.lectureActiveClicked === false))
                activeType = " active";
            else if (((this.props.lectureActiveFrom === "LIST")) && (this.props.lectureActiveClicked === false))
                activeType = " lecture-block-temp active";
        }

        return (
            <div
                className={`lecture-block color${this.props.lecture.course%16}` + activeType}
                style={{
                    left : (this.props.cellWidth+6) * this.props.classtime.day + 28,
                    top : this.props.cellHeight * indexOfTime(this.props.classtime.begin) + 28,
                    width : this.props.cellWidth+2,
                    height : this.props.cellHeight * (indexOfTime(this.props.classtime.end)-indexOfTime(this.props.classtime.begin)) - 3,
                }}
                onMouseOver = {() => this.blockHover()}
                onMouseOut = {() => this.blockOut()}
                onClick={() => this.blockClick()}
            >
                <div  className="lecture-delete"><i/></div>
                <div
                    // onMouseDown={() => this.props.onMouseDown()}
                     className="lecture-block-content">
                    <p className="timetable-lecture-name">
                        {this.props.lecture.title}
                    </p>
                    <p className="timetable-lecture-info">
                        {this.props.lecture.professor}
                    </p>
                    <p className="timetable-lecture-info">
                        {this.props.classtime.classroom}
                    </p>
                </div>
            </div>
        );
    }
}

let mapStateToProps = (state) => {
    return {
        cellWidth : state.timetable.cellWidth,
        cellHeight : state.timetable.cellHeight,
        lectureActiveFrom : state.lectureActive.from,
        lectureActiveClicked : state.lectureActive.clicked,
        lectureActiveLecture : state.lectureActive.lecture,
    }
};

let mapDispatchToProps = (dispatch) => {
    return {
        setLectureActiveDispatch : (lecture, from, clicked) => {
            dispatch(setLectureActive(lecture, from, clicked));
        },
    }
};

TimetableBlock = connect(mapStateToProps, mapDispatchToProps)(TimetableBlock);

export default TimetableBlock;
