import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import axios from '../../../common/presetAxios';
import { inTimetable, inCart, isListClicked, isListHover } from '../../../common/lectureFunctions';
import { BASE_URL } from '../../../common/constants';
import { openSearch, setLectureActive, clearLectureActive, addLectureToTimetable, addLectureToCart, deleteLectureFromCart, setListMajorCodes, setListLectures, setListMajorLectures } from '../../../actions/timetable/index';
import Scroller from '../../Scroller';
import SearchSubSection from './SearchSubSection';
import CourseLecturesBlock from '../../blocks/CourseLecturesBlock';
import { LIST } from '../../../reducers/timetable/lectureActive';
import userShape from '../../../shapes/UserShape';
import lectureShape from '../../../shapes/LectureShape';
import timetableShape from '../../../shapes/TimetableShape';
import lectureActiveShape from '../../../shapes/LectureActiveShape';


class ListSection extends Component {
  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props.user && (this.props.user !== prevProps.user)) {
      this.props.setListMajorCodesDispatch(this.props.user.departments);
    }

    if (!this._codesAreSame(this.props.major.codes, prevProps.major.codes)) {
      this._fetchLists(true);
    }

    if (this.props.year !== prevProps.year || this.props.semester !== prevProps.semester) {
      this._fetchLists(false);
    }
  }

  _codesAreSame = (codes1, codes2) => (
    codes1.length === codes2.length
    && codes1.every((c, i) => (c === codes2[i]))
  )

  _fetchLists = (majorOnly) => {
    const { year, semester } = this.props;
    const majorCodes = this.props.major.codes;

    axios.post(`${BASE_URL}/api/timetable/list_load_major`, {
      year: this.props.year,
      semester: this.props.semester,
    })
      .then((response) => {
        if ((this.props.year !== year || this.props.semester !== semester)
          || !this._codesAreSame(this.props.major.codes, majorCodes)
        ) {
          return;
        }
        this.props.major.codes.forEach((code) => {
          this.props.setListMajorLecturesDispatch(code, response.data.filter(lecture => (lecture.major_code === code)));
        });
      })
      .catch((response) => {
      });

    if (majorOnly) {
      return;
    }

    axios.post(`${BASE_URL}/api/timetable/list_load_humanity`, {
      year: this.props.year,
      semester: this.props.semester,
    })
      .then((response) => {
        if (this.props.year !== year || this.props.semester !== semester) {
          return;
        }
        this.props.setListLecturesDispatch('humanity', response.data);
      })
      .catch((response) => {
      });

    axios.post(`${BASE_URL}/api/timetable/wishlist_load`, {
      year: this.props.year,
      semester: this.props.semester,
    })
      .then((response) => {
        if (this.props.year !== year || this.props.semester !== semester
        ) {
          return;
        }
        this.props.setListLecturesDispatch('cart', response.data);
      })
      .catch((response) => {
      });
  }

  showSearch = () => {
    this.props.openSearchDispatch();
  }

  addToTable = lecture => (event) => {
    const { currentTimetable } = this.props;

    event.stopPropagation();
    if (
      lecture.classtimes.some(thisClasstime => (
        this.props.currentTimetable.lectures.some(timetableLecture => (
          timetableLecture.classtimes.some(classtime => (
            (classtime.day === thisClasstime.day) && (classtime.begin < thisClasstime.end) && (classtime.end > thisClasstime.begin)
          ))
        ))
      ))
    ) {
      // eslint-disable-next-line no-alert
      alert(false ? "You can't add lecture overlapping." : '시간표가 겹치는 과목은 추가할 수 없습니다.');
      return;
    }

    axios.post(`${BASE_URL}/api/timetable/table_update`, {
      table_id: this.props.currentTimetable.id,
      lecture_id: lecture.id,
      delete: false,
    })
      .then((response) => {
        if (!this.props.currentTimetable || this.props.currentTimetable.id !== currentTimetable.id) {
          return;
        }
        // TODO: Fix timetable not updated when semester unchanged and timetable changed
        this.props.addLectureToTimetableDispatch(lecture);
      })
      .catch((response) => {
      });
  }

  addToCart = lecture => (event) => {
    const { year, semester } = this.props;

    event.stopPropagation();
    axios.post(`${BASE_URL}/api/timetable/wishlist_update`, {
      lecture_id: lecture.id,
      delete: false,
    })
      .then((response) => {
        if (this.props.year !== year || (this.props.semester !== semester)
        ) {
          return;
        }
        this.props.addLectureToCartDispatch(lecture);
      })
      .catch((response) => {
      });
  }

  deleteFromCart = lecture => (event) => {
    const { year, semester } = this.props;

    event.stopPropagation();
    axios.post(`${BASE_URL}/api/timetable/wishlist_update`, {
      lecture_id: lecture.id,
      delete: true,
    })
      .then((response) => {
        if (this.props.year !== year || this.props.semester !== semester) {
          return;
        }
        this.props.deleteLectureFromCartDispatch(lecture);
      })
      .catch((response) => {
      });
  }

  listHover = lecture => () => {
    if (this.props.lectureActiveClicked) {
      return;
    }
    this.props.setLectureActiveDispatch(lecture, LIST, false);
  }

  listOut = () => {
    if (this.props.lectureActiveClicked) {
      return;
    }
    this.props.clearLectureActiveDispatch();
  }

  listClick = lecture => () => {
    if (!isListClicked(lecture, this.props.lectureActive)) {
      this.props.setLectureActiveDispatch(lecture, 'LIST', true);
    }
    else {
      this.props.setLectureActiveDispatch(lecture, 'LIST', false);
    }
  }

  render() {
    const listBlocks = (courses, fromCart) => {
      if (!courses) {
        return <div className="list-loading">불러오는 중</div>;
      }
      if (courses.length === 0) {
        return <div className="list-loading">결과 없음</div>;
      }
      return courses.map(course => (
        <div className={`list-elem${course.some(lecture => isListClicked(lecture, this.props.lectureActive)) ? ' click' : ''}`} key={course[0].course}>
          <div className="list-elem-title">
            <strong>{course[0].common_title}</strong>
            &nbsp;
            {course[0].old_code}
          </div>
          {course.map(lecture => (
            <CourseLecturesBlock
              lecture={lecture}
              key={lecture.id}
              isClicked={isListClicked(lecture, this.props.lectureActive)}
              isHover={isListHover(lecture, this.props.lectureActive)}
              inTimetable={inTimetable(lecture, this.props.currentTimetable)}
              inCart={inCart(lecture, this.props.cart)}
              fromCart={fromCart}
              addToCart={this.addToCart}
              addToTable={this.addToTable}
              deleteFromCart={this.deleteFromCart}
              listHover={this.listHover}
              listOut={this.listOut}
              listClick={this.listClick}
            />
          ))}
        </div>
      ));
    };

    if (this.props.currentList === 'SEARCH') {
      return (
        <div id="list-page-wrap">
          <div className="list-page search-page">
            { this.props.searchOpen ? <SearchSubSection /> : null }
            <div className="list-page-title search-page-title" onClick={() => this.showSearch()}>
              <i className="search-page-title-icon" />
              <div className="search-page-title-text">검색</div>
            </div>
            <Scroller>
              {listBlocks(this.props.search.courses, false)}
            </Scroller>
          </div>
        </div>
      );
    }
    if (this.props.major.codes.some(code => (this.props.currentList === code))) {
      return (
          // eslint-disable-next-line react/jsx-indent
          <div id="list-page-wrap">
            <div className="list-page major-page">
              <div className="list-page-title">
                {this.props.major[this.props.currentList].name}
              </div>
              <Scroller>
                {listBlocks(this.props.major[this.props.currentList].courses, false)}
              </Scroller>
            </div>
          </div>
      );
    }
    if (this.props.currentList === 'HUMANITY') {
      return (
        <div id="list-page-wrap">
          <div className="list-page humanity-page">
            <div className="list-page-title">
              인문사회선택
            </div>
            <Scroller>
              {listBlocks(this.props.humanity.courses, false)}
            </Scroller>
          </div>
        </div>
      );
    }
    if (this.props.currentList === 'CART') {
      return (
        <div id="list-page-wrap">
          <div className="list-page cart-page">
            <div className="list-page-title">
              장바구니
            </div>
            <Scroller>
              {listBlocks(this.props.cart.courses, true)}
            </Scroller>
          </div>
        </div>
      );
    }
    return null;
  }
}

const mapStateToProps = state => ({
  user: state.common.user,
  currentList: state.timetable.list.currentList,
  search: state.timetable.list.search,
  major: state.timetable.list.major,
  humanity: state.timetable.list.humanity,
  cart: state.timetable.list.cart,
  currentTimetable: state.timetable.timetable.currentTimetable,
  lectureActive: state.timetable.lectureActive,
  lectureActiveClicked: state.timetable.lectureActive.clicked,
  year: state.timetable.semester.year,
  semester: state.timetable.semester.semester,
  searchOpen: state.timetable.search.open,
});

const mapDispatchToProps = dispatch => ({
  openSearchDispatch: () => {
    dispatch(openSearch());
  },
  setLectureActiveDispatch: (lecture, from, clicked) => {
    dispatch(setLectureActive(lecture, from, clicked));
  },
  clearLectureActiveDispatch: () => {
    dispatch(clearLectureActive());
  },
  addLectureToTimetableDispatch: (lecture) => {
    dispatch(addLectureToTimetable(lecture));
  },
  addLectureToCartDispatch: (lecture) => {
    dispatch(addLectureToCart(lecture));
  },
  deleteLectureFromCartDispatch: (lecture) => {
    dispatch(deleteLectureFromCart(lecture));
  },
  setListMajorCodesDispatch: (majors) => {
    dispatch(setListMajorCodes(majors));
  },
  setListLecturesDispatch: (code, lectures) => {
    dispatch(setListLectures(code, lectures));
  },
  setListMajorLecturesDispatch: (majorCode, lectures) => {
    dispatch(setListMajorLectures(majorCode, lectures));
  },
});

ListSection.propTypes = {
  user: userShape,
  currentList: PropTypes.string.isRequired,
  search: PropTypes.shape({
    courses: PropTypes.arrayOf(PropTypes.arrayOf(lectureShape)),
  }).isRequired,
  major: PropTypes.shape({
    codes: PropTypes.arrayOf(PropTypes.string).isRequired,
  }).isRequired,
  humanity: PropTypes.shape({
    courses: PropTypes.arrayOf(PropTypes.arrayOf(lectureShape)),
  }).isRequired,
  cart: PropTypes.shape({
    courses: PropTypes.arrayOf(PropTypes.arrayOf(lectureShape)),
  }).isRequired,
  currentTimetable: timetableShape,
  lectureActive: lectureActiveShape.isRequired,
  lectureActiveClicked: PropTypes.bool.isRequired,
  year: PropTypes.number,
  semester: PropTypes.number,
  searchOpen: PropTypes.bool.isRequired,
  openSearchDispatch: PropTypes.func.isRequired,
  setLectureActiveDispatch: PropTypes.func.isRequired,
  clearLectureActiveDispatch: PropTypes.func.isRequired,
  addLectureToTimetableDispatch: PropTypes.func.isRequired,
  addLectureToCartDispatch: PropTypes.func.isRequired,
  deleteLectureFromCartDispatch: PropTypes.func.isRequired,
  setListMajorCodesDispatch: PropTypes.func.isRequired,
  setListLecturesDispatch: PropTypes.func.isRequired,
  setListMajorLecturesDispatch: PropTypes.func.isRequired,
};


export default connect(mapStateToProps, mapDispatchToProps)(ListSection);
