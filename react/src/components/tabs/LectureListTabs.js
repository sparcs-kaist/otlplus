import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import axios from 'axios';
import ReactGA from 'react-ga';

import { appBoundClassNames as classNames } from '../../common/boundClassNames';

import {
  SEARCH, BASIC, HUMANITY, CART,
} from '../../reducers/timetable/list';

import {
  setSelectedListCode, setListLectures, clearAllListsLectures,
} from '../../actions/timetable/list';
import { openSearch, closeSearch } from '../../actions/timetable/search';

import userShape from '../../shapes/UserShape';
import lectureListsShape from '../../shapes/LectureListsShape';

import Scroller from '../Scroller';


class LectureListTabs extends Component {
  componentDidMount() {
    const { user } = this.props;

    if (user) {
      this._fetchList(CART, true);
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const {
      user,
      selectedListCode,
      year, semester,
      clearAllListsLecturesDispatch,
    } = this.props;

    if (user && !prevProps.user) {
      this._fetchList(CART, true);
    }

    if (year !== prevProps.year || semester !== prevProps.semester) {
      clearAllListsLecturesDispatch();
      this._fetchList(CART, true);
      if (selectedListCode !== CART) {
        this._fetchList(selectedListCode, true);
      }
    }

    if (selectedListCode !== prevProps.selectedListCode) {
      this._fetchList(selectedListCode);
    }
  }

  _fetchList = (listCode, force = false) => {
    const { user } = this.props;

    if (listCode === SEARCH) {
      // Pass
    }
    else if (listCode === BASIC) {
      this._fetchBasicList(force);
    }
    else if (user && user.departments.some((d) => (d.code === listCode))) {
      this._fetchMajorList(listCode, force);
    }
    else if (listCode === HUMANITY) {
      this._fetchHumanityList(force);
    }
    else if (listCode === CART) {
      this._fetchCartList(force);
    }
  }

  _fetchBasicList = (force = false) => {
    const {
      year, semester,
      lists,
      setListLecturesDispatch,
    } = this.props;

    if (!force && lists[BASIC].lectureGroups) {
      return;
    }

    axios.get(
      '/api/lectures',
      {
        params: {
          year: year,
          semester: semester,
          group: 'Basic',
        },
        metadata: {
          gaCategory: 'Lecture',
          gaVariable: 'GET / List',
        },
      },
    )
      .then((response) => {
        const newProps = this.props;
        if (newProps.year !== year || newProps.semester !== semester) {
          return;
        }
        setListLecturesDispatch(BASIC, response.data);
      })
      .catch((error) => {
      });
  }

  _fetchMajorList = (majorCode, force = false) => {
    const {
      year, semester,
      lists,
      setListLecturesDispatch,
    } = this.props;

    if (!force && lists[majorCode] && lists[majorCode].lectureGroups) {
      return;
    }

    axios.get(
      '/api/lectures',
      {
        params: {
          year: year,
          semester: semester,
          group: [majorCode],
        },
        metadata: {
          gaCategory: 'Lecture',
          gaVariable: 'GET / List',
        },
      },
    )
      .then((response) => {
        const newProps = this.props;
        if ((newProps.year !== year || newProps.semester !== semester)
          || (!newProps.user.departments.some((d) => (d.code === majorCode)))
        ) {
          return;
        }
        setListLecturesDispatch(majorCode, response.data);
      })
      .catch((error) => {
      });
  }

  _fetchHumanityList = (force = false) => {
    const {
      year, semester,
      lists,
      setListLecturesDispatch,
    } = this.props;

    if (!force && lists[HUMANITY].lectureGroups) {
      return;
    }

    axios.get(
      '/api/lectures',
      {
        params: {
          year: year,
          semester: semester,
          group: 'Humanity',
        },
        metadata: {
          gaCategory: 'Lecture',
          gaVariable: 'GET / List',
        },
      },
    )
      .then((response) => {
        const newProps = this.props;
        if (newProps.year !== year || newProps.semester !== semester) {
          return;
        }
        setListLecturesDispatch(HUMANITY, response.data);
      })
      .catch((error) => {
      });
  }

  _fetchCartList = (force = false) => {
    const {
      user,
      year, semester,
      lists,
      setListLecturesDispatch,
    } = this.props;

    if (!force && lists[CART].lectureGroups) {
      return;
    }

    if (!user) {
      setListLecturesDispatch(CART, []);
      return;
    }
    axios.get(
      `/api/users/${user.id}/wishlist`,
      {
        metadata: {
          gaCategory: 'User',
          gaVariable: 'GET Wishlist / Instance',
        },
      },
    )
      .then((response) => {
        const newProps = this.props;
        if (newProps.year !== year || newProps.semester !== semester
        ) {
          return;
        }
        setListLecturesDispatch(CART, response.data.lectures.filter((l) => ((l.year === year) && (l.semester === semester))));
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

    if (listCode === SEARCH && (lists[SEARCH].lectureGroups === null || lists[SEARCH].lectureGroups.length === 0)) {
      openSearchDispatch();
    }
    else {
      closeSearchDispatch();
    }

    const labelOfTabs = new Map([
      [SEARCH, 'Search'],
      [BASIC, 'Basic'],
      [HUMANITY, 'Humanity'],
      [CART, 'Cart'],
    ]);
    ReactGA.event({
      category: 'Timetable - List',
      action: 'Switched Lecture List',
      label: `Lecture List : ${labelOfTabs.get(listCode) || listCode}`,
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
        <div className={classNames('tabs__elem', (selectedListCode === CART ? 'tabs__elem--selected' : ''))} onClick={() => this.changeTab(CART)}>
          <i className={classNames('icon', 'icon--tab-cart')} />
          <span>{t('ui.tab.wishlistShort')}</span>
        </div>
          </div>
        </Scroller>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.common.user.user,
  selectedListCode: state.timetable.list.selectedListCode,
  year: state.timetable.semester.year,
  semester: state.timetable.semester.semester,
  lists: state.timetable.list.lists,
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
  setListLecturesDispatch: (code, lectures) => {
    dispatch(setListLectures(code, lectures));
  },
  clearAllListsLecturesDispatch: () => {
    dispatch(clearAllListsLectures());
  },
});

LectureListTabs.propTypes = {
  user: userShape,
  selectedListCode: PropTypes.string.isRequired,
  year: PropTypes.number,
  semester: PropTypes.number,
  lists: lectureListsShape,

  openSearchDispatch: PropTypes.func.isRequired,
  closeSearchDispatch: PropTypes.func.isRequired,
  setSelectedListCodeDispatch: PropTypes.func.isRequired,
  setListLecturesDispatch: PropTypes.func.isRequired,
  clearAllListsLecturesDispatch: PropTypes.func.isRequired,
};

export default withTranslation()(connect(mapStateToProps, mapDispatchToProps)(LectureListTabs));
