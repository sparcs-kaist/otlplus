import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';
import axios from '../../../common/presetAxios';

import { isClicked, isHover } from '../../../common/courseFunctions';
import { /* openSearch, */setListMajorCodes, setListCourses, setListMajorCourses } from '../../../actions/dictionary/list';
import { setCourseActive, clearCourseActive } from '../../../actions/dictionary/courseActive';
import { BASE_URL } from '../../../common/constants';
import Scroller from '../../Scroller';
import CourseBlock from '../../blocks/CourseBlock';
import userShape from '../../../shapes/UserShape';
import courseShape from '../../../shapes/CourseShape';
import courseActiveShape from '../../../shapes/CourseActiveShape';
import CourseSearchSubSection from './CourseSearchSubSection';


class CourseListSection extends Component {
  componentDidMount() {
    this._fetchLists(false);
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const { user, major, setListMajorCodesDispatch/* , openSearchDispatch */ } = this.props;

    if (user && (user !== prevProps.user)) {
      setListMajorCodesDispatch(user.departments);
    }

    if (!this._codesAreSame(major.codes, prevProps.major.codes)) {
      this._fetchLists(true);
    }
  }

  _codesAreSame = (codes1, codes2) => (
    codes1.length === codes2.length
    && codes1.every((c, i) => (c === codes2[i]))
  )

  _fetchLists = (majorOnly) => {
    const { major, setListMajorCoursesDispatch, setListCoursesDispatch } = this.props;
    const majorCodes = major.codes;

    axios.get(`${BASE_URL}/api/courses`, { params: {
      group: majorCodes,
    } })
      .then((response) => {
        const newProps = this.props;
        if (!this._codesAreSame(newProps.major.codes, majorCodes)) {
          return;
        }
        major.codes.forEach((code) => {
          setListMajorCoursesDispatch(code, response.data.filter(lecture => (lecture.major_code === code)));
        });
      })
      .catch((response) => {
      });

    if (majorOnly) {
      return;
    }

    axios.get(`${BASE_URL}/api/courses`, { params: {
      group: 'Humanity',
    } })
      .then((response) => {
        setListCoursesDispatch('humanity', response.data);
      })
      .catch((response) => {
      });

    /*
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
    */
  }

  showSearch = () => {
    /*
    const { openSearchDispatch } = this.props;
    openSearchDispatch();
    */
  }


  listHover = course => () => {
    const { courseActiveClicked, setCourseActiveDispatch } = this.props;

    if (courseActiveClicked) {
      return;
    }
    setCourseActiveDispatch(course, false);
  }

  listOut = () => {
    const { courseActiveClicked, clearCourseActiveDispatch } = this.props;

    if (courseActiveClicked) {
      return;
    }
    clearCourseActiveDispatch();
  }

  listClick = course => () => {
    const { courseActive, setCourseActiveDispatch } = this.props;

    if (!isClicked(course, courseActive)) {
      setCourseActiveDispatch(course, true);
    }
    else {
      setCourseActiveDispatch(course, false);
    }
  }


  render() {
    const { courseActive, currentTimetable, currentList, searchOpen, search, major, humanity, taken } = this.props;

    const mapCourses = (courses) => {
      if (!courses) {
        return <div className={classNames('list-placeholder')}><div>불러오는 중</div></div>;
      }
      if (courses.length === 0) {
        return <div className={classNames('list-placeholder')}><div>결과 없음</div></div>;
      }
      return courses.map(c => (
        <CourseBlock
          course={c}
          key={c.id}
          isClicked={isClicked(c, courseActive)}
          isHover={isHover(c, courseActive)}
          listHover={this.listHover}
          listOut={this.listOut}
          listClick={this.listClick}
        />
      ));
    };

    if (currentList === 'SEARCH') {
      return (
      // eslint-disable-next-line react/jsx-indent
      <div className={classNames('section-content', 'section-content--flex', 'section-content--course-list')}>
        { true ? <CourseSearchSubSection /> : null }
        <div className={classNames('title', 'title--search')} onClick={() => this.showSearch()}>
          <i className={classNames('icon', 'icon--search')} />
          <span>검색</span>
        </div>
        <Scroller>
          { mapCourses(search.courses) }
        </Scroller>
      </div>
      );
    }
    if (major.codes.some(code => (currentList === code))) {
      return (
      // eslint-disable-next-line react/jsx-indent
      <div className={classNames('section-content', 'section-content--flex', 'section-content--course-list')}>
        <div className={classNames('title')}>
          {major[currentList].name}
        </div>
        <Scroller>
          { mapCourses(major[currentList].courses) }
        </Scroller>
      </div>
      );
    }
    if (currentList === 'HUMANITY') {
      return (
      // eslint-disable-next-line react/jsx-indent
      <div className={classNames('section-content', 'section-content--flex', 'section-content--course-list')}>
        <div className={classNames('title')}>
          인문사회선택
        </div>
        <Scroller>
          { mapCourses(humanity.courses) }
        </Scroller>
      </div>
      );
    }
    if (currentList === 'TAKEN') {
      return (
      // eslint-disable-next-line react/jsx-indent
      <div className={classNames('section-content', 'section-content--flex', 'section-content--course-list')}>
        <div className={classNames('title')}>
          내가 들은 과목
        </div>
        <Scroller>
          { mapCourses(taken.courses) }
        </Scroller>
      </div>
      );
    }
    return null;
  }
}

const mapStateToProps = state => ({
  user: state.common.user,
  currentList: state.dictionary.list.currentList,
  search: state.dictionary.list.search,
  major: state.dictionary.list.major,
  humanity: state.dictionary.list.humanity,
  taken: state.dictionary.list.taken,
  courseActive: state.dictionary.courseActive,
  courseActiveClicked: state.dictionary.courseActive.clicked,
  // searchOpen: state.dictionary.search.open,
});

const mapDispatchToProps = dispatch => ({
  /*
  openSearchDispatch: () => {
    dispatch(openSearch());
  },
  */
  setCourseActiveDispatch: (lecture, from, clicked) => {
    dispatch(setCourseActive(lecture, from, clicked));
  },
  clearCourseActiveDispatch: () => {
    dispatch(clearCourseActive());
  },
  setListMajorCodesDispatch: (majors) => {
    dispatch(setListMajorCodes(majors));
  },
  setListCoursesDispatch: (code, courses) => {
    dispatch(setListCourses(code, courses));
  },
  setListMajorCoursesDispatch: (majorCode, courses) => {
    dispatch(setListMajorCourses(majorCode, courses));
  },
});

CourseListSection.propTypes = {
  user: userShape,
  currentList: PropTypes.string.isRequired,
  search: PropTypes.shape({
    courses: PropTypes.arrayOf(courseShape),
  }).isRequired,
  major: PropTypes.shape({
    codes: PropTypes.arrayOf(PropTypes.string).isRequired,
  }).isRequired,
  humanity: PropTypes.shape({
    courses: PropTypes.arrayOf(courseShape),
  }).isRequired,
  taken: PropTypes.shape({
    courses: PropTypes.arrayOf(courseShape),
  }).isRequired,
  courseActive: courseActiveShape.isRequired,
  courseActiveClicked: PropTypes.bool.isRequired,
  // searchOpen: PropTypes.bool.isRequired,
  // openSearchDispatch: PropTypes.func.isRequired,
  setCourseActiveDispatch: PropTypes.func.isRequired,
  clearCourseActiveDispatch: PropTypes.func.isRequired,
  setListMajorCodesDispatch: PropTypes.func.isRequired,
  setListCoursesDispatch: PropTypes.func.isRequired,
  setListMajorCoursesDispatch: PropTypes.func.isRequired,
};


export default connect(mapStateToProps, mapDispatchToProps)(CourseListSection);
