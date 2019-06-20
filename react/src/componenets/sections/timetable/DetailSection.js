import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import $ from 'jquery';

import Scroller from '../../Scroller';
import ReviewSimpleBlock from '../../blocks/ReviewSimpleBlock';
import { NONE, LIST, TABLE, MULTIPLE } from '../../../reducers/timetable/lectureActive';
import { clearLectureActive } from '../../../actions/timetable/index';
import lectureShape from '../../../shapes/LectureShape';


class DetailSection extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showUnfix: false,
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    // Return value will be set the state
    const showUnfix = (nextProps.from === 'LIST' || nextProps.from === 'TABLE') && nextProps.clicked;
    return { showUnfix: showUnfix };
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const { clicked, lecture } = this.props;
    if (prevProps.clicked && clicked) {
      if (prevProps.lecture.id !== lecture.id) {
        this.openDictPreview();
      }
    }
    else if (prevProps.clicked && !clicked) {
      if (lecture) {
        this.closeDictPreview();
      }
    }
    else if (!prevProps.clicked && clicked) {
      this.openDictPreview();
    }
  }

  openDictPreview = () => {
    $('.lecture-detail .nano').nanoScroller({ scrollTop: $('.open-dict-button').position().top - $('.nano-content > .basic-info:first-child').position().top + 1 });
  };

  closeDictPreview = () => {
    $('.lecture-detail .nano').nanoScroller({ scrollTop: 0 });
  };

  unfix = () => {
    const { clearLectureActiveDispatch } = this.props;
    clearLectureActiveDispatch();
  };

  render() {
    const { showUnfix } = this.state;
    const { from, lecture, title, multipleDetail } = this.props;

    if (from === LIST || from === TABLE) {
      const { reviews } = lecture;
      const mapreview = (review, index) => (
        <ReviewSimpleBlock key={`review_${index}`} review={review} />
      );
      const reviewsDom = (reviews && reviews.length) ? reviews.map(mapreview) : <div className="review-loading">결과 없음</div>;
      return (
        <div id="lecture-info">
          <div className="lecture-detail">
            <div id="course-title" style={{ textAlign: 'center' }}>
              <span>
                {lecture.title}
              </span>
            </div>
            <div id="course-no" style={{ textAlign: 'center' }}>
              <span>
                {lecture.old_code}
                {lecture.class_no.length ? ` (${lecture.class_no})` : ''}
              </span>
            </div>
            <div className="lecture-options">
              <span id="fix-option" onClick={this.unfix} className={showUnfix ? '' : 'disable'} style={{ float: 'left' }}>고정해제</span>
              <span id="syllabus-option">
                <a href={`https://cais.kaist.ac.kr/syllabusInfo?year=${lecture.year}&term=${lecture.semester}&subject_no=${lecture.code}&lecture_class=${lecture.class_no}&dept_id=${lecture.department}`} target="_blank" rel="noopener noreferrer">
                  실라버스
                </a>
              </span>
              &nbsp;
              <span id="dictionary-option">
                <Link to={`/review/dictionary${lecture.old_code}`} target="_blank">
                  과목사전
                </Link>
              </span>
            </div>
            <div className="dict-fixed none">
              <div onClick={this.closeDictPreview} className="basic-info dictionary-preview close-dict-button">
                <span style={{ fontWeight: '700' }}>과목 후기</span>
                <i className="dict-arrow" />
              </div>
            </div>
            <Scroller
              onScroll={
                () => {
                  if ($('.open-dict-button').position().top <= 1) {
                    $('.dict-fixed').removeClass('none');
                  }
                  else {
                    $('.dict-fixed').addClass('none');
                  }
                }
              }
            >
              <div className="basic-info">
                <span className="basic-info-name fixed-ko">구분</span>
                <span id="course-type">{lecture.type}</span>
              </div>
              <div className="basic-info">
                <span className="basic-info-name fixed-ko">학과</span>
                <span id="department">{lecture.department_name}</span>
              </div>
              <div className="basic-info">
                <span className="basic-info-name fixed-ko">교수</span>
                <span id="instructor">{lecture.professor}</span>
              </div>
              <div className="basic-info">
                <span className="basic-info-name fixed-ko">장소</span>
                <span id="classroom">{lecture.classroom}</span>
              </div>
              <div className="basic-info">
                <span className="basic-info-name fixed-ko">정원</span>
                <span id="class-size">{lecture.limit}</span>
              </div>
              <div className="basic-info">
                <span className="basic-info-name fixed-ko">시험</span>
                <span id="exam-time">{lecture.exam}</span>
              </div>
              <div className="lecture-scores">
                <div className="lecture-score">
                  {
                    lecture.is_english
                      ? <div id="language" className="score-text">Eng</div>
                      : <div id="language" className="score-text score-korean">한</div>
                  }
                  <div className="score-label">언어</div>
                </div>
                <div className="lecture-score">
                  {
                    lecture.credit > 0
                      ? <div id="credit" className="score-text">{lecture.credit}</div>
                      : <div id="credit" className="score-text">{lecture.credit_au}</div>
                  }
                  {
                    lecture.credit > 0
                      ? <div className="score-label">학점</div>
                      : <div className="score-label">AU</div>
                  }
                </div>
                <div className="lecture-score">
                  <div id="rate" className="score-text">
                    {
                      lecture.limit === 0
                        ? '0.0:1'
                        : `${(lecture.num_people / lecture.limit).toFixed(1).toString()}:1`
                    }
                  </div>
                  <div className="score-label">경쟁률</div>
                </div>
              </div>
              <div className="lecture-scores">
                <div className="lecture-score" style={{ clear: 'both' }}>
                  <div id="grade" className="score-text">{lecture.grade_letter}</div>
                  <div className="score-label">성적</div>
                </div>
                <div className="lecture-score">
                  <div id="load" className="score-text">{lecture.load_letter}</div>
                  <div className="score-label">널널</div>
                </div>
                <div className="lecture-score">
                  <div id="speech" className="score-text">{lecture.speech_letter}</div>
                  <div className="score-label">강의</div>
                </div>
              </div>
              <div onClick={this.openDictPreview} className="basic-info dictionary-preview open-dict-button">
                <span style={{ fontWeight: '700' }}>과목 후기</span>
                <i className="dict-arrow" />
              </div>
              <div id="reviews">
                {reviewsDom}
              </div>
            </Scroller>
          </div>
        </div>
      );
    }
    if (from === MULTIPLE) {
      return (
        <div id="lecture-info">
          <div className="lecture-detail">
            <div id="course-title" style={{ textAlign: 'center' }}>
              <span>
                {title}
              </span>
            </div>
            <div id="course-no" style={{ textAlign: 'center' }}>
              <span>
                {`${multipleDetail.length}개의 과목`}
              </span>
            </div>
            <div className="lecture-options">
              <span id="fix-option" onClick={this.unfix} className={showUnfix ? '' : 'disable'} style={{ float: 'left' }}>고정해제</span>
              <span id="syllabus-option" className="disable">실라버스</span>
              &nbsp;
              <span id="dictionary-option" className="disable">과목사전</span>
            </div>
            <div className="detail-top">
              {multipleDetail.map((detail, index) => (
                <div className="basic-info" key={detail.id}>
                  <span className="basic-info-name">
                    {detail.title}
                  </span>
                  <span id="department">
                    {detail.info}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }
    return (
        // eslint-disable-next-line react/jsx-indent
        <div id="lecture-info">
          <div id="info-placeholder">
            <div className="otlplus-title">
              OTL PLUS
            </div>
            <div className="otlplus-content">
              <Link to="/credits/">만든 사람들</Link>
              &nbsp;|&nbsp;
              <Link to="/licenses/">라이선스</Link>
            </div>
            <div className="otlplus-content">
              <a href="mailto:otlplus@sparcs.org">otlplus@sparcs.org</a>
            </div>
            <div className="otlplus-content">
              © 2017,&nbsp;
              <a href="http://sparcs.kaist.ac.kr">SPARCS</a>
              &nbsp;OTL Team
            </div>
          </div>
        </div>
    );
  }
}

const mapStateToProps = state => ({
  from: state.timetable.lectureActive.from,
  lecture: state.timetable.lectureActive.lecture,
  title: state.timetable.lectureActive.title,
  multipleDetail: state.timetable.lectureActive.multipleDetail,
  clicked: state.timetable.lectureActive.clicked,
});

const mapDispatchToProps = dispatch => ({
  clearLectureActiveDispatch: () => {
    dispatch(clearLectureActive());
  },
});

DetailSection.propTypes = {
  from: PropTypes.oneOf([NONE, LIST, TABLE, MULTIPLE]).isRequired,
  lecture: lectureShape,
  title: PropTypes.string.isRequired,
  multipleDetail: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      title: PropTypes.string.isRequired,
      info: PropTypes.string.isRequired,
    }),
  ),
  clicked: PropTypes.bool.isRequired,
  clearLectureActiveDispatch: PropTypes.func.isRequired,
};


export default connect(mapStateToProps, mapDispatchToProps)(DetailSection);
