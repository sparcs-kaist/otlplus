import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import axios from 'axios';

import { appBoundClassNames as classNames } from '../common/boundClassNames';
import { SEARCH } from '../reducers/dictionary/list';

import CourseListSection from '../components/sections/dictionary/CourseListSection';
import CourseDetailSection from '../components/sections/dictionary/CourseDetailSection';
import CourseListTabs from '../components/sections/dictionary/CourseListTabs';

import {
  reset as resetCourseFocus,
  setCourseFocus,
} from '../actions/dictionary/courseFocus';
import {
  reset as resetList,
  setSelectedListCode, setListCourses, clearSearchListCourses,
} from '../actions/dictionary/list';
import {
  reset as resetSearch,
  closeSearch,
} from '../actions/dictionary/search';

import courseFocusShape from '../shapes/CourseFocusShape';


class DictionaryPage extends Component {
  componentDidMount() {
    const { t } = this.props;
    // eslint-disable-next-line react/destructuring-assignment
    const { startCourseId, startTab, startSearchKeyword } = this.props.location.state || {};
    const {
      setCourseFocusDispatch, setSelectedListCodeDispatch, setListCoursesDispatch,
      closeSearchDispatch, clearSearchListCoursesDispatch,
    } = this.props;

    if (startCourseId) {
      axios.get(
        `/api/courses/${startCourseId}`,
        {
          metadata: {
            gaCategory: 'Course',
            gaVariable: 'GET / Instance',
          },
        },
      )
        .then((response) => {
          setCourseFocusDispatch(response.data, true);
        })
        .catch((error) => {
        });
    }

    if (startTab) {
      setSelectedListCodeDispatch(startTab);
    }

    if (startSearchKeyword && startSearchKeyword.trim()) {
      closeSearchDispatch();
      clearSearchListCoursesDispatch();

      axios.get(
        '/api/courses',
        {
          params: {
            keyword: startSearchKeyword,
          },
          metadata: {
            gaCategory: 'Course',
            gaVariable: 'GET / List',
          },
        },
      )
        .then((response) => {
          setListCoursesDispatch(SEARCH, response.data);
        })
        .catch((error) => {
        });
    }
    else if ((startSearchKeyword !== undefined) && (startSearchKeyword.trim().length === 0)) {
      // eslint-disable-next-line no-alert
      alert(t('ui.message.blankSearchKeyword'));
      // eslint-disable-next-line no-useless-return
      return;
    }
  }

  componentWillUnmount() {
    const { resetCourseFocusDispatch, resetListDispatch, resetSearchDispatch } = this.props;

    resetCourseFocusDispatch();
    resetListDispatch();
    resetSearchDispatch();
  }

  render() {
    const { courseFocus } = this.props;

    return (
      <>
        <section className={classNames('content', 'content--no-scroll')}>
          <div className={classNames('section-wrap', 'section-wrap--desktop-2v2--left', 'section-wrap--mobile-full', 'section-wrap--with-tabs', 'section-wrap--course-list')}>
            <CourseListTabs />
            <div className={classNames('section', 'section--with-tabs')}>
              <CourseListSection />
            </div>
          </div>
          <div className={classNames('section-wrap', 'section-wrap--desktop-2v2--right', 'section-wrap--course-detail', 'mobile-modal', ((courseFocus.course && courseFocus.clicked) ? '' : 'mobile-hidden'))}>
            <div className={classNames('section')}>
              <CourseDetailSection />
            </div>
          </div>
        </section>
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  courseFocus: state.dictionary.courseFocus,
});

const mapDispatchToProps = (dispatch) => ({
  resetCourseFocusDispatch: () => {
    dispatch(resetCourseFocus());
  },
  resetListDispatch: () => {
    dispatch(resetList());
  },
  resetSearchDispatch: () => {
    dispatch(resetSearch());
  },
  setCourseFocusDispatch: (lecture, clicked) => {
    dispatch(setCourseFocus(lecture, clicked));
  },
  setSelectedListCodeDispatch: (listCode) => {
    dispatch(setSelectedListCode(listCode));
  },
  setListCoursesDispatch: (code, courses) => {
    dispatch(setListCourses(code, courses));
  },
  closeSearchDispatch: () => {
    dispatch(closeSearch());
  },
  clearSearchListCoursesDispatch: () => {
    dispatch(clearSearchListCourses());
  },
});

DictionaryPage.propTypes = {
  location: PropTypes.shape({
    state: PropTypes.shape({
      startCourseId: PropTypes.number,
      startTab: PropTypes.string,
      startSearchKeyword: PropTypes.string,
    }),
  }).isRequired,

  courseFocus: courseFocusShape.isRequired,

  resetCourseFocusDispatch: PropTypes.func.isRequired,
  resetListDispatch: PropTypes.func.isRequired,
  resetSearchDispatch: PropTypes.func.isRequired,
  setCourseFocusDispatch: PropTypes.func.isRequired,
  setSelectedListCodeDispatch: PropTypes.func.isRequired,
  setListCoursesDispatch: PropTypes.func.isRequired,
  closeSearchDispatch: PropTypes.func.isRequired,
  clearSearchListCoursesDispatch: PropTypes.func.isRequired,
};


export default withTranslation()(connect(mapStateToProps, mapDispatchToProps)(DictionaryPage));
