import React, { Component } from 'react';
import {connect} from "react-redux";

class TimetableBlock extends Component {
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
            >
                <div  className="lecture-delete"><i/></div>
                <div
                    // onMouseDown={() => this.props.onMouseDown()}
                    onMouseOver = {() => this.props.onMouseOver(this.props.lecture)}
                     onMouseOut = {() => this.props.onMouseOut(this.props.lecture)}
                    onClick={() => this.props.onClick(this.props.lecture)}
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
    }
};

TimetableBlock = connect(mapStateToProps, mapDispatchToProps)(TimetableBlock);

export default TimetableBlock;
