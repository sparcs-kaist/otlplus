import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';
import axios from '../../../common/presetAxios';
import { BASE_URL } from '../../../common/constants';
import { clearCourseActive, setReviews, setLectures } from '../../../actions/dictionary/courseActive';
import ReviewBlock from '../../blocks/ReviewBlock';
import ReviewWriteBlock from '../../blocks/ReviewWriteBlock';
import Scroller from '../../Scroller';
import CourseSimpleBlock from '../../blocks/CourseSimpleBlock';
import CourseShape from '../../../shapes/CourseShape';
import courses from '../../../dummy/courses';
import reviewShape from '../../../shapes/ReviewShape';
import userShape from '../../../shapes/UserShape';
import lectureShape from '../../../shapes/LectureShape';
import HistoryLecturesBlock from '../../blocks/HistoryLecturesBlock';


class CourseDetailSection extends Component {
  componentDidUpdate(prevProps, prevState, snapshot) {
    const { clicked, course, setReviewsDispatch, setLecturesDispatch } = this.props;

    if ((clicked && course !== null)
      && !(prevProps.clicked && (prevProps.course.id === course.id))) {
      axios.get(`${BASE_URL}/api/courses/${course.id}/comments`, {
      })
        .then((response) => {
          const newProps = this.props;
          if (newProps.course.id !== course.id) {
            return;
          }
          setReviewsDispatch(response.data);
        })
        .catch((response) => {
        });
      axios.get(`${BASE_URL}/api/courses/${course.id}/lectures`, {
      })
        .then((response) => {
          const newProps = this.props;
          if (newProps.course.id !== course.id) {
            return;
          }
          setLecturesDispatch(response.data);
        })
        .catch((response) => {
        });
    }
  }


  onScroll() {
    if (this.refs.scores.getBoundingClientRect().top >= this.refs.scrollThreshold.getBoundingClientRect().bottom) {
      this.refs.hiddenScores.classList.add('fixed__conditional-part--hidden');
    }
    else {
      this.refs.hiddenScores.classList.remove('fixed__conditional-part--hidden');
    }
  }


  unfix = () => {
    const { clearCourseActiveDispatch } = this.props;
    clearCourseActiveDispatch();
  }


  render() {
    const { user, clicked, course, reviews, lectures } = this.props;

    if (clicked && course !== null) {
      const takenLectureOfCourse = user
        ? user.taken_lectures.filter(l => (l.course === course.id))
        : [];

      return (

        <div className={classNames('section-content', 'section-content--flex', 'section-content--course-detail')}>
          <div className={classNames('close-button')} onClick={this.unfix}>닫기</div>
          <div className={classNames('fixed')}>
            <div>
              <div className={classNames('title')}>
                {course.title}
              </div>
              <div className={classNames('subtitle')}>
                {course.old_code}
              </div>
            </div>
            <div ref="scrollThreshold" />
            <div className={classNames('fixed__conditional-part', 'fixed__conditional-part--hidden')} ref="hiddenScores">
              <div>
                <div className={classNames('scores')}>
                  <div>
                    <div>
                      {course.grade_letter}
                    </div>
                    <div>
                      학점
                    </div>
                  </div>
                  <div>
                    <div>
                      {course.load_letter}
                    </div>
                    <div>
                      널널
                    </div>
                  </div>
                  <div>
                    <div>
                      {course.speech_letter}
                    </div>
                    <div>
                      강의
                    </div>
                  </div>
                </div>
                <div className={classNames('divider')} />
              </div>
            </div>
          </div>
          <Scroller onScroll={() => this.onScroll()}>
            <div>
              <div className={classNames('attribute')}>
                <div>
                  분류
                </div>
                <div>
                  {`${course.department.name}, ${course.type}`}
                </div>
              </div>
              <div className={classNames('attribute')}>
                <div>
                  설명
                </div>
                <div>
                  {course.summary}
                </div>
              </div>
            </div>
            <div className={classNames('scores')} ref="scores">
              <div>
                <div>
                  {course.grade_letter}
                </div>
                <div>
                  학점
                </div>
              </div>
              <div>
                <div>
                  {course.load_letter}
                </div>
                <div>
                  널널
                </div>
              </div>
              <div>
                <div>
                  {course.speech_letter}
                </div>
                <div>
                  강의
                </div>
              </div>
            </div>
            <div className={classNames('divider')} />
            <div className={classNames('related-courses')}>
              <div>
                { courses.map(c => <CourseSimpleBlock course={c} key={c.id} />) }
              </div>
              <div>
                &gt;
              </div>
              <div>
                <CourseSimpleBlock course={course} />
              </div>
              <div>
                &gt;
              </div>
              <div>
                { courses.map(c => <CourseSimpleBlock course={c} key={c.id} />) }
              </div>
            </div>
            <div className={classNames('divider')} />
            {
              (lectures == null)
                ? <div>불러오는 중</div>
                : (
                  <div className={classNames('history')}>
                    <table>
                      <tbody>
                        <tr>
                          <th>봄</th>
                          {[...Array(2019 - 2009 + 1).keys()].map((i) => {
                            const y = 2009 + i;
                            const filteredLectures = lectures.filter(l => ((l.year === y) && (l.semester === 1)));
                            if (filteredLectures.length === 0) {
                              return <td className={classNames('history__cell--unopen')} key={`${y}-1`}>미개설</td>;
                            }
                            return <td key={`${y}-1`}><HistoryLecturesBlock lectures={filteredLectures} /></td>;
                          })}
                        </tr>
                        <tr>
                          <th />
                          {[...Array(2019 - 2009 + 1).keys()].map((i) => {
                            const y = 2009 + i;
                            return (
                              <td className={classNames('history__cell--year-label')} key={`${y}-l`}>{y}</td>
                            );
                          })}
                        </tr>
                        <tr>
                          <th>가을</th>
                          {[...Array(2019 - 2009 + 1).keys()].map((i) => {
                            const y = 2009 + i;
                            const filteredLectures = lectures.filter(l => ((l.year === y) && (l.semester === 3)));
                            if (filteredLectures.length === 0) {
                              return <td className={classNames('history__cell--unopen')} key={`${y}-3`}>미개설</td>;
                            }
                            return <td key={`${y}-3`}><HistoryLecturesBlock lectures={filteredLectures} /></td>;
                          })}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )
            }
            <div className={classNames('divider')} />
            {
              takenLectureOfCourse.map(l => (
                <ReviewWriteBlock lecture={l} key={l.id} />
              ))
            }
            {
              (reviews == null)
                ? <div className={classNames('list-placeholder')}><div>불러오는 중</div></div>
                : (reviews.length
                  ? <div>{reviews.map(r => <ReviewBlock review={r} key={r.id} />)}</div>
                  : <div className={classNames('list-placeholder')}><div>결과 없음</div></div>)
            }
          </Scroller>
        </div>
      );
    }
    return (
      <div className={classNames('section-content', 'section-content--flex', 'section-content--course-detail')}>
        <div className={classNames('otlplus-placeholder')}>
          <div>
            OTL PLUS
          </div>
          <div>
            <Link to="/credits/">만든 사람들</Link>
            &nbsp;|&nbsp;
            <Link to="/licenses/">라이선스</Link>
          </div>
          <div>
            <a href="mailto:otlplus@sparcs.org">otlplus@sparcs.org</a>
          </div>
          <div>
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
  user: state.common.user,
  clicked: state.dictionary.courseActive.clicked,
  course: state.dictionary.courseActive.course,
  reviews: state.dictionary.courseActive.reviews,
  lectures: state.dictionary.courseActive.lectures,
});

const mapDispatchToProps = dispatch => ({
  clearCourseActiveDispatch: () => {
    dispatch(clearCourseActive());
  },
  setReviewsDispatch: (reviews) => {
    dispatch(setReviews(reviews));
  },
  setLecturesDispatch: (lectures) => {
    dispatch(setLectures(lectures));
  },
});

CourseDetailSection.propTypes = {
  user: userShape,
  clicked: PropTypes.bool.isRequired,
  course: CourseShape,
  reviews: PropTypes.arrayOf(reviewShape),
  lectures: PropTypes.arrayOf(lectureShape),
  clearCourseActiveDispatch: PropTypes.func.isRequired,
  setReviewsDispatch: PropTypes.func.isRequired,
  setLecturesDispatch: PropTypes.func.isRequired,
};


export default connect(mapStateToProps, mapDispatchToProps)(CourseDetailSection);
