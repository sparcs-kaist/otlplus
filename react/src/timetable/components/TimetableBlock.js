import React, { Component } from 'react';
import {connect} from "react-redux";

class TimetableBlock extends Component {
    render() {
        const indexOfTime = (time) => (time/30 - 16);

        return (
            <div
                className={`lecture-block color${this.props.lecture.course%16}` + (this.props.isTemp?" lecture-block-temp active":"")}
                style={{
                    left : (this.props.cellWidth+6) * this.props.classtime.day + 28,
                    top : this.props.cellHeight * indexOfTime(this.props.classtime.begin) + 28,
                    width : this.props.cellWidth+2,
                    height : this.props.cellHeight * (indexOfTime(this.props.classtime.end)-indexOfTime(this.props.classtime.begin)) - 3,
                }}
            >
                <div  className="lecture-delete"><i/></div>
                <div wonMouseOver = {() => this.props.onMouseOver(this.props.lecture)}
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
    }
};

let mapDispatchToProps = (dispatch) => {
    return {
    }
};

TimetableBlock = connect(mapStateToProps, mapDispatchToProps)(TimetableBlock);

export default TimetableBlock;
