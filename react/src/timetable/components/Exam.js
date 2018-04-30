import React, { Component } from 'react';
import Scroller from "../../common/Scroller";

class Exam extends Component {
    render() {
        return (
            <div style={{flex:'auto'}}>
                <div id="examtitle"><span>시험시간표</span></div>
                <Scroller id="examtable">
                    <div className="exam-day" data-date="mon">
                        <div className="exam-day-title fixed-ko">
                            <span>월</span></div>
                        <ul className="exam-day-body">
                        </ul>
                    </div>
                    <div className="exam-day" data-date="tue">
                        <div className="exam-day-title fixed-ko">
                            <span>화</span></div>
                        <ul className="exam-day-body">
                        </ul>
                    </div>
                    <div className="exam-day" data-date="wed">
                        <div className="exam-day-title fixed-ko">
                            <span>수</span></div>
                        <ul className="exam-day-body">
                        </ul>
                    </div>
                    <div className="exam-day" data-date="thu">
                        <div className="exam-day-title fixed-ko">
                            <span>목</span></div>
                        <ul className="exam-day-body">
                        </ul>
                    </div>
                    <div className="exam-day" data-date="fri">
                        <div className="exam-day-title fixed-ko">
                            <span>금</span></div>
                        <ul className="exam-day-body">
                        </ul>
                    </div>
                </Scroller>
            </div>
        );
    }
}

export default Exam;
