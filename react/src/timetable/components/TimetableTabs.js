import React, { Component } from 'react';
import { connect } from "react-redux";
import axios from "../../componenets/presetAxios";
import { createTimetable, setCurrentTimetable, deleteTimetable, duplicateTimetable } from "../actions";

class TimetableTabs extends Component {
    changeTab(timetable) {
        this.props.setCurrentTimetableDispatch(timetable);
    }

    createTable() {
        axios.post("/api/timetable/table_create", {
            year: this.props.year,
            semester: this.props.semester,
        })
        .then((response) => {
            this.props.createTimetableDispatch(response.data.id);
        })
        .catch((response) => {console.log(response);});
    }

    deleteTable(event, timetable) {
        event.stopPropagation();
        axios.post("/api/timetable/table_delete", {
            table_id: timetable.id,
            year: this.props.year,
            semester: this.props.semester,
        })
        .then((response) => {
            this.props.deleteTimetableDispatch(timetable);
        })
        .catch((response) => {console.log(response);});
    }

    duplicateTable(event, timetable) {
        event.stopPropagation();
        axios.post("/api/timetable/table_copy", {
            table_id: timetable.id,
            year: this.props.year,
            semester: this.props.semester,
        })
        .then((response) => {
            this.props.duplicateTimetableDispatch(response.data.id, timetable);
        })
        .catch((response) => {console.log(response);});
    }

    render() {
        if (this.props.timetables && this.props.timetables.length)
            return (
                <div id="timetable-tabs">
                    { this.props.timetables.map((timetable, idx) => (
                        <div className={"timetable-tab"+(timetable.id===this.props.currentTimetable.id?" active":"")} key={timetable.id} onClick={()=>this.changeTab(timetable)}>
                            <span className="timetable-num">
                                시간표{idx+1}
                            </span>
                            { this.props.showTimetableListFlag ? <div> <span className="hidden-option delete-table" onClick={(event)=>this.deleteTable(event, timetable)}><i/></span>
                            <span className="hidden-option duplicate-table" onClick={(event)=>this.duplicateTable(event, timetable)}><i/></span> </div>
                            : <div> <span className="hidden-option duplicate-table" onClick={(event)=>this.duplicateTable(event, timetable)}><i/></span>
                            <span className="hidden-option delete-table" onClick={(event)=>this.deleteTable(event, timetable)}><i/></span></div>}
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
        timetables : state.timetable.timetable.timetables,
        currentTimetable : state.timetable.timetable.currentTimetable,
        year : state.timetable.semester.year,
        semester : state.timetable.semester.semester,
        showTimetableListFlag : state.timetable.mobile.showTimetableListFlag,
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
        deleteTimetableDispatch : (timetable) => {
            dispatch(deleteTimetable(timetable));
        },
        duplicateTimetableDispatch : (id, timetable) => {
            dispatch(duplicateTimetable(id, timetable));
        }
    }
};

TimetableTabs = connect(mapStateToProps, mapDispatchToProps)(TimetableTabs);

export default TimetableTabs;
