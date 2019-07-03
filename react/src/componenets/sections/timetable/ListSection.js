import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { appBoundClassNames as classNames, timetableBoundClassNames } from '../../../common/boundClassNames';
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
    const { user, major, year, semester, currentList, setListMajorCodesDispatch, openSearchDispatch } = this.props;

    if (user && (user !== prevProps.user)) {
      setListMajorCodesDispatch(user.departments);
    }

    if (!this._codesAreSame(major.codes, prevProps.major.codes)) {
      this._fetchLists(true);
    }

    if (year !== prevProps.year || semester !== prevProps.semester) {
      this._fetchLists(false);

      if (currentList === 'SEARCH') {
        openSearchDispatch();
      }
    }
  }

  _codesAreSame = (codes1, codes2) => (
    codes1.length === codes2.length
    && codes1.every((c, i) => (c === codes2[i]))
  )

  _fetchLists = (majorOnly) => {
    const { year, semester, major, setListMajorLecturesDispatch, setListLecturesDispatch } = this.props;
    const majorCodes = major.codes;

    axios.get(`${BASE_URL}/api/lectures`, { params: {
      year: year,
      semester: semester,
      group: majorCodes,
    } })
      .then((response) => {
        const newProps = this.props;
        if ((newProps.year !== year || newProps.semester !== semester)
          || !this._codesAreSame(newProps.major.codes, majorCodes)
        ) {
          return;
        }
        major.codes.forEach((code) => {
          setListMajorLecturesDispatch(code, response.data.filter(lecture => (lecture.major_code === code)));
        });
      })
      .catch((response) => {
      });

    if (majorOnly) {
      return;
    }

    axios.get(`${BASE_URL}/api/lectures`, { params: {
      year: year,
      semester: semester,
      group: 'Humanity',
    } })
      .then((response) => {
        const newProps = this.props;
        if (newProps.year !== year || newProps.semester !== semester) {
          return;
        }
        setListLecturesDispatch('humanity', response.data);
      })
      .catch((response) => {
      });

    axios.post(`${BASE_URL}/api/timetable/wishlist_load`, {
      year: year,
      semester: semester,
    })
      .then((response) => {
        const newProps = this.props;
        if (newProps.year !== year || newProps.semester !== semester
        ) {
          return;
        }
        setListLecturesDispatch('cart', response.data);
      })
      .catch((response) => {
      });
  }

  showSearch = () => {
    const { openSearchDispatch } = this.props;
    openSearchDispatch();
  }

  addToTable = lecture => (event) => {
    const { currentTimetable, addLectureToTimetableDispatch } = this.props;

    event.stopPropagation();
    if (
      lecture.classtimes.some(thisClasstime => (
        currentTimetable.lectures.some(timetableLecture => (
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
      table_id: currentTimetable.id,
      lecture_id: lecture.id,
      delete: false,
    })
      .then((response) => {
        const newProps = this.props;
        if (!newProps.currentTimetable || newProps.currentTimetable.id !== currentTimetable.id) {
          return;
        }
        // TODO: Fix timetable not updated when semester unchanged and timetable changed
        addLectureToTimetableDispatch(lecture);
      })
      .catch((response) => {
      });
  }

  addToCart = lecture => (event) => {
    const { year, semester, addLectureToCartDispatch } = this.props;

    event.stopPropagation();
    axios.post(`${BASE_URL}/api/timetable/wishlist_update`, {
      lecture_id: lecture.id,
      delete: false,
    })
      .then((response) => {
        const newProps = this.props;
        if (newProps.year !== year || (newProps.semester !== semester)
        ) {
          return;
        }
        addLectureToCartDispatch(lecture);
      })
      .catch((response) => {
      });
  }

  deleteFromCart = lecture => (event) => {
    const { year, semester, deleteLectureFromCartDispatch } = this.props;

    event.stopPropagation();
    axios.post(`${BASE_URL}/api/timetable/wishlist_update`, {
      lecture_id: lecture.id,
      delete: true,
    })
      .then((response) => {
        const newProps = this.props;
        if (newProps.year !== year || newProps.semester !== semester) {
          return;
        }
        deleteLectureFromCartDispatch(lecture);
      })
      .catch((response) => {
      });
  }

  listHover = lecture => () => {
    const { lectureActiveClicked, setLectureActiveDispatch } = this.props;

    if (lectureActiveClicked) {
      return;
    }
    setLectureActiveDispatch(lecture, LIST, false);
  }

  listOut = () => {
    const { lectureActiveClicked, clearLectureActiveDispatch } = this.props;

    if (lectureActiveClicked) {
      return;
    }
    clearLectureActiveDispatch();
  }

  listClick = lecture => () => {
    const { lectureActive, setLectureActiveDispatch } = this.props;

    if (!isListClicked(lecture, lectureActive)) {
      setLectureActiveDispatch(lecture, 'LIST', true);
    }
    else {
      setLectureActiveDispatch(lecture, 'LIST', false);
    }
  }

  render() {
    const { lectureActive, currentTimetable, currentList, searchOpen, search, major, humanity, cart } = this.props;

    const listBlocks = (courses, fromCart) => {
      if (!courses) {
        return <div className={classNames('list-placeholder')}><div>불러오는 중</div></div>;
      }
      if (courses.length === 0) {
        return <div className={classNames('list-placeholder')}><div>결과 없음</div></div>;
      }
      return courses.map(course => (
        <div className={timetableBoundClassNames('list-elem', (course.some(lecture => isListClicked(lecture, lectureActive)) ? 'click' : ''))} key={course[0].course}>
          <div className={timetableBoundClassNames('list-elem-title')}>
            <strong>{course[0].common_title}</strong>
            &nbsp;
            {course[0].old_code}
          </div>
          {course.map(lecture => (
            <CourseLecturesBlock
              lecture={lecture}
              key={lecture.id}
              isClicked={isListClicked(lecture, lectureActive)}
              isHover={isListHover(lecture, lectureActive)}
              inTimetable={inTimetable(lecture, currentTimetable)}
              inCart={inCart(lecture, cart)}
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

    if (currentList === 'SEARCH') {
      return (
      // eslint-disable-next-line react/jsx-indent
          <div className={classNames('section-content', 'section-content--flex', 'section-content--lecture-list')}>
            { searchOpen ? <SearchSubSection /> : null }
            <div className={classNames('title', 'title--search')} onClick={() => this.showSearch()}>
              <i className={classNames('icon', 'icon--search')} />
              <span>검색</span>
            </div>
            <Scroller>
              {listBlocks(search.courses, false)}
            </Scroller>
          </div>
      );
    }
    if (major.codes.some(code => (currentList === code))) {
      return (
      // eslint-disable-next-line react/jsx-indent
            <div className={classNames('section-content', 'section-content--flex', 'section-content--lecture-list')}>
              <div className={classNames('title')}>
                {major[currentList].name}
              </div>
              <Scroller>
                {listBlocks(major[currentList].courses, false)}
              </Scroller>
            </div>
      );
    }
    if (currentList === 'HUMANITY') {
      return (
      // eslint-disable-next-line react/jsx-indent
          <div className={classNames('section-content', 'section-content--flex', 'section-content--lecture-list')}>
            <div className={classNames('title')}>
              인문사회선택
            </div>
            <Scroller>
              {listBlocks(humanity.courses, false)}
            </Scroller>
          </div>
      );
    }
    if (currentList === 'CART') {
      return (
      // eslint-disable-next-line react/jsx-indent
          <div className={classNames('section-content', 'section-content--flex', 'section-content--lecture-list')}>
            <div className={classNames('title')}>
              장바구니
            </div>
            <Scroller>
              {listBlocks(cart.courses, true)}
            </Scroller>
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
