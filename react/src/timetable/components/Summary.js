import React, { Component } from 'react';
import {connect} from "react-redux";
import {clearMultipleDetail, setMultipleDetail} from "../actions";

class Summary extends Component {
    render() {
        const indexOfType = (type) => {
            const types = ["Basic Required", "Basic Elective", "Major Required", "Major Elective", "Humanities & Social Elective"];
            let index = types.indexOf(type);
            if (index === -1)
                return 5;
            else
                return index;
        };

        let type_credit = [0,0,0,0,0,0];
        for (let i=0, lecture; lecture = this.props.currentTimetable[i]; i++)
            type_credit[indexOfType(lecture.type_en)] += lecture.credit + lecture.credit_au;

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

        const hoverType = (type) => {
            return (e) => {
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
        };

        const outType = (e) => {
            this.props.clearMultipleDetailDispatch();
        };

        return (
            <div id="summary">
                <div id="summary-type">
                    <div className="summary-type-elem summary-type-elem-left" onMouseOver={hoverType("Basic Required")} onMouseOut={outType}>
                        <span className={"summary-type-elem-title fixed-ko"}>기필</span>
                        <span className="summary-type-elem-body">{type_credit[0]}</span>
                        <span className="summary-type-elem-additional">{active_type_credit[0]}</span>
                    </div>
                    <div className="summary-type-elem summary-type-elem-right" onMouseOver={hoverType("Basic Elective")} onMouseOut={outType}>
                        <span className="summary-type-elem-title fixed-ko">기선</span>
                        <span className="summary-type-elem-body">{type_credit[1]}</span>
                        <span className="summary-type-elem-additional">{active_type_credit[1]}</span>
                    </div>
                    <div className="summary-type-elem summary-type-elem-left" onMouseOver={hoverType("Major Required")} onMouseOut={outType}>
                        <span className="summary-type-elem-title fixed-ko">전필</span>
                        <span className="summary-type-elem-body">{type_credit[2]}</span>
                        <span className="summary-type-elem-additional">{active_type_credit[2]}</span>
                    </div>
                    <div className="summary-type-elem summary-type-elem-right" onMouseOver={hoverType("Major Elective")} onMouseOut={outType}>
                        <span className="summary-type-elem-title fixed-ko">전선</span>
                        <span className="summary-type-elem-body">{type_credit[3]}</span>
                        <span className="summary-type-elem-additional">{active_type_credit[3]}</span>
                    </div>
                    <div className="summary-type-elem summary-type-elem-left" onMouseOver={hoverType("Humanities & Social Elective")} onMouseOut={outType}>
                        <span className="summary-type-elem-title fixed-ko">인문</span>
                        <span className="summary-type-elem-body">{type_credit[4]}</span>
                        <span className="summary-type-elem-additional">{active_type_credit[4]}</span>
                    </div>
                    <div className="summary-type-elem summary-type-elem-right" onMouseOver={hoverType("Etc")} onMouseOut={outType}>
                        <span className="summary-type-elem-title fixed-ko">기타</span>
                        <span className="summary-type-elem-body">{type_credit[5]}</span>
                        <span className="summary-type-elem-additional">{active_type_credit[5]}</span>
                    </div>
                </div>
                <div id="summary-credit">
                    <div className="summary-credit-elem">
                        <div id="credits" className="score-text">
                            <span className="normal">-</span>
                            <span className="active none">0</span>
                        </div>
                        <div className="score-label">학점</div>
                    </div>
                    &nbsp;
                    <div className="summary-credit-elem">
                        <div id="au" className="score-text">
                            <span className="normal">-</span>
                            <span className="active none">0</span></div>
                        <div className="score-label">AU</div>
                    </div>
                </div>
                <div id="summary-score">
                    <div className="summary-score-elem">
                        <div id="grades" className="score-text">-</div>
                        <div className="score-label">성적</div>
                    </div>
                    &nbsp;
                    <div className="summary-score-elem">
                        <div id="loads" className="score-text">-</div>
                        <div className="score-label">널널</div>
                    </div>
                    &nbsp;
                    <div className="summary-score-elem">
                        <div id="speeches" className="score-text">-</div>
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
