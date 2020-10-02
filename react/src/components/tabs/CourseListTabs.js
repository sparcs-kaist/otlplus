import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import axios from 'axios';
import ReactGA from 'react-ga';

import { appBoundClassNames as classNames } from '../../common/boundClassNames';

import {
  SEARCH, BASIC, HUMANITY, TAKEN,
} from '../../reducers/dictionary/list';

import { openSearch, closeSearch } from '../../actions/dictionary/search';
import {
  setSelectedListCode, setListCourses,
} from '../../actions/dictionary/list';

import userShape from '../../shapes/UserShape';
import courseListsShape from '../../shapes/CourseListsShape';

import Scroller from '../Scroller';


class CourseListTabs extends Component {
  componentDidUpdate(prevProps, prevState, snapshot) {
    const { user, selectedListCode } = this.props;

    if (user && !prevProps.user) {
      if (selectedListCode === TAKEN) {
        this._fetchList(selectedListCode, true);
      }
    }

    if (selectedListCode !== prevProps.selectedListCode) {
      this._fetchList(selectedListCode);
    }
  }

  _fetchList = (listCode, force = false) => {
    const { user, lists } = this.props;

    if (listCode === SEARCH) {
      return;
    }
    if (!force && lists[listCode] && lists[listCode].courses) {
      return;
    }

    if (listCode === BASIC) {
      this._performFetchBasicList();
    }
    else if (user && user.departments.some((d) => (d.code === listCode))) {
      this._performFetchMajorList(listCode);
    }
    else if (listCode === HUMANITY) {
      this._performFetchHumanityList();
    }
    else if (listCode === TAKEN) {
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
        },
        metadata: {
          gaCategory: 'Course',
          gaVariable: 'GET / List',
        },
      },
    )
      .then((response) => {
        setListCoursesDispatch(BASIC, response.data);
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
        },
        metadata: {
          gaCategory: 'Course',
          gaVariable: 'GET / List',
        },
      },
    )
      .then((response) => {
        setListCoursesDispatch(HUMANITY, response.data);
      })
      .catch((error) => {
      });
  }


  _performFetchTakenList = () => {
    const { user, setListCoursesDispatch } = this.props;

    if (!user) {
      setListCoursesDispatch(TAKEN, []);
      return;
    }
    setListCoursesDispatch(TAKEN, null);
    axios.get(
      `/api/users/${user.id}/taken-courses`,
      {
        params: {
        },
        metadata: {
          gaCategory: 'User',
          gaVariable: 'GET Taken Courses / Instance',
        },
      },
    )
      .then((response) => {
        setListCoursesDispatch(TAKEN, response.data);
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

    if (listCode === SEARCH) {
      if (lists[SEARCH].courses && lists[SEARCH].courses.length) {
        closeSearchDispatch();
      }
      else {
        openSearchDispatch();
      }
    }

    const labelOfTabs = new Map([
      [SEARCH, 'Search'],
      [BASIC, 'Basic'],
      [HUMANITY, 'Humanity'],
      [TAKEN, 'Taken'],
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
      <div className={classNames('tabs', 'tabs--lecture-list')}>
        <Scroller noScrollX={false} noScrollY={true} expandBottom={2}>
          <div className={classNames('tabs__flexbox')}>
        <div className={classNames('tabs__elem', (selectedListCode === SEARCH ? 'tabs__elem--selected' : ''))} onClick={() => this.changeTab(SEARCH)}>
          <i className={classNames('icon', 'icon--tab-search')} />
          <span>{t('ui.tab.searchShort')}</span>
        </div>
        <div className={classNames('tabs__elem', (selectedListCode === BASIC ? 'tabs__elem--selected' : ''))} onClick={() => this.changeTab(BASIC)}>
          <i className={classNames('icon', 'icon--tab-basic')} />
          <span>{t('ui.tab.basicShort')}</span>
        </div>
        {!user ? null : user.departments.map((d) => (
          <div className={classNames('tabs__elem', (selectedListCode === d.code ? 'tabs__elem--selected' : ''))} key={d.code} onClick={() => this.changeTab(d.code)}>
            <i className={classNames('icon', 'icon--tab-major')} />
            <span>{t('ui.tab.majorShort')}</span>
          </div>
        ))}
        <div className={classNames('tabs__elem', (selectedListCode === HUMANITY ? 'tabs__elem--selected' : ''))} onClick={() => this.changeTab(HUMANITY)}>
          <i className={classNames('icon', 'icon--tab-humanity')} />
          <span>{t('ui.tab.humanityShort')}</span>
        </div>
        <div className={classNames('tabs__elem', (selectedListCode === TAKEN ? 'tabs__elem--selected' : ''))} onClick={() => this.changeTab(TAKEN)}>
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

export default withTranslation()(connect(mapStateToProps, mapDispatchToProps)(CourseListTabs));
