import React, { Component } from 'react';
import {connect} from "react-redux";
import { Link } from 'react-router-dom';

class Detail extends Component {
    render() {
        if (this.props.from === "LIST" || this.props.from === "TABLE")
            return (
                <div id="lecture-info">
                    <div className="lecture-detail">
                        <div id="course-title" style={{textAlign:"center"}}>
                            <span>
                                {this.props.lecture.title}
                            </span>
                        </div>
                        <div id="course-no" style={{textAlign:"center"}}>
                            <span>
                                {this.props.lecture.old_code}
                                {this.props.lecture.class_no.length ? ' ('+this.props.lecture.class_no+')' : ''}
                            </span>
                        </div>
                        <div className="lecture-options">
                            <span id="fix-option" className="disable" style={{float:"left"}}>고정해제</span>
                            <span id="syllabus-option">
                                <a href={`https://cais.kaist.ac.kr/syllabusInfo?year=${this.props.lecture.year}&term=${this.props.lecture.semester}&subject_no=${this.props.lecture.code}&lecture_class=${this.props.lecture.class_no}&dept_id=${this.props.lecture.department}`} target="_blank">
                                    실라버스
                                </a>
                            </span>
                            &nbsp;
                            <span id="dictionary-option">
                                <Link to={`/review/dictionary${this.props.lecture.old_code}`} target="_blank">
                                    과목사전
                                </Link>
                            </span>
                        </div>
                        <div className="dict-fixed none">
                            <div className="basic-info dictionary-preview close-dict-button">
                                <span style={{fontWeight:"700"}}>과목 후기</span>
                                <i className="dict-arrow"/>
                            </div>
                        </div>
                        <div className="nano">
                            <div className="list-scroll nano-content">
                                <div className="basic-info">
                                    <span className="basic-info-name fixed-ko">구분</span>
                                    <span id="course-type">{this.props.lecture.type}</span>
                                </div>
                                <div className="basic-info">
                                    <span className="basic-info-name fixed-ko">학과</span>
                                    <span id="department">{this.props.lecture.department_name}</span>
                                </div>
                                <div className="basic-info">
                                    <span className="basic-info-name fixed-ko">교수</span>
                                    <span id="instructor">{this.props.lecture.professor}</span>
                                </div>
                                <div className="basic-info">
                                    <span className="basic-info-name fixed-ko">장소</span>
                                    <span id="classroom">{this.props.lecture.classroom}</span>
                                </div>
                                <div className="basic-info">
                                    <span className="basic-info-name fixed-ko">정원</span>
                                    <span id="class-size">{this.props.lecture.limit}</span>
                                </div>
                                <div className="basic-info">
                                    <span className="basic-info-name fixed-ko">시험</span>
                                    <span id="exam-time">{this.props.lecture.exam}</span>
                                </div>
                                <div className="lecture-scores">
                                    <div className="lecture-score">
                                        {
                                            this.props.lecture.is_english
                                            ? <div id="language" className="score-text">Eng</div>
                                            : <div id="language" className="score-text score-korean">한</div>
                                        }
                                        <div className="score-label">언어</div>
                                    </div>
                                    <div className="lecture-score">
                                        {
                                            this.props.lecture.credit > 0
                                            ? <div id="credit" className="score-text">{this.props.lecture.credit}</div>
                                            : <div id="credit" className="score-text">{this.props.lecture.credit_au}</div>
                                        }
                                        {
                                            this.props.lecture.credit > 0
                                            ? <div className="score-label">학점</div>
                                            : <div className="score-label">AU</div>
                                        }
                                    </div>
                                    <div className="lecture-score">
                                        <div id="rate" className="score-text">
                                            {
                                                this.props.lecture.limit === 0
                                                ? "0.0:1"
                                                : (this.props.lecture.num_people/this.props.lecture.limit).toFixed(1).toString()+":1"
                                            }
                                        </div>
                                        <div className="score-label">경쟁률</div>
                                    </div>
                                </div>
                                <div className="lecture-scores">
                                    <div className="lecture-score" style={{clear:"both"}}>
                                        <div id="grade" className="score-text">{this.props.lecture.grade_letter}</div>
                                        <div className="score-label">성적</div>
                                    </div>
                                    <div className="lecture-score">
                                        <div id="load" className="score-text">{this.props.lecture.load_letter}</div>
                                        <div className="score-label">널널</div>
                                    </div>
                                    <div className="lecture-score">
                                        <div id="speech" className="score-text">{this.props.lecture.speech_letter}</div>
                                        <div className="score-label">강의}</div>
                                    </div>
                                </div>
                                <div className="basic-info dictionary-preview open-dict-button">
                                    <span style={{fontWeight:"700"}}>과목 후기</span>
                                    <i className="dict-arrow"/>
                                </div>
                                <div id="reviews">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        else if (this.props.from === "MULTIPLE")
            return (
                <div id="lecture-info">
                    <div className="lecture-detail">
                        <div id="course-title" style={{textAlign:"center"}}>
                            <span>
                                {this.props.title}
                            </span>
                        </div>
                        <div id="course-no" style={{textAlign:"center"}}>
                            <span>
                                {this.props.lectures.length}개의 과목
                            </span>
                        </div>
                        <div className="lecture-options">
                            <span id="fix-option" className="disable" style={{float:"left"}}>고정해제</span>
                            <span id="syllabus-option" className="disable">실라버스</span>
                            &nbsp;
                            <span id="dictionary-option" className="disable">과목사전</span>
                        </div>
                        <div className="detail-top">
                            {this.props.lectures.map((lecture) => (
                                <div className="basic-info">
                                    <span className="basic-info-name">
                                        {lecture.title}
                                    </span>
                                    <span id="department">
                                        {lecture.info}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            );
        else
            return (
                <div id="lecture-info">
                    <div id="info-placeholder">
                        <div className="otlplus-title">
                            OTL PLUS
                        </div>
                        <div className="otlplus-content">
                            <Link to="/credits/">만든 사람들</Link> | <Link to="/licenses/">라이선스</Link>
                        </div>
                        <div className="otlplus-content">
                            <a href="mailto:otlplus@sparcs.org">otlplus@sparcs.org</a>
                        </div>
                        <div className="otlplus-content">
                            © 2017, <a href="http://sparcs.kaist.ac.kr">SPARCS</a> OTL Team
                        </div>
                    </div>
                </div>
            );
    }
}

let mapStateToProps = (state) => {
    return {
        from : state.lectureActive.from,
        lecture : state.lectureActive.lecture,
        title : state.lectureActive.title,
        lectures : state.lectureActive.lectures,
    }
};

let mapDispatchToProps = (dispatch) => {
    return {
    }
};

Detail = connect(mapStateToProps, mapDispatchToProps)(Detail);

export default Detail;
