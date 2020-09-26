import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import axios from 'axios';
import ReactGA from 'react-ga';

import { appBoundClassNames as classNames } from '../../common/boundClassNames';

import {
  setListMajorCodes, setSelectedListCode, setListLectures, clearListsLectures, setListMajorLectures,
} from '../../actions/timetable/list';
import { openSearch, closeSearch } from '../../actions/timetable/search';

import userShape from '../../shapes/UserShape';
import lectureShape from '../../shapes/LectureShape';

import Scroller from '../Scroller';


class LectureListTabs extends Component {
  componentDidMount() {
    const { user } = this.props;

    if (user) {
      this._setMajorCodes(user.departments);
      this._fetchList('CART', true);
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const {
      user,
      selectedListCode,
      year, semester,
      clearListsLecturesDispatch,
    } = this.props;

    if (user && !prevProps.user) {
      this._setMajorCodes(user.departments);
      this._fetchList('CART', true);
    }

    if (year !== prevProps.year || semester !== prevProps.semester) {
      clearListsLecturesDispatch();
      this._fetchList('CART', true);
      if (selectedListCode !== 'CART') {
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
    else if (major.codes.some((c) => (c === listCode))) {
      this._fetchMajorList(listCode, force);
    }
    else if (listCode === 'HUMANITY') {
      this._fetchHumanityList(force);
    }
    else if (listCode === 'CART') {
      this._fetchCartList(force);
    }
  }

  _fetchMajorList = (majorCode, force = false) => {
    const {
      year, semester,
      major,
      setListMajorLecturesDispatch,
    } = this.props;

    if (!force && major[majorCode].lectureGroups) {
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
          || (!newProps.major.codes.some((c) => (c === majorCode)))
        ) {
          return;
        }
        setListMajorLecturesDispatch(majorCode, response.data);
      })
      .catch((error) => {
      });
  }

  _fetchHumanityList = (force = false) => {
    const {
      year, semester,
      humanity,
      setListLecturesDispatch,
    } = this.props;

    if (!force && humanity.lectureGroups) {
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
        setListLecturesDispatch('humanity', response.data);
      })
      .catch((error) => {
      });
  }

  _fetchCartList = (force = false) => {
    const {
      user,
      year, semester,
      cart,
      setListLecturesDispatch,
    } = this.props;

    if (!force && cart.lectureGroups) {
      return;
    }

    if (!user) {
      setListLecturesDispatch('cart', []);
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
        setListLecturesDispatch('cart', response.data.lectures.filter((l) => ((l.year === year) && (l.semester === semester))));
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

    if (listCode === 'SEARCH' && (search.lectureGroups === null || search.lectureGroups.length === 0)) {
      openSearchDispatch();
    }
    else {
      closeSearchDispatch();
    }

    const labelOfTabs = new Map([
      ['SEARCH', 'Search'],
      ['HUMANITY', 'Humanity'],
      ['CART', 'Cart'],
    ]);
    ReactGA.event({
      category: 'Timetable - List',
      action: 'Switched Lecture List',
      label: `Lecture List : ${labelOfTabs.get(listCode) || listCode}`,
    });
  }

  render() {
    const { t } = this.props;
    const { selectedListCode, major } = this.props;

    return (
      <div className={classNames('tabs', 'tabs--lecture-list')}>
        <Scroller noScrollX={false} noScrollY={true} expandBottom={2}>
          <div className={classNames('tabs__flexbox')}>
        <div className={classNames('tabs__elem', (selectedListCode === 'SEARCH' ? 'tabs__elem--selected' : ''))} onClick={() => this.changeTab('SEARCH')}>
          <i className={classNames('icon', 'icon--tab-search')} />
          <span>{t('ui.tab.searchShort')}</span>
        </div>
        {major.codes.map((cd) => (
          <div className={classNames('tabs__elem', (selectedListCode === cd ? 'tabs__elem--selected' : ''))} key={cd} onClick={() => this.changeTab(cd)}>
            <i className={classNames('icon', 'icon--tab-major')} />
            <span>{t('ui.tab.majorShort')}</span>
          </div>
        ))}
        <div className={classNames('tabs__elem', (selectedListCode === 'HUMANITY' ? 'tabs__elem--selected' : ''))} onClick={() => this.changeTab('HUMANITY')}>
          <i className={classNames('icon', 'icon--tab-humanity')} />
          <span>{t('ui.tab.humanityShort')}</span>
        </div>
        <div className={classNames('tabs__elem', (selectedListCode === 'CART' ? 'tabs__elem--selected' : ''))} onClick={() => this.changeTab('CART')}>
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
  search: state.timetable.list.search,
  major: state.timetable.list.major,
  humanity: state.timetable.list.humanity,
  cart: state.timetable.list.cart,
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
  setListLecturesDispatch: (code, lectures) => {
    dispatch(setListLectures(code, lectures));
  },
  clearListsLecturesDispatch: () => {
    dispatch(clearListsLectures());
  },
  setListMajorLecturesDispatch: (majorCode, lectures) => {
    dispatch(setListMajorLectures(majorCode, lectures));
  },
});

LectureListTabs.propTypes = {
  user: userShape,
  selectedListCode: PropTypes.string.isRequired,
  year: PropTypes.number,
  semester: PropTypes.number,
  search: PropTypes.shape({
    lectureGroups: PropTypes.arrayOf(PropTypes.arrayOf(lectureShape)),
  }).isRequired,
  major: PropTypes.shape({
    codes: PropTypes.arrayOf(PropTypes.string).isRequired,
  }).isRequired,
  humanity: PropTypes.shape({
    lectureGroups: PropTypes.arrayOf(PropTypes.arrayOf(lectureShape)),
  }).isRequired,
  cart: PropTypes.shape({
    lectureGroups: PropTypes.arrayOf(PropTypes.arrayOf(lectureShape)),
  }).isRequired,

  openSearchDispatch: PropTypes.func.isRequired,
  closeSearchDispatch: PropTypes.func.isRequired,
  setListMajorCodesDispatch: PropTypes.func.isRequired,
  setSelectedListCodeDispatch: PropTypes.func.isRequired,
  setListLecturesDispatch: PropTypes.func.isRequired,
  clearListsLecturesDispatch: PropTypes.func.isRequired,
  setListMajorLecturesDispatch: PropTypes.func.isRequired,
};

export default withTranslation()(connect(mapStateToProps, mapDispatchToProps)(LectureListTabs));
