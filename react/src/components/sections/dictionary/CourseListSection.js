import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import ReactGA from 'react-ga';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';

import Scroller from '../../Scroller';
import CourseSearchSubSection from './CourseSearchSubSection';
import CourseBlock from '../../blocks/CourseBlock';

import { isClicked, isHover, isInactiveCourse } from '../../../common/courseFunctions';
import { setCourseActive, clearCourseActive } from '../../../actions/dictionary/courseActive';
import { openSearch } from '../../../actions/dictionary/search';

import courseShape from '../../../shapes/CourseShape';
import courseActiveShape from '../../../shapes/CourseActiveShape';


class CourseListSection extends Component {
  showSearch = () => {
    const { openSearchDispatch } = this.props;
    openSearchDispatch();
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
    const { courseActive, currentList, setCourseActiveDispatch } = this.props;

    if (!isClicked(course, courseActive)) {
      setCourseActiveDispatch(course, true);

      const labelOfTabs = new Map([
        ['SEARCH', 'Search'],
        ['HUMANITY', 'Humanity'],
        ['TAKEN', 'Taken'],
      ]);
      ReactGA.event({
        category: 'Dictionary - Selection',
        action: 'Selected Course',
        label: `Course : ${course.id} / From : Course List : ${labelOfTabs.get(currentList) || currentList}`,
      });
    }
    else {
      setCourseActiveDispatch(course, false);

      const labelOfTabs = new Map([
        ['SEARCH', 'Search'],
        ['HUMANITY', 'Humanity'],
        ['TAKEN', 'Taken'],
      ]);
      ReactGA.event({
        category: 'Dictionary - Selection',
        action: 'Unselected Course',
        label: `Course : ${course.id} / From : Course List : ${labelOfTabs.get(currentList) || currentList}`,
      });
    }
  }


  render() {
    const { t } = this.props;
    const { courseActive, currentList, searchOpen,
      search, major, humanity, taken, readCourses } = this.props;

    const mapCourses = (courses) => {
      if (!courses) {
        return <div className={classNames('list-placeholder')}><div>{t('ui.placeholder.loading')}</div></div>;
      }
      if (courses.length === 0) {
        return <div className={classNames('list-placeholder')}><div>{t('ui.placeholder.noResults')}</div></div>;
      }
      return courses.map(c => (
        <CourseBlock
          course={c}
          key={c.id}
          showReadStatus={true}
          isRead={c.userspecific_is_read || readCourses.some(c2 => (c2.id === c.id))}
          isClicked={isClicked(c, courseActive)}
          isHover={isHover(c, courseActive)}
          isInactive={isInactiveCourse(c, courseActive)}
          listHover={this.listHover}
          listOut={this.listOut}
          listClick={this.listClick}
        />
      ));
    };

    if (currentList === 'SEARCH') {
      return (
        <div className={classNames('section-content', 'section-content--flex', 'section-content--course-list')}>
          { searchOpen ? <CourseSearchSubSection /> : null }
          <div className={classNames('title', 'title--search')} onClick={() => this.showSearch()}>
            <i className={classNames('icon', 'icon--search')} />
            <span>{t('ui.tab.search')}</span>
          </div>
          <Scroller key={currentList}>
            { mapCourses(search.courses) }
          </Scroller>
        </div>
      );
    }
    if (major.codes.some(code => (currentList === code))) {
      return (
        <div className={classNames('section-content', 'section-content--flex', 'section-content--course-list')}>
          <div className={classNames('title')}>
            {major[currentList][t('js.property.name')]}
          </div>
          <Scroller key={currentList}>
            { mapCourses(major[currentList].courses) }
          </Scroller>
        </div>
      );
    }
    if (currentList === 'HUMANITY') {
      return (
        <div className={classNames('section-content', 'section-content--flex', 'section-content--course-list')}>
          <div className={classNames('title')}>
            {t('ui.tab.humanity')}
          </div>
          <Scroller key={currentList}>
            { mapCourses(humanity.courses) }
          </Scroller>
        </div>
      );
    }
    if (currentList === 'TAKEN') {
      return (
        <div className={classNames('section-content', 'section-content--flex', 'section-content--course-list')}>
          <div className={classNames('title')}>
            {t('ui.tab.taken')}
          </div>
          <Scroller key={currentList}>
            { mapCourses(taken.courses) }
          </Scroller>
        </div>
      );
    }
    return null;
  }
}

const mapStateToProps = state => ({
  currentList: state.dictionary.list.currentList,
  search: state.dictionary.list.search,
  major: state.dictionary.list.major,
  humanity: state.dictionary.list.humanity,
  taken: state.dictionary.list.taken,
  readCourses: state.dictionary.list.readCourses,
  courseActive: state.dictionary.courseActive,
  courseActiveClicked: state.dictionary.courseActive.clicked,
  searchOpen: state.dictionary.search.open,
});

const mapDispatchToProps = dispatch => ({
  openSearchDispatch: () => {
    dispatch(openSearch());
  },
  setCourseActiveDispatch: (lecture, clicked) => {
    dispatch(setCourseActive(lecture, clicked));
  },
  clearCourseActiveDispatch: () => {
    dispatch(clearCourseActive());
  },
});

CourseListSection.propTypes = {
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
  readCourses: PropTypes.arrayOf(courseShape).isRequired,
  courseActive: courseActiveShape.isRequired,
  courseActiveClicked: PropTypes.bool.isRequired,
  searchOpen: PropTypes.bool.isRequired,

  openSearchDispatch: PropTypes.func.isRequired,
  setCourseActiveDispatch: PropTypes.func.isRequired,
  clearCourseActiveDispatch: PropTypes.func.isRequired,
};


export default withTranslation()(connect(mapStateToProps, mapDispatchToProps)(CourseListSection));
