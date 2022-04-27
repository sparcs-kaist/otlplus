import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import ReactGA from 'react-ga';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';

import { CourseListCode } from '../../../reducers/planner/list';

import Scroller from '../../Scroller';
import CourseSearchSubSection from '../planner/CourseSearchSubSection';
import PlannerCourseBlock from '../../blocks/PlannerCourseBlock';

import { isFocused, isDimmedCourse } from '../../../utils/courseUtils';
import { setCourseFocus, clearCourseFocus } from '../../../actions/planner/courseFocus';
import { openSearch } from '../../../actions/planner/search';

import courseShape from '../../../shapes/model/CourseShape';
import courseFocusShape from '../../../shapes/state/CourseFocusShape';
import courseListsShape from '../../../shapes/state/CourseListsShape';
import userShape from '../../../shapes/model/UserShape';
import courseLastSearchOptionShape from '../../../shapes/state/CourseLastSearchOptionShape';

import {
  getLabelOfValue, getDepartmentOptions, getTypeOptions, getLevelOptions, getTermOptions,
} from '../../../common/seachOptions';


class CourseListSection extends Component {
  showSearch = () => {
    const { openSearchDispatch } = this.props;
    openSearchDispatch();
  }


  focusCourseWithClick = (course) => {
    const {
      courseFocus, selectedListCode,
      setCourseFocusDispatch, clearCourseFocusDispatch,
    } = this.props;

    if (!isFocused(course, courseFocus)) {
      setCourseFocusDispatch(course);

      const labelOfTabs = new Map([
        [CourseListCode.SEARCH, 'Search'],
        [CourseListCode.BASIC, 'Basic'],
        [CourseListCode.HUMANITY, 'Humanity'],
        [CourseListCode.TAKEN, 'Taken'],
      ]);
      ReactGA.event({
        category: 'Dictionary - Selection',
        action: 'Selected Course',
        label: `Course : ${course.id} / From : Course List : ${labelOfTabs.get(selectedListCode) || selectedListCode}`,
      });
    }
    else {
      clearCourseFocusDispatch();

      const labelOfTabs = new Map([
        [CourseListCode.SEARCH, 'Search'],
        [CourseListCode.BASIC, 'Basic'],
        [CourseListCode.HUMANITY, 'Humanity'],
        [CourseListCode.TAKEN, 'Taken'],
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
      if (selectedListCode === CourseListCode.SEARCH) {
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
          <div className={classNames('list-title', 'list-title--search')} onClick={() => this.showSearch()}>
            <i className={classNames('icon', 'icon--search')} />
            <span>{t('ui.tab.search')}</span>
            <span>{lastSearchOptionText.length > 0 ? `:${lastSearchOptionText}` : ''}</span>
          </div>
        );
      }
      if (selectedListCode === CourseListCode.BASIC) {
        return (
          <div className={classNames('list-title')}>
            {t('ui.tab.basic')}
          </div>
        );
      }
      if (user && user.departments.some((d) => (selectedListCode === d.code))) {
        const department = user.departments.find((d) => (selectedListCode === d.code));
        return (
          <div className={classNames('list-title')}>
            {`${department[t('js.property.name')]} ${t('ui.tab.major')}`}
          </div>
        );
      }
      if (selectedListCode === CourseListCode.HUMANITY) {
        return (
          <div className={classNames('list-title')}>
            {t('ui.tab.humanity')}
          </div>
        );
      }
      if (selectedListCode === CourseListCode.TAKEN) {
        return (
          <div className={classNames('list-title')}>
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
          <div className={classNames(
              'block-list',
              'block-list--two-columns'
          )}>
            {
              courses.map((c) => (
                <PlannerCourseBlock
                  course={c}
                  key={c.id}
                  shouldShowReadStatus={true}
                  isRead={c.userspecific_is_read || readCourses.some((c2) => (c2.id === c.id))}
                  isRaised={isFocused(c, courseFocus)}
                  isDimmed={isDimmedCourse(c, courseFocus)}
                  onClick={this.focusCourseWithClick}
                  // inCart={inCart(l, lists[CourseListCode.CART])}
                  // fromCart={(selectedListCode === CourseListCode.CART)}
                  // addToCart={this.addLectureToCart}
                  // addToTable={this.addLectureToTable}
                  // deleteFromCart={this.deleteLectureFromCart}
                  // 나중에 장바구니 만들어야 함!
                />
              ))
            }
          </div>
        </Scroller>
      );
    };

    return (
      <div className={classNames('section', 'section--course-list')}>
        <div className={classNames('subsection', 'subsection--flex', 'subsection--course-list')}>
          { ((selectedListCode === CourseListCode.SEARCH) && searchOpen) ? <CourseSearchSubSection /> : null }
          { getListTitle() }
          { getListElement() }
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.common.user.user,
  selectedListCode: state.planner.list.selectedListCode,
  lists: state.planner.list.lists,
  readCourses: state.planner.list.readCourses,
  courseFocus: state.planner.courseFocus,
  searchOpen: state.planner.search.open,
  lastSearchOption: state.planner.search.lastSearchOption,
});

const mapDispatchToProps = (dispatch) => ({
  openSearchDispatch: () => {
    dispatch(openSearch());
  },
  setCourseFocusDispatch: (course) => {
    dispatch(setCourseFocus(course));
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
