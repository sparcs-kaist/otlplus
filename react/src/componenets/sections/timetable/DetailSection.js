import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import $ from 'jquery';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';
import axios from '../../../common/presetAxios';

import { BASE_URL } from '../../../common/constants';
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
      showCloseDict: false,
      reviewsLecture: null,
      reviews: null,
    };
    // eslint-disable-next-line fp/no-mutation
    this.openDictRef = React.createRef();
    // eslint-disable-next-line fp/no-mutation
    this.attributesRef = React.createRef();
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const showUnfix = (nextProps.from === 'LIST' || nextProps.from === 'TABLE') && nextProps.clicked;
    const reviews = (!nextProps.lecture || !prevState.reviewsLecture || nextProps.lecture.id !== prevState.reviewsLecture.id) ? null : prevState.reviews;
    return { showUnfix: showUnfix, reviews: reviews };
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
    const { reviews } = this.state;
    const { lecture } = this.props;

    $(`.${classNames('section-content--lecture-detail')} .nano`).nanoScroller({ scrollTop: $(this.openDictRef.current).position().top - $(this.attributesRef.current).position().top + 1 });

    if (reviews === null) {
      axios.post(`${BASE_URL}/api/timetable/comment_load`, {
        lecture_id: lecture.id,
      })
        .then((response) => {
          const newProps = this.props;
          if (newProps.lecture.id !== lecture.id) {
            return;
          }
          this.setState({ reviewsLecture: lecture, reviews: response.data });
        })
        .catch((response) => {
        });
    }
  };

  closeDictPreview = () => {
    $(`.${classNames('section-content--lecture-detail')} .nano`).nanoScroller({ scrollTop: 0 });
  };

  unfix = () => {
    const { clearLectureActiveDispatch } = this.props;
    clearLectureActiveDispatch();
  };

  render() {
    const { showUnfix, showCloseDict } = this.state;
    const { from, lecture, title, multipleDetail } = this.props;

    if (from === LIST || from === TABLE) {
      const { reviews } = this.state;
      const mapreview = (review, index) => (
        <ReviewSimpleBlock key={`review_${index}`} review={review} />
      );
      const reviewsDom = (reviews == null)
        ? <div className={classNames('list-placeholder')}><div>불러오는 중</div></div>
        : (reviews.length
          ? reviews.map(mapreview)
          : <div className={classNames('list-placeholder')}><div>결과 없음</div></div>);
      return (
      // eslint-disable-next-line react/jsx-indent
          <div className={classNames('section-content', 'section-content--lecture-detail', 'section-content--flex')}>
            <div className={classNames('title')}>
              {lecture.title}
            </div>
            <div className={classNames('subtitle')}>
              {lecture.old_code}
              {lecture.class_no.length ? ` (${lecture.class_no})` : ''}
            </div>
            <div className={classNames('buttons')}>
              <span onClick={this.unfix} className={classNames('text-button', (showUnfix ? '' : classNames('text-button--disabled')))}>고정해제</span>
              <a className={classNames('text-button', 'text-button--right')} href={`https://cais.kaist.ac.kr/syllabusInfo?year=${lecture.year}&term=${lecture.semester}&subject_no=${lecture.code}&lecture_class=${lecture.class_no}&dept_id=${lecture.department}`} target="_blank" rel="noopener noreferrer">
                실라버스
              </a>
              <Link className={classNames('text-button', 'text-button--right')} to={`/review/dictionary${lecture.old_code}`} target="_blank">
                과목사전
              </Link>
            </div>
            <div className={classNames('fixed__conditional-part', (showCloseDict ? '' : 'fixed__conditional-part--hidden'))}>
              <div className={classNames('small-title')} onClick={this.closeDictPreview}>
                <span>과목 후기</span>
                <i className={classNames('icon', 'icon--lecture-uparrow')} />
              </div>
            </div>
            <Scroller
              onScroll={
                () => {
                  if ($(this.openDictRef.current).position().top <= 0) {
                    this.setState({ showCloseDict: true });
                  }
                  else {
                    this.setState({ showCloseDict: false });
                  }
                }
              }
            >
              <div className={classNames('attributes')} ref={this.attributesRef}>
                <div>
                  <span className={classNames('fixed-ko')}>구분</span>
                  <span>{lecture.type}</span>
                </div>
                <div>
                  <span className={classNames('fixed-ko')}>학과</span>
                  <span>{lecture.department_name}</span>
                </div>
                <div>
                  <span className={classNames('fixed-ko')}>교수</span>
                  <span>{lecture.professor}</span>
                </div>
                <div>
                  <span className={classNames('fixed-ko')}>장소</span>
                  <span>{lecture.classroom}</span>
                </div>
                <div>
                  <span className={classNames('fixed-ko')}>정원</span>
                  <span>{lecture.limit}</span>
                </div>
                <div>
                  <span className={classNames('fixed-ko')}>시험</span>
                  <span>{lecture.exam}</span>
                </div>
              </div>
              <div className={classNames('scores')}>
                <div>
                  {
                    lecture.is_english
                      ? <div>Eng</div>
                      : <div className={(classNames('scores__score-text--korean'))}>한</div>
                  }
                  <div>언어</div>
                </div>
                <div>
                  {
                    lecture.credit > 0
                      ? <div>{lecture.credit}</div>
                      : <div>{lecture.credit_au}</div>
                  }
                  {
                    lecture.credit > 0
                      ? <div>학점</div>
                      : <div>AU</div>
                  }
                </div>
                <div>
                  <div>
                    {
                      lecture.limit === 0
                        ? '0.0:1'
                        : `${(lecture.num_people / lecture.limit).toFixed(1).toString()}:1`
                    }
                  </div>
                  <div>경쟁률</div>
                </div>
              </div>
              <div className={classNames('scores')}>
                <div>
                  <div>{lecture.grade_letter}</div>
                  <div>성적</div>
                </div>
                <div>
                  <div>{lecture.load_letter}</div>
                  <div>널널</div>
                </div>
                <div>
                  <div>{lecture.speech_letter}</div>
                  <div>강의</div>
                </div>
              </div>
              <div onClick={this.openDictPreview} className={classNames('small-title')} ref={this.openDictRef}>
                <span>과목 후기</span>
                <i className={classNames('icon', 'icon--lecture-downarrow')} />
              </div>
              {reviewsDom}
            </Scroller>
          </div>
      );
    }
    if (from === MULTIPLE) {
      return (
      // eslint-disable-next-line react/jsx-indent
          <div className={classNames('section-content', 'section-content--lecture-detail', 'section-content--flex')}>
            <div className={classNames('title')}>
              {title}
            </div>
            <div className={classNames('subtitle')}>
              {`${multipleDetail.length}개의 과목`}
            </div>
            <div className={classNames('buttons')}>
              <span className={classNames('text-button', 'text-button--disabled')}>고정해제</span>
              <span className={classNames('text-button', 'text-button--right', 'text-button--disabled')}>실라버스</span>
              <span className={classNames('text-button', 'text-button--right', 'text-button--disabled')}>과목사전</span>
            </div>
            <div className={classNames('attributes')}>
              {multipleDetail.map((detail, index) => (
                <div key={detail.id}>
                  <span>
                    {detail.title}
                  </span>
                  <span>
                    {detail.info}
                  </span>
                </div>
              ))}
            </div>
          </div>
      );
    }
    return (
        // eslint-disable-next-line react/jsx-indent
        <div className={classNames('section-content', 'section-content--lecture-detail', 'section-content--flex')}>
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
