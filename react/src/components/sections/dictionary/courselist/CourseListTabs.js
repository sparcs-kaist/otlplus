import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import axios from 'axios';
import ReactGA from 'react-ga';

import { appBoundClassNames as classNames } from '../../../../common/boundClassNames';

import { CourseListCode } from '../../../../reducers/dictionary/list';

import { openSearch, closeSearch } from '../../../../actions/dictionary/search';
import {
  setSelectedListCode, setListCourses,
} from '../../../../actions/dictionary/list';

import userShape from '../../../../shapes/model/session/UserShape';
import courseListsShape from '../../../../shapes/state/dictionary/CourseListsShape';

import Scroller from '../../../Scroller';


class CourseListTabs extends Component {
  componentDidUpdate(prevProps, prevState, snapshot) {
    const { user, selectedListCode } = this.props;

    if (user && !prevProps.user) {
      if (selectedListCode === CourseListCode.TAKEN) {
        this._fetchList(selectedListCode, true);
      }
    }

    if (selectedListCode !== prevProps.selectedListCode) {
      this._fetchList(selectedListCode);
    }
  }

  _fetchList = (listCode, force = false) => {
    const { user, lists } = this.props;

    if (listCode === CourseListCode.SEARCH) {
      return;
    }
    if (!force && lists[listCode] && lists[listCode].courses) {
      return;
    }

    if (listCode === CourseListCode.BASIC) {
      this._performFetchBasicList();
    }
    else if (user && user.departments.some((d) => (d.code === listCode))) {
      this._performFetchMajorList(listCode);
    }
    else if (listCode === CourseListCode.HUMANITY) {
      this._performFetchHumanityList();
    }
    else if (listCode === CourseListCode.TAKEN) {
      this._performFetchTakenList();
    }
  }

  _performFetchBasicList = () => {
    const { setListCoursesDispatch } = this.props;

    axios.get(
      '/api/courses',
      {
        params: {
          group: 'Basic',
          term: ['3'],
          order: ['old_code'],
        },
        metadata: {
          gaCategory: 'Course',
          gaVariable: 'GET / List',
        },
      },
    )
      .then((response) => {
        setListCoursesDispatch(CourseListCode.BASIC, response.data);
      })
      .catch((error) => {
      });
  }

  _performFetchMajorList = (majorCode) => {
    const { setListCoursesDispatch } = this.props;

    axios.get(
      '/api/courses',
      {
        params: {
          group: [majorCode],
          term: ['3'],
          order: ['old_code'],
        },
        metadata: {
          gaCategory: 'Course',
          gaVariable: 'GET / List',
        },
      },
    )
      .then((response) => {
        const newProps = this.props;
        if (!newProps.user.departments.some((d) => (d.code === majorCode))) {
          return;
        }
        setListCoursesDispatch(majorCode, response.data);
      })
      .catch((error) => {
      });
  }

  _performFetchHumanityList = () => {
    const { setListCoursesDispatch } = this.props;

    axios.get(
      '/api/courses',
      {
        params: {
          group: 'Humanity',
          term: ['3'],
          order: ['old_code'],
        },
        metadata: {
          gaCategory: 'Course',
          gaVariable: 'GET / List',
        },
      },
    )
      .then((response) => {
        setListCoursesDispatch(CourseListCode.HUMANITY, response.data);
      })
      .catch((error) => {
      });
  }


  _performFetchTakenList = () => {
    const { user, setListCoursesDispatch } = this.props;

    if (!user) {
      setListCoursesDispatch(CourseListCode.TAKEN, []);
      return;
    }
    setListCoursesDispatch(CourseListCode.TAKEN, null);
    axios.get(
      `/api/users/${user.id}/taken-courses`,
      {
        params: {
          order: ['old_code'],
        },
        metadata: {
          gaCategory: 'User',
          gaVariable: 'GET Taken Courses / Instance',
        },
      },
    )
      .then((response) => {
        setListCoursesDispatch(CourseListCode.TAKEN, response.data);
      })
      .catch((error) => {
      });
  }

  changeTab = (listCode) => {
    const {
      lists,
      setSelectedListCodeDispatch, openSearchDispatch, closeSearchDispatch,
    } = this.props;

    setSelectedListCodeDispatch(listCode);

    if (listCode === CourseListCode.SEARCH) {
      if (lists[CourseListCode.SEARCH].courses && lists[CourseListCode.SEARCH].courses.length) {
        closeSearchDispatch();
      }
      else {
        openSearchDispatch();
      }
    }

    const labelOfTabs = new Map([
      [CourseListCode.SEARCH, 'Search'],
      [CourseListCode.BASIC, 'Basic'],
      [CourseListCode.HUMANITY, 'Humanity'],
      [CourseListCode.TAKEN, 'Taken'],
    ]);
    ReactGA.event({
      category: 'Dictionary - List',
      action: 'Switched Course List',
      label: `Course List : ${labelOfTabs.get(listCode) || listCode}`,
    });
  }

  render() {
    const { t } = this.props;
    const { user, selectedListCode } = this.props;

    return (
      <div className={classNames('tabs', 'tabs--course-list')}>
        <Scroller noScrollX={false} noScrollY={true} expandBottom={2}>
          <div className={classNames('tabs__flexbox')}>
            <div className={classNames('tabs__elem', (selectedListCode === CourseListCode.SEARCH ? 'tabs__elem--selected' : null))} onClick={() => this.changeTab(CourseListCode.SEARCH)}>
              <i className={classNames('icon', 'icon--tab-search')} />
              <span>{t('ui.tab.searchShort')}</span>
            </div>
            <div className={classNames('tabs__elem', (selectedListCode === CourseListCode.BASIC ? 'tabs__elem--selected' : null))} onClick={() => this.changeTab(CourseListCode.BASIC)}>
              <i className={classNames('icon', 'icon--tab-basic')} />
              <span>{t('ui.tab.basicShort')}</span>
            </div>
            {!user ? null : user.departments.map((d) => (
              <div className={classNames('tabs__elem', (selectedListCode === d.code ? 'tabs__elem--selected' : null))} key={d.code} onClick={() => this.changeTab(d.code)}>
                <i className={classNames('icon', 'icon--tab-major')} />
                <span>{t('ui.tab.majorShort')}</span>
              </div>
            ))}
            <div className={classNames('tabs__elem', (selectedListCode === CourseListCode.HUMANITY ? 'tabs__elem--selected' : null))} onClick={() => this.changeTab(CourseListCode.HUMANITY)}>
              <i className={classNames('icon', 'icon--tab-humanity')} />
              <span>{t('ui.tab.humanityShort')}</span>
            </div>
            <div className={classNames('tabs__elem', (selectedListCode === CourseListCode.TAKEN ? 'tabs__elem--selected' : null))} onClick={() => this.changeTab(CourseListCode.TAKEN)}>
              <i className={classNames('icon', 'icon--tab-taken')} />
              <span>{t('ui.tab.takenShort')}</span>
            </div>
          </div>
        </Scroller>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.common.user.user,
  selectedListCode: state.dictionary.list.selectedListCode,
  lists: state.dictionary.list.lists,
});

const mapDispatchToProps = (dispatch) => ({
  openSearchDispatch: () => {
    dispatch(openSearch());
  },
  closeSearchDispatch: () => {
    dispatch(closeSearch());
  },
  setSelectedListCodeDispatch: (listCode) => {
    dispatch(setSelectedListCode(listCode));
  },
  setListCoursesDispatch: (code, courses) => {
    dispatch(setListCourses(code, courses));
  },
});

CourseListTabs.propTypes = {
  user: userShape,
  selectedListCode: PropTypes.string.isRequired,
  lists: courseListsShape,

  openSearchDispatch: PropTypes.func.isRequired,
  closeSearchDispatch: PropTypes.func.isRequired,
  setSelectedListCodeDispatch: PropTypes.func.isRequired,
  setListCoursesDispatch: PropTypes.func.isRequired,
};

export default withTranslation()(
  connect(mapStateToProps, mapDispatchToProps)(
    CourseListTabs
  )
);
