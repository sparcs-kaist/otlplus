import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { appBoundClassNames as classNames } from '../common/boundClassNames';

import CourseListSection from '../components/sections/dictionary/CourseListSection';
import CourseDetailSection from '../components/sections/dictionary/CourseDetailSection';
import CourseListTabs from '../components/tabs/CourseListTabs';
import courseActiveShape from '../shapes/CourseActiveShape';

import { reset as resetCourseActive, setCourseActive } from '../actions/dictionary/courseActive';
import { reset as resetList, setCurrentList, setListCourses } from '../actions/dictionary/list';
import { reset as resetSearch } from '../actions/dictionary/search';

import axios from '../common/presetAxios';
import { BASE_URL } from '../common/constants';


class DictionaryPage extends Component {
  componentDidMount() {
    // eslint-disable-next-line react/destructuring-assignment
    const { startCourseId, startTab, startSearchKeyword } = this.props.location.state || {};
    const { setCourseActiveDispatch, setCurrentListDispatch, setListCoursesDispatch } = this.props;

    if (startCourseId) {
      axios.get(`${BASE_URL}/api/courses/${startCourseId}`, {
      })
        .then((response) => {
          setCourseActiveDispatch(response.data, true);
        })
        .catch((response) => {
        });
    }

    if (startTab) {
      setCurrentListDispatch(startTab);
    }

    if (startSearchKeyword) {
      axios.get(`${BASE_URL}/api/courses`, { params: {
        keyword: startSearchKeyword,
      } })
        .then((response) => {
          setListCoursesDispatch('search', response.data);
        })
        .catch((response) => {
        });
    }
  }

  componentWillUnmount() {
    const { resetCourseActiveDispatch, resetListDispatch, resetSearchDispatch } = this.props;

    resetCourseActiveDispatch();
    resetListDispatch();
    resetSearchDispatch();
  }

  render() {
    const { courseActive } = this.props;

    return (
      <>
        <section className={classNames('content', 'content--no-scroll')}>
          <div className={classNames('section-wrap', 'section-wrap--with-tabs', 'section-wrap--course-list')}>
            <CourseListTabs />
            <div className={classNames('section', 'section--with-tabs')}>
              <CourseListSection />
            </div>
          </div>
          <div className={classNames('section-wrap', 'section-wrap--course-detail', 'mobile-modal', ((courseActive.course && courseActive.clicked) ? '' : 'mobile-hidden'))}>
            <div className={classNames('section')}>
              <CourseDetailSection />
            </div>
          </div>
        </section>
      </>
    );
  }
}

const mapStateToProps = state => ({
  courseActive: state.dictionary.courseActive,
});

const mapDispatchToProps = dispatch => ({
  resetCourseActiveDispatch: () => {
    dispatch(resetCourseActive());
  },
  resetListDispatch: () => {
    dispatch(resetList());
  },
  resetSearchDispatch: () => {
    dispatch(resetSearch());
  },
  setCourseActiveDispatch: (lecture, clicked) => {
    dispatch(setCourseActive(lecture, clicked));
  },
  setCurrentListDispatch: (list) => {
    dispatch(setCurrentList(list));
  },
  setListCoursesDispatch: (code, courses) => {
    dispatch(setListCourses(code, courses));
  },
});

DictionaryPage.propTypes = {
  courseActive: courseActiveShape.isRequired,
  location: PropTypes.shape({
    state: PropTypes.shape({
      startCourseId: PropTypes.number,
      startTab: PropTypes.string,
      startSearchKeyword: PropTypes.string,
    }),
  }).isRequired,
  resetCourseActiveDispatch: PropTypes.func.isRequired,
  resetListDispatch: PropTypes.func.isRequired,
  resetSearchDispatch: PropTypes.func.isRequired,
  setCourseActiveDispatch: PropTypes.func.isRequired,
  setCurrentListDispatch: PropTypes.func.isRequired,
  setListCoursesDispatch: PropTypes.func.isRequired,
};


export default connect(mapStateToProps, mapDispatchToProps)(DictionaryPage);
