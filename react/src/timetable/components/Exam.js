import React, { Component } from 'react';

class Exam extends Component {
    render() {
        return (
            <div style={{flex:'auto'}}>
                <div id="examtitle"><span>시험시간표</span></div>
                <div id="examtable" className="nano">
                    <div className="list-scroll nano-content">
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
                    </div>
                </div>
            </div>
        );
    }
}

export default Exam;
