import React, { Component } from 'react';
import { connect } from "react-redux";
import { createTimetable, setCurrentTimetable } from "../actions";

class TimetableTabs extends Component {
    changeTab(timetable) {
        this.props.setCurrentTimetableDispatch(timetable);
    }

    createTable() {
        this.props.createTimetableDispatch(Math.random(100000000));
    }

    render() {
        if (this.props.timetables && this.props.timetables.length)
            return (
                <div id="timetable-tabs">
                    { this.props.timetables.map((timetable, idx) => (
                        <div className={"timetable-tab"+(timetable.id===this.props.currentTimetable.id?" active":"")} data-id="<%- id %>" onClick={()=>this.changeTab(timetable)}>
                            <span className="timetable-num">
                                시간표{idx+1}
                            </span>
                            <span className="hidden-option duplicate-table"><i/></span>
                            <span className="hidden-option delete-table"><i/></span>
                        </div>
                    ))}
                    <div className="timetable-add" onClick={()=>this.createTable()}>
                        <span className="timetable-num"><i className="add-table"></i></span>
                    </div>
                </div>
            );
        else
            return (
                <div id="timetable-tabs">
                    <div className="timetable-tab" style={{pointerEvents:'none'}}><span className="timetable-num">불러오는 중</span>
                    </div>
                </div>
            );
    }
}

let mapStateToProps = (state) => {
    return {
        timetables : state.timetable.timetables,
        currentTimetable : state.timetable.currentTimetable,
    }
};

let mapDispatchToProps = (dispatch) => {
    return {
        setCurrentTimetableDispatch : (timetable) => {
            dispatch(setCurrentTimetable(timetable));
        },
        createTimetableDispatch : (id) => {
            dispatch(createTimetable(id));
        },
    }
};

TimetableTabs = connect(mapStateToProps, mapDispatchToProps)(TimetableTabs);

export default TimetableTabs;
