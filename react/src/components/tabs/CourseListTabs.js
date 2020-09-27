import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import axios from 'axios';
import ReactGA from 'react-ga';

import { appBoundClassNames as classNames } from '../../common/boundClassNames';

import { openSearch, closeSearch } from '../../actions/dictionary/search';
import {
  setListMajorCodes, setSelectedListCode, setListCourses, setListMajorCourses,
} from '../../actions/dictionary/list';

import userShape from '../../shapes/UserShape';
import courseShape from '../../shapes/CourseShape';

import Scroller from '../Scroller';


class CourseListTabs extends Component {
  componentDidMount() {
    const { user } = this.props;

    if (user) {
      this._setMajorCodes(user.departments);
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const { user, selectedListCode } = this.props;

    if (user && !prevProps.user) {
      this._setMajorCodes(user.departments);
      if (selectedListCode === 'TAKEN') {
        this._fetchList(selectedListCode, true);
      }
    }

    if (selectedListCode !== prevProps.selectedListCode) {
      this._fetchList(selectedListCode);
    }
  }

  _setMajorCodes = (departments) => {
    const { setListMajorCodesDispatch } = this.props;
    const majors = departments.map((d) => ({
      code: d.code,
      name: `${d.name} 전공`,
      name_en: `${d.name_en} Major`,
    }));
    setListMajorCodesDispatch(majors);
  }

  _fetchList = (listCode, force = false) => {
    const { user } = this.props;

    if (listCode === 'SEARCH') {
      // Pass
    }
    else if (listCode === 'BASIC') {
      this._fetchBasicList(force);
    }
    else if (user && user.departments.some((d) => (d.code === listCode))) {
      this._fetchMajorList(listCode, force);
    }
    else if (listCode === 'HUMANITY') {
      this._fetchHumanityList(force);
    }
    else if (listCode === 'TAKEN') {
      this._fetchTakenList(force);
    }
  }

  _fetchBasicList = (force = false) => {
    const { basic, setListCoursesDispatch } = this.props;

    if (!force && basic.courses) {
      return;
    }

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
        setListCoursesDispatch('basic', response.data);
      })
      .catch((error) => {
      });
  }

  _fetchMajorList = (majorCode, force = false) => {
    const { major, setListMajorCoursesDispatch } = this.props;

    if (!force && major[majorCode].courses) {
      return;
    }

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
        setListMajorCoursesDispatch(majorCode, response.data);
      })
      .catch((error) => {
      });
  }

  _fetchHumanityList = (force = false) => {
    const { humanity, setListCoursesDispatch } = this.props;

    if (!force && humanity.courses) {
      return;
    }

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
        setListCoursesDispatch('humanity', response.data);
      })
      .catch((error) => {
      });
  }


  _fetchTakenList = (force = false) => {
    const { user, taken, setListCoursesDispatch } = this.props;

    if (!force && taken.courses) {
      return;
    }

    if (!user) {
      setListCoursesDispatch('taken', []);
      return;
    }
    setListCoursesDispatch('taken', null);
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
        setListCoursesDispatch('taken', response.data);
      })
      .catch((error) => {
      });
  }

  changeTab = (listCode) => {
    const {
      search,
      setSelectedListCodeDispatch, openSearchDispatch, closeSearchDispatch,
    } = this.props;

    setSelectedListCodeDispatch(listCode);

    if (listCode === 'SEARCH' && (search.courses === null || search.courses.length === 0)) {
      openSearchDispatch();
    }
    else {
      closeSearchDispatch();
    }

    const labelOfTabs = new Map([
      ['SEARCH', 'Search'],
      ['BASIC', 'Basic'],
      ['HUMANITY', 'Humanity'],
      ['TAKEN', 'Taken'],
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
        <div className={classNames('tabs__elem', (selectedListCode === 'SEARCH' ? 'tabs__elem--selected' : ''))} onClick={() => this.changeTab('SEARCH')}>
          <i className={classNames('icon', 'icon--tab-search')} />
          <span>{t('ui.tab.searchShort')}</span>
        </div>
        <div className={classNames('tabs__elem', (selectedListCode === 'BASIC' ? 'tabs__elem--selected' : ''))} onClick={() => this.changeTab('BASIC')}>
          <i className={classNames('icon', 'icon--tab-basic')} />
          <span>{t('ui.tab.basicShort')}</span>
        </div>
        {!user ? null : user.departments.map((d) => (
          <div className={classNames('tabs__elem', (selectedListCode === d.code ? 'tabs__elem--selected' : ''))} key={d.code} onClick={() => this.changeTab(d.code)}>
            <i className={classNames('icon', 'icon--tab-major')} />
            <span>{t('ui.tab.majorShort')}</span>
          </div>
        ))}
        <div className={classNames('tabs__elem', (selectedListCode === 'HUMANITY' ? 'tabs__elem--selected' : ''))} onClick={() => this.changeTab('HUMANITY')}>
          <i className={classNames('icon', 'icon--tab-humanity')} />
          <span>{t('ui.tab.humanityShort')}</span>
        </div>
        <div className={classNames('tabs__elem', (selectedListCode === 'TAKEN' ? 'tabs__elem--selected' : ''))} onClick={() => this.changeTab('TAKEN')}>
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
  search: state.dictionary.list.search,
  basic: state.dictionary.list.basic,
  major: state.dictionary.list.major,
  humanity: state.dictionary.list.humanity,
  taken: state.dictionary.list.taken,
});

const mapDispatchToProps = (dispatch) => ({
  openSearchDispatch: () => {
    dispatch(openSearch());
  },
  closeSearchDispatch: () => {
    dispatch(closeSearch());
  },
  setListMajorCodesDispatch: (majors) => {
    dispatch(setListMajorCodes(majors));
  },
  setSelectedListCodeDispatch: (listCode) => {
    dispatch(setSelectedListCode(listCode));
  },
  setListCoursesDispatch: (code, courses) => {
    dispatch(setListCourses(code, courses));
  },
  setListMajorCoursesDispatch: (majorCode, courses) => {
    dispatch(setListMajorCourses(majorCode, courses));
  },
});

CourseListTabs.propTypes = {
  user: userShape,
  selectedListCode: PropTypes.string.isRequired,
  search: PropTypes.shape({
    courses: PropTypes.arrayOf(courseShape),
  }).isRequired,
  basic: PropTypes.shape({
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

  openSearchDispatch: PropTypes.func.isRequired,
  closeSearchDispatch: PropTypes.func.isRequired,
  setListMajorCodesDispatch: PropTypes.func.isRequired,
  setSelectedListCodeDispatch: PropTypes.func.isRequired,
  setListCoursesDispatch: PropTypes.func.isRequired,
  setListMajorCoursesDispatch: PropTypes.func.isRequired,
};

export default withTranslation()(connect(mapStateToProps, mapDispatchToProps)(CourseListTabs));
