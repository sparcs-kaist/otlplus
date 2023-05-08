import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import ReactGA from 'react-ga';

import { appBoundClassNames as classNames } from '../../../../common/boundClassNames';

import { CourseListCode } from '../../../../reducers/planner/list';

import Scroller from '../../../Scroller';
import CourseSearchSubSection from './CourseSearchSubSection';
import PlannerCourseBlock from '../../../blocks/PlannerCourseBlock';

import {
  getTitleOfArbitrary, getTitleEnOfArbitrary, getOldCodeOfArbitrary, getIdOfArbitrary,
  isAddedCourse,
} from '../../../../utils/itemUtils';
import {
  isDimmedListCourse, isClickedListCourse,
} from '../../../../utils/itemFocusUtils';
import { setItemFocus, clearItemFocus } from '../../../../actions/planner/itemFocus';
import { openSearch } from '../../../../actions/planner/search';

import itemFocusShape from '../../../../shapes/state/planner/ItemFocusShape';
import courseListsShape from '../../../../shapes/state/dictionary/CourseListsShape';
import userShape from '../../../../shapes/model/session/UserShape';
import plannerShape from '../../../../shapes/model/planner/PlannerShape';
import courseLastSearchOptionShape from '../../../../shapes/state/dictionary/CourseLastSearchOptionShape';

import {
  getLabelOfValue, getDepartmentOptions, getTypeOptions, getLevelOptions, getTermOptions,
} from '../../../../common/searchOptions';
import { ItemFocusFrom } from '../../../../reducers/planner/itemFocus';


class CourseListSection extends Component {
  showSearch = () => {
    const { openSearchDispatch } = this.props;
    openSearchDispatch();
  }

  focusCourseWithHover = (course) => {
    const { itemFocus, setItemFocusDispatch } = this.props;

    if (itemFocus.clicked) {
      return;
    }
    setItemFocusDispatch(null, course, ItemFocusFrom.LIST, false);
  }

  unfocusCourseWithHover = (course) => {
    const { itemFocus, clearItemFocusDispatch } = this.props;

    if (itemFocus.clicked) {
      return;
    }
    clearItemFocusDispatch();
  }

  focusCourseWithClick = (course) => {
    const {
      itemFocus, selectedListCode,
      setItemFocusDispatch, clearItemFocusDispatch,
    } = this.props;

    if (!isClickedListCourse(course, itemFocus)) {
      setItemFocusDispatch(null, course, ItemFocusFrom.LIST, true);

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
      clearItemFocusDispatch();

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


  _getArbitraryCourses = () => {
    const { user, selectedListCode } = this.props;

    if (selectedListCode === CourseListCode.HUMANITY) {
      return [
        {
          id: getIdOfArbitrary('인문사회선택', 'Humanities & Social Elective', null),
          isArbitrary: true,
          department: null,
          type: '인문사회선택',
          type_en: 'Humanities & Social Elective',
          credit: 3,
          credit_au: 0,
          title: getTitleOfArbitrary('인문사회선택', 'Humanities & Social Elective', null),
          title_en: getTitleEnOfArbitrary('인문사회선택', 'Humanities & Social Elective', null),
          old_code: getOldCodeOfArbitrary('인문사회선택', 'Humanities & Social Elective', null),
        },
      ];
    }

    const matchingDepartment = user?.departments?.find((d) => (selectedListCode === d.code));
    if (matchingDepartment) {
      return [
        {
          id: getIdOfArbitrary('전공선택', 'Major Required', matchingDepartment),
          isArbitrary: true,
          department: matchingDepartment,
          type: '전공필수',
          type_en: 'Major Required',
          credit: 3,
          credit_au: 0,
          title: getTitleOfArbitrary('전공필수', 'Major Required', matchingDepartment),
          title_en: getTitleEnOfArbitrary('전공필수', 'Major Required', matchingDepartment),
          old_code: getOldCodeOfArbitrary('전공필수', 'Major Required', matchingDepartment),
        },
        {
          id: getIdOfArbitrary('전공선택', 'Major Elective', matchingDepartment),
          isArbitrary: true,
          department: matchingDepartment,
          type: '전공선택',
          type_en: 'Major Elective',
          credit: 3,
          credit_au: 0,
          title: getTitleOfArbitrary('전공선택', 'Major Elective', matchingDepartment),
          title_en: getTitleEnOfArbitrary('전공선택', 'Major Elective', matchingDepartment),
          old_code: getOldCodeOfArbitrary('전공선택', 'Major Elective', matchingDepartment),
        },
      ];
    }

    return [];
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
      itemFocus, selectedListCode, selectedPlanner,
      searchOpen, lastSearchOption,
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
          )}
          >
            {
              this._getArbitraryCourses(selectedListCode).map((c) => (
                <PlannerCourseBlock
                  course={c}
                  key={c.id}
                  isRaised={isClickedListCourse(c, itemFocus)}
                  isDimmed={isDimmedListCourse(c, itemFocus)}
                  isAdded={false}
                  onMouseOver={this.focusCourseWithHover}
                  onMouseOut={this.unfocusCourseWithHover}
                  onClick={this.focusCourseWithClick}
                />
              ))
            }
            {
              courses.map((c) => (
                <PlannerCourseBlock
                  course={c}
                  key={c.id}
                  isRaised={isClickedListCourse(c, itemFocus)}
                  isDimmed={isDimmedListCourse(c, itemFocus)}
                  isAdded={isAddedCourse(c, selectedPlanner)}
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
      <div className={classNames('section', 'section--course-list', 'mobile-hidden')}>
        <div className={classNames('subsection', 'subsection--flex', 'subsection--course-list')}>
          {
            ((selectedListCode === CourseListCode.SEARCH) && searchOpen)
              && <CourseSearchSubSection />
          }
          {getListTitle()}
          {getListElement()}
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.common.user.user,
  selectedListCode: state.planner.list.selectedListCode,
  lists: state.planner.list.lists,
  selectedPlanner: state.planner.planner.selectedPlanner,
  itemFocus: state.planner.itemFocus,
  searchOpen: state.planner.search.open,
  lastSearchOption: state.planner.search.lastSearchOption,
});

const mapDispatchToProps = (dispatch) => ({
  openSearchDispatch: () => {
    dispatch(openSearch());
  },
  setItemFocusDispatch: (item, course, from, clicked) => {
    dispatch(setItemFocus(item, course, from, clicked));
  },
  clearItemFocusDispatch: () => {
    dispatch(clearItemFocus());
  },
});

CourseListSection.propTypes = {
  user: userShape,
  selectedListCode: PropTypes.string.isRequired,
  lists: courseListsShape,
  selectedPlanner: plannerShape,
  itemFocus: itemFocusShape.isRequired,
  searchOpen: PropTypes.bool.isRequired,
  lastSearchOption: courseLastSearchOptionShape.isRequired,

  openSearchDispatch: PropTypes.func.isRequired,
  setItemFocusDispatch: PropTypes.func.isRequired,
  clearItemFocusDispatch: PropTypes.func.isRequired,
};


export default withTranslation()(
  connect(mapStateToProps, mapDispatchToProps)(
    CourseListSection
  )
);
