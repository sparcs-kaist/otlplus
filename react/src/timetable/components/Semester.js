import React, { Component } from 'react';
import axios from '../../common/presetAxios';
import {setSemester} from "../actions";
import {connect} from "react-redux";

const semesterName = {
    1: "봄",
    2: "여름",
    3: "가을",
    4: "겨울",
};

class Semester extends Component {
    constructor(props) {
        super(props);

        this.state = {
            startYear: null,
            startSemester: null,
            endYear: null,
            endSemester: null,
        };
    }

    componentDidMount() {
        this.props.setSemesterDispatch(2018, 1);

        axios.post("/api/timetable/semester", {
        })
        .then((response) => {
            this.setState((prevState)=>{
                return {
                    startYear: response.data.start_year,
                    startSemester: response.data.start_semester,
                    endYear: response.data.end_year,
                    endSemester: response.data.end_semester,
                };
            });
            this.props.setSemesterDispatch(response.data.current_year, response.data.current_semester);
        })
        .catch((response) => {console.log(response);});
    }

    semesterPrev() {
        let year = this.props.year;
        let semester = this.props.semester;

        if (semester === 1) {
            year = year - 1;
            semester = 3;
        } else {
            semester = 1;
        }

        this.props.setSemesterDispatch(year, semester);
    }

    semesterNext() {
        let year = this.props.year;
        let semester = this.props.semester;

        if (semester === 3) {
            year = year + 1;
            semester = 1;
        } else {
            semester = 3;
        }

        this.props.setSemesterDispatch(year, semester);
    }

    render() {
        if (this.props.year && this.props.semester)
            return (
                <div id="semester">
                    <div id="semester-prev" className={this.props.year===this.state.startYear && this.props.semester===this.state.startSemester ? "disable" : ""} onClick={()=>this.semesterPrev()}><i></i></div>
                    <span id="semester-text">{this.props.year} {semesterName[this.props.semester]}</span>
                    <div id="semester-next" className={this.props.year===this.state.endYear && this.props.semester===this.state.endSemester ? "disable" : ""} onClick={()=>this.semesterNext()}><i></i></div>
                </div>
            );
        else
            return (
                <div id="semester">
                    <div id="semester-prev"><i></i></div>
                    <span id="semester-text">불러오는 중</span>
                    <div id="semester-next"><i></i></div>
                </div>
            );
    }
}

let mapStateToProps = (state) => {
    return {
        year : state.semester.year,
        semester : state.semester.semester,
    }
};

let mapDispatchToProps = (dispatch) => {
    return {
        setSemesterDispatch : (year, semester) => {
            dispatch(setSemester(year, semester));
        },
    }
};

Semester = connect(mapStateToProps, mapDispatchToProps)(Semester);

export default Semester;
