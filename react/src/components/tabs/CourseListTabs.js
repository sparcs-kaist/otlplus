import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import axios from 'axios';
import ReactGA from 'react-ga';

import { appBoundClassNames as classNames } from '../../common/boundClassNames';

import { openSearch, closeSearch } from '../../actions/dictionary/search';
import { setListMajorCodes, setCurrentList, setListCourses, setListMajorCourses } from '../../actions/dictionary/list';

import userShape from '../../shapes/UserShape';
import courseShape from '../../shapes/CourseShape';


class CourseListTabs extends Component {
  componentDidMount() {
    const { user } = this.props;

    if (user) {
      this._setMajorCodes(user.departments);
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const { user, currentList } = this.props;

    if (user && !prevProps.user) {
      this._setMajorCodes(user.departments);
      if (currentList === 'TAKEN') {
        this._fetchList(currentList, true);
      }
    }

    if (currentList !== prevProps.currentList) {
      this._fetchList(currentList);
    }
  }

  _setMajorCodes = (departments) => {
    const { setListMajorCodesDispatch } = this.props;
    const majors = departments.map(d => ({
      code: d.code,
      name: (d.code === 'Basic') ? '기초 과목' : `${d.name} 전공`,
      name_en: (d.code === 'Basic') ? 'Basic Course' : `${d.name_en} Major`,
    }));
    setListMajorCodesDispatch(majors);
  }

  _codesAreSame = (codes1, codes2) => (
    codes1.length === codes2.length
    && codes1.every((c, i) => (c === codes2[i]))
  )

  _fetchList = (listCode, force = false) => {
    const { major } = this.props;

    if (listCode === 'SEARCH') {
      // Pass
    }
    else if (major.codes.findIndex(c => (c === listCode)) !== -1) {
      this._fetchMajorList(listCode, force);
    }
    else if (listCode === 'HUMANITY') {
      this._fetchHumanityList(force);
    }
    else if (listCode === 'TAKEN') {
      this._fetchTakenList(force);
    }
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
        if (newProps.major.codes.findIndex(c => (c === majorCode)) === -1) {
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

  changeTab = (list) => {
    const { search, setCurrentListDispatch, openSearchDispatch, closeSearchDispatch } = this.props;

    setCurrentListDispatch(list);

    if (list === 'SEARCH' && (search.courses === null || search.courses.length === 0)) {
      openSearchDispatch();
    }
    else {
      closeSearchDispatch();
    }

    const labelOfTabs = new Map([
      ['SEARCH', 'Search'],
      ['HUMANITY', 'Humanity'],
      ['TAKEN', 'Taken'],
    ]);
    ReactGA.event({
      category: 'Dictionary - List',
      action: 'Switched Course List',
      label: `Course List : ${labelOfTabs.get(list) || list}`,
    });
  }

  render() {
    const { t } = this.props;
    const { currentList, major } = this.props;

    return (
      <div className={classNames('tabs', 'tabs--lecture-list')}>
        <div className={classNames((currentList === 'SEARCH' ? 'tabs__elem--active' : ''))} onClick={() => this.changeTab('SEARCH')}>
          <i className={classNames('icon', 'icon--tab-search')} />
          <span>{t('ui.tab.searchShort')}</span>
        </div>
        {major.codes.map(code => (
          <div className={classNames((currentList === code ? 'tabs__elem--active' : ''))} key={code} onClick={() => this.changeTab(code)}>
            <i className={classNames('icon', 'icon--tab-major')} />
            <span>{t('ui.tab.majorShort')}</span>
          </div>
        ))}
        <div className={classNames((currentList === 'HUMANITY' ? 'tabs__elem--active' : ''))} onClick={() => this.changeTab('HUMANITY')}>
          <i className={classNames('icon', 'icon--tab-humanity')} />
          <span>{t('ui.tab.humanityShort')}</span>
        </div>
        <div className={classNames((currentList === 'TAKEN' ? 'tabs__elem--active' : ''))} onClick={() => this.changeTab('TAKEN')}>
          <i className={classNames('icon', 'icon--tab-taken')} />
          <span>{t('ui.tab.takenShort')}</span>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  user: state.common.user.user,
  currentList: state.dictionary.list.currentList,
  search: state.dictionary.list.search,
  major: state.dictionary.list.major,
  humanity: state.dictionary.list.humanity,
  taken: state.dictionary.list.taken,
});

const mapDispatchToProps = dispatch => ({
  openSearchDispatch: () => {
    dispatch(openSearch());
  },
  closeSearchDispatch: () => {
    dispatch(closeSearch());
  },
  setListMajorCodesDispatch: (majors) => {
    dispatch(setListMajorCodes(majors));
  },
  setCurrentListDispatch: (list) => {
    dispatch(setCurrentList(list));
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

  openSearchDispatch: PropTypes.func.isRequired,
  closeSearchDispatch: PropTypes.func.isRequired,
  setListMajorCodesDispatch: PropTypes.func.isRequired,
  setCurrentListDispatch: PropTypes.func.isRequired,
  setListCoursesDispatch: PropTypes.func.isRequired,
  setListMajorCoursesDispatch: PropTypes.func.isRequired,
};

export default withTranslation()(connect(mapStateToProps, mapDispatchToProps)(CourseListTabs));
