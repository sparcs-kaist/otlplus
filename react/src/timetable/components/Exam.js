import React, { Component } from 'react';
import {connect} from "react-redux";
import Scroller from "../../common/Scroller";
import {clearMultipleDetail, setMultipleDetail} from "../actions";

class Exam extends Component {
    renderLectureExam = (lec) => {
        let act = ""
        if (this.props.lectureActiveLecture!==null && this.props.lectureActiveLecture.id===lec.id) {
            act = "active"
        }
        let li =
            <li className={`exam-elem ${act}`} data-id={lec.id}>
                <div className="exam-elem-title">
                    {lec.title}
                </div>
                <div className="exam-elem-body">
                    {lec.time}
                </div>
            </li>
        return li
    }

    render() {
        let examTable = [[],[],[],[],[]]

        for (let i=0, lecture; lecture = this.props.currentTimetable[i]; i++) {
            let day = lecture.examtimes[0].day
            let title = lecture.title
            let time = lecture.exam.slice(4)
            let id = lecture.id
            examTable[day].push({title: title, time: time, id: id})
        }

        return (
            <div style={{flex:'auto', display:'flex', flexDirection:'column' }}>
                <div id="examtitle"><span>시험시간표</span></div>
                <Scroller id="examtable">
                    <div className="exam-day" data-date="mon">
                        <div className="exam-day-title fixed-ko">
                            <span>월</span></div>
                        <ul className="exam-day-body">
                            {examTable[0].map(this.renderLectureExam)}
                        </ul>
                    </div>
                    <div className="exam-day" data-date="tue">
                        <div className="exam-day-title fixed-ko">
                            <span>화</span></div>
                        <ul className="exam-day-body">
                            {examTable[1].map(this.renderLectureExam)}
                        </ul>
                    </div>
                    <div className="exam-day" data-date="wed">
                        <div className="exam-day-title fixed-ko">
                            <span>수</span></div>
                        <ul className="exam-day-body">
                            {examTable[2].map(this.renderLectureExam)}
                        </ul>
                    </div>
                    <div className="exam-day" data-date="thu">
                        <div className="exam-day-title fixed-ko">
                            <span>목</span></div>
                        <ul className="exam-day-body">
                            {examTable[3].map(this.renderLectureExam)}
                        </ul>
                    </div>
                    <div className="exam-day" data-date="fri">
                        <div className="exam-day-title fixed-ko">
                            <span>금</span></div>
                        <ul className="exam-day-body">
                            {examTable[4].map(this.renderLectureExam)}
                        </ul>
                    </div>
                </Scroller>
            </div>
        );
    }
}

let mapStateToProps = (state) => {
    return {
        currentTimetable : state.timetable.currentTimetable,
        lectureActiveLecture : state.lectureActive.lecture,
        lectureActiveFrom : state.lectureActive.from,
    }
};

let mapDispatchToProps = (dispatch) => {
    return {
        setMultipleDetailDispatch : (title, lectures) => {
            dispatch(setMultipleDetail(title, lectures));
        },
        clearMultipleDetailDispatch : () => {
            dispatch(clearMultipleDetail());
        },
    }
};

Exam = connect(mapStateToProps, mapDispatchToProps)(Exam);

export default Exam;
