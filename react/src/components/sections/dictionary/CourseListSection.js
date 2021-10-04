import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import ReactGA from 'react-ga';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';

import {
  SEARCH, BASIC, HUMANITY, TAKEN,
} from '../../../reducers/dictionary/list';

import Scroller from '../../Scroller';
import CourseSearchSubSection from './CourseSearchSubSection';
import CourseBlock from '../../blocks/CourseBlock';

import { isClicked, isHovered, isDimmedCourse } from '../../../utils/courseUtils';
import { setCourseFocus, clearCourseFocus } from '../../../actions/dictionary/courseFocus';
import { openSearch } from '../../../actions/dictionary/search';

import courseShape from '../../../shapes/CourseShape';
import courseFocusShape from '../../../shapes/CourseFocusShape';
import courseListsShape from '../../../shapes/CourseListsShape';
import userShape from '../../../shapes/UserShape';
import courseLastSearchOptionShape from '../../../shapes/CourseLastSearchOptionShape';

import {
  getLabelOfValue, getDepartmentOptions, getTypeOptions, getLevelOptions, getTermOptions,
} from '../../../common/seachOptions';


class CourseListSection extends Component {
  showSearch = () => {
    const { openSearchDispatch } = this.props;
    openSearchDispatch();
  }


  focusCourseWithHover = (course) => {
    const { courseFocus, setCourseFocusDispatch } = this.props;

    if (courseFocus.clicked) {
      return;
    }
    setCourseFocusDispatch(course, false);
  }

  unfocusCourseWithHover = (course) => {
    const { courseFocus, clearCourseFocusDispatch } = this.props;

    if (courseFocus.clicked) {
      return;
    }
    clearCourseFocusDispatch();
  }

  focusCourseWithClick = (course) => {
    const { courseFocus, selectedListCode, setCourseFocusDispatch } = this.props;

    if (!isClicked(course, courseFocus)) {
      setCourseFocusDispatch(course, true);

      const labelOfTabs = new Map([
        [SEARCH, 'Search'],
        [BASIC, 'Basic'],
        [HUMANITY, 'Humanity'],
        [TAKEN, 'Taken'],
      ]);
      ReactGA.event({
        category: 'Dictionary - Selection',
        action: 'Selected Course',
        label: `Course : ${course.id} / From : Course List : ${labelOfTabs.get(selectedListCode) || selectedListCode}`,
      });
    }
    else {
      setCourseFocusDispatch(course, false);

      const labelOfTabs = new Map([
        [SEARCH, 'Search'],
        [BASIC, 'Basic'],
        [HUMANITY, 'Humanity'],
        [TAKEN, 'Taken'],
      ]);
      ReactGA.event({
        category: 'Dictionary - Selection',
        action: 'Unselected Course',
        label: `Course : ${course.id} / From : Course List : ${labelOfTabs.get(selectedListCode) || selectedListCode}`,
      });
    }
  }


  _getCourses = (selectedListCode) => {
    const {
      lists,
    } = this.props;

    if (!lists[selectedListCode]) {
      return null;
    }
    return lists[selectedListCode].courses;
  }


  render() {
    const { t } = this.props;
    const {
      user,
      courseFocus, selectedListCode,
      searchOpen, lastSearchOption,
      readCourses,
    } = this.props;

    const getListTitle = () => {
      if (selectedListCode === SEARCH) {
        const lastSearchOptionText = Object.entries(lastSearchOption)
          .map((e) => {
            if (e[0] === 'keyword' && e[1].length > 0) {
              return e[1];
            }
            if (e[0] === 'type' && !e[1].includes('ALL')) {
              return e[1].map((c) => getLabelOfValue(getTypeOptions(), c));
            }
            if (e[0] === 'department' && !e[1].includes('ALL')) {
              return e[1].map((c) => getLabelOfValue(getDepartmentOptions(), c));
            }
            if (e[0] === 'grade' && !e[1].includes('ALL')) {
              return e[1].map((c) => getLabelOfValue(getLevelOptions(), c));
            }
            if (e[0] === 'term' && !e[1].includes('ALL')) {
              return e[1].map((c) => getLabelOfValue(getTermOptions(), c));
            }
            return [];
          })
          .flat(1)
          .join(', ');
        return (
          <div className={classNames('title', 'title--search')} onClick={() => this.showSearch()}>
            <i className={classNames('icon', 'icon--search')} />
            <span>{t('ui.tab.search')}</span>
            <span>{lastSearchOptionText.length > 0 ? `:${lastSearchOptionText}` : ''}</span>
          </div>
        );
      }
      if (selectedListCode === BASIC) {
        return (
          <div className={classNames('title')}>
            {t('ui.tab.basic')}
          </div>
        );
      }
      if (user && user.departments.some((d) => (selectedListCode === d.code))) {
        const department = user.departments.find((d) => (selectedListCode === d.code));
        return (
          <div className={classNames('title')}>
            {`${department[t('js.property.name')]} ${t('ui.tab.major')}`}
          </div>
        );
      }
      if (selectedListCode === HUMANITY) {
        return (
          <div className={classNames('title')}>
            {t('ui.tab.humanity')}
          </div>
        );
      }
      if (selectedListCode === TAKEN) {
        return (
          <div className={classNames('title')}>
            {t('ui.tab.taken')}
          </div>
        );
      }
      return null;
    };

    const getListElement = () => {
      const courses = this._getCourses(selectedListCode);
      if (!courses) {
        return <div className={classNames('list-placeholder')}><div>{t('ui.placeholder.loading')}</div></div>;
      }
      if (courses.length === 0) {
        return <div className={classNames('list-placeholder')}><div>{t('ui.placeholder.noResults')}</div></div>;
      }
      return (
        <Scroller key={selectedListCode}>
          <div className={classNames('block-list')}>
            {
              courses.map((c) => (
                <CourseBlock
                  course={c}
                  key={c.id}
                  shouldShowReadStatus={true}
                  isRead={c.userspecific_is_read || readCourses.some((c2) => (c2.id === c.id))}
                  isRaised={isClicked(c, courseFocus)}
                  isDimmed={isDimmedCourse(c, courseFocus)}
                  onMouseOver={this.focusCourseWithHover}
                  onMouseOut={this.unfocusCourseWithHover}
                  onClick={this.focusCourseWithClick}
                />
              ))
            }
          </div>
        </Scroller>
      );
    };

    return (
      <div className={classNames('section', 'section--course-list')}>
        <div className={classNames('section-content', 'section-content--flex', 'section-content--course-list')}>
          { ((selectedListCode === SEARCH) && searchOpen) ? <CourseSearchSubSection /> : null }
          { getListTitle() }
          { getListElement() }
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.common.user.user,
  selectedListCode: state.dictionary.list.selectedListCode,
  lists: state.dictionary.list.lists,
  readCourses: state.dictionary.list.readCourses,
  courseFocus: state.dictionary.courseFocus,
  searchOpen: state.dictionary.search.open,
  lastSearchOption: state.dictionary.search.lastSearchOption,
});

const mapDispatchToProps = (dispatch) => ({
  openSearchDispatch: () => {
    dispatch(openSearch());
  },
  setCourseFocusDispatch: (lecture, clicked) => {
    dispatch(setCourseFocus(lecture, clicked));
  },
  clearCourseFocusDispatch: () => {
    dispatch(clearCourseFocus());
  },
});

CourseListSection.propTypes = {
  user: userShape,
  selectedListCode: PropTypes.string.isRequired,
  lists: courseListsShape,
  readCourses: PropTypes.arrayOf(courseShape).isRequired,
  courseFocus: courseFocusShape.isRequired,
  searchOpen: PropTypes.bool.isRequired,
  lastSearchOption: courseLastSearchOptionShape.isRequired,

  openSearchDispatch: PropTypes.func.isRequired,
  setCourseFocusDispatch: PropTypes.func.isRequired,
  clearCourseFocusDispatch: PropTypes.func.isRequired,
};


export default withTranslation()(
  connect(mapStateToProps, mapDispatchToProps)(
    CourseListSection
  )
);
