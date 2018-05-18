import React, { Component } from 'react';
import {connect} from "react-redux";
import {clearMultipleDetail, setMultipleDetail} from "../actions";

const indexOfType = (type) => {
    const types = ["Basic Required", "Basic Elective", "Major Required", "Major Elective", "Humanities & Social Elective"];
    let index = types.indexOf(type);
    if (index === -1)
        return 5;
    else
        return index;
};

class Summary extends Component {
    typeFocus(type) {
        let lectures = [];
        for (var i=0; i<this.props.currentTimetable.length; i++) {
            let lecture = this.props.currentTimetable[i];

            if (indexOfType(lecture.type_en) !== indexOfType(type))
                continue;

            if (lecture.credit > 0)
                lectures.push({
                    title : lecture.title,
                    info : lecture.credit.toString() + "학점",
                });
            if (lecture.credit_au > 0)
                lectures.push({
                    title : lecture.title,
                    info : lecture.credit_au.toString() + "AU",
                });
        }
        this.props.setMultipleDetailDispatch(type, lectures);
    }

    clearFocus() {
        this.props.clearMultipleDetailDispatch();
    };

    render() {
        let type_credit = [0,0,0,0,0,0];
        let sum_credit = 0, sum_credit_au = 0, targetNum = 0, grade = 0, load = 0, speech = 0;
        let letters = ['?', 'F', 'F', 'F', 'D-', 'D', 'D+', 'C-', 'C', 'C+', 'B-', 'B', 'B+', 'A-', 'A', 'A+']

        for (let i=0, lecture; lecture = this.props.currentTimetable[i]; i++) {
            let num = lecture.credit + lecture.credit_au;
            type_credit[indexOfType(lecture.type_en)] += num;
            sum_credit += lecture.credit;
            sum_credit_au += lecture.credit_au;
            targetNum += num;
            grade += lecture.grade * num;
            load += lecture.load * num;
            speech += lecture.speech * num;
        }
        let active_type_credit = ['', '', '', '', '', ''];
        if (this.props.lectureActiveFrom === "LIST" || this.props.lectureActiveFrom === "TABLE" ) {
            let index = indexOfType(this.props.lectureActiveLecture.type_en);
            let amount = this.props.lectureActiveLecture.credit + this.props.lectureActiveLecture.credit_au;

            active_type_credit[index] = `+${amount}`;
            for (let i=0, lecture; lecture = this.props.currentTimetable[i]; i++)
                if (lecture.id === this.props.lectureActiveLecture.id) {
                    active_type_credit[index] = `(${amount})`;
                    break;
                }
        }

        // let sum_credit = type_credit.reduce((prev, curr) => prev + curr)


        return (
            <div id="summary">
                <div id="summary-type">
                    <div className="summary-type-elem summary-type-elem-left" onMouseOver={()=>this.typeFocus("Basic Required")} onMouseOut={()=>this.clearFocus()}>
                        <span className={"summary-type-elem-title fixed-ko"}>기필</span>
                        <span className="summary-type-elem-body">{type_credit[0]}</span>
                        <span className="summary-type-elem-additional">{active_type_credit[0]}</span>
                    </div>
                    <div className="summary-type-elem summary-type-elem-right" onMouseOver={()=>this.typeFocus("Basic Elective")} onMouseOut={()=>this.clearFocus()}>
                        <span className="summary-type-elem-title fixed-ko">기선</span>
                        <span className="summary-type-elem-body">{type_credit[1]}</span>
                        <span className="summary-type-elem-additional">{active_type_credit[1]}</span>
                    </div>
                    <div className="summary-type-elem summary-type-elem-left" onMouseOver={()=>this.typeFocus("Major Required")} onMouseOut={()=>this.clearFocus()}>
                        <span className="summary-type-elem-title fixed-ko">전필</span>
                        <span className="summary-type-elem-body">{type_credit[2]}</span>
                        <span className="summary-type-elem-additional">{active_type_credit[2]}</span>
                    </div>
                    <div className="summary-type-elem summary-type-elem-right" onMouseOver={()=>this.typeFocus("Major Elective")} onMouseOut={()=>this.clearFocus()}>
                        <span className="summary-type-elem-title fixed-ko">전선</span>
                        <span className="summary-type-elem-body">{type_credit[3]}</span>
                        <span className="summary-type-elem-additional">{active_type_credit[3]}</span>
                    </div>
                    <div className="summary-type-elem summary-type-elem-left" onMouseOver={()=>this.typeFocus("Humanities & Social Elective")} onMouseOut={()=>this.clearFocus()}>
                        <span className="summary-type-elem-title fixed-ko">인문</span>
                        <span className="summary-type-elem-body">{type_credit[4]}</span>
                        <span className="summary-type-elem-additional">{active_type_credit[4]}</span>
                    </div>
                    <div className="summary-type-elem summary-type-elem-right" onMouseOver={()=>this.typeFocus("Etc")} onMouseOut={()=>this.clearFocus()}>
                        <span className="summary-type-elem-title fixed-ko">기타</span>
                        <span className="summary-type-elem-body">{type_credit[5]}</span>
                        <span className="summary-type-elem-additional">{active_type_credit[5]}</span>
                    </div>
                </div>
                <div id="summary-credit">
                    <div className="summary-credit-elem">
                        <div id="credits" className="score-text">
                            <span className="normal">{sum_credit}</span>
                            <span className="active none">{sum_credit}</span>
                        </div>
                        <div className="score-label">학점</div>
                    </div>
                    &nbsp;
                    <div className="summary-credit-elem">
                        <div id="au" className="score-text">
                            <span className="normal">{sum_credit_au}</span>
                            <span className="active none">0</span></div>
                        <div className="score-label">AU</div>
                    </div>
                </div>
                <div id="summary-score">
                    <div className="summary-score-elem">
                        <div id="grades" className="score-text">{letters[Math.round(grade/targetNum)]}</div>
                        <div className="score-label">성적</div>
                    </div>
                    &nbsp;
                    <div className="summary-score-elem">
                        <div id="loads" className="score-text">{letters[Math.round(load/targetNum)]}</div>
                        <div className="score-label">널널</div>
                    </div>
                    &nbsp;
                    <div className="summary-score-elem">
                        <div id="speeches" className="score-text">{letters[Math.round(speech/targetNum)]}</div>
                        <div className="score-label">강의</div>
                    </div>
                </div>
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

Summary = connect(mapStateToProps, mapDispatchToProps)(Summary);

export default Summary;
