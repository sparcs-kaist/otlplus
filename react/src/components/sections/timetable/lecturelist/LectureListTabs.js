import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import axios from 'axios';
import ReactGA from 'react-ga';

import { appBoundClassNames as classNames } from '../../../../common/boundClassNames';

import { LectureListCode } from '../../../../reducers/timetable/list';

import {
  setSelectedListCode, setListLectures, clearAllListsLectures,
} from '../../../../actions/timetable/list';
import { openSearch, closeSearch, setLastSearchOption } from '../../../../actions/timetable/search';

import userShape from '../../../../shapes/model/session/UserShape';
import lectureListsShape from '../../../../shapes/state/timetable/LectureListsShape';

import Scroller from '../../../Scroller';


class LectureListTabs extends Component {
  componentDidMount() {
    const { user } = this.props;

    if (user) {
      this._fetchList(LectureListCode.CART, true);
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const {
      user,
      selectedListCode,
      year, semester,
      clearAllListsLecturesDispatch,
      setLastSearchOptionDispatch,
    } = this.props;

    if (user && !prevProps.user) {
      this._fetchList(LectureListCode.CART, true);
    }

    if (year !== prevProps.year || semester !== prevProps.semester) {
      clearAllListsLecturesDispatch();
      setLastSearchOptionDispatch({});
      this._fetchList(LectureListCode.CART, true);
      if (selectedListCode !== LectureListCode.CART) {
        this._fetchList(selectedListCode, true);
      }
    }

    if (selectedListCode !== prevProps.selectedListCode) {
      this._fetchList(selectedListCode);
    }
  }

  _fetchList = (listCode, force = false) => {
    const { user, lists } = this.props;

    if (listCode === LectureListCode.SEARCH) {
      return;
    }
    if (!force && lists[listCode] && lists[listCode].lectureGroups) {
      return;
    }

    if (listCode === LectureListCode.BASIC) {
      this._performFetchBasicList();
    }
    else if (user && user.departments.some((d) => (d.code === listCode))) {
      this._performFetchMajorList(listCode);
    }
    else if (listCode === LectureListCode.HUMANITY) {
      this._performFetchHumanityList();
    }
    else if (listCode === LectureListCode.CART) {
      this._performFetchCartList();
    }
  }

  _performFetchBasicList = () => {
    const {
      year, semester,
      setListLecturesDispatch,
    } = this.props;

    axios.get(
      '/api/lectures',
      {
        params: {
          year: year,
          semester: semester,
          group: 'Basic',
          order: ['old_code', 'class_no'],
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
        setListLecturesDispatch(LectureListCode.BASIC, response.data);
      })
      .catch((error) => {
      });
  }

  _performFetchMajorList = (majorCode) => {
    const {
      year, semester,
      setListLecturesDispatch,
    } = this.props;

    axios.get(
      '/api/lectures',
      {
        params: {
          year: year,
          semester: semester,
          group: [majorCode],
          order: ['old_code', 'class_no'],
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

  _performFetchHumanityList = (force = false) => {
    const {
      year, semester,
      setListLecturesDispatch,
    } = this.props;

    axios.get(
      '/api/lectures',
      {
        params: {
          year: year,
          semester: semester,
          group: 'Humanity',
          order: ['old_code', 'class_no'],
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
        setListLecturesDispatch(LectureListCode.HUMANITY, response.data);
      })
      .catch((error) => {
      });
  }

  _performFetchCartList = (force = false) => {
    const {
      user,
      year, semester,
      setListLecturesDispatch,
    } = this.props;

    if (!user) {
      setListLecturesDispatch(LectureListCode.CART, []);
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
        const cartLecturesOfThisSemester = response.data.lectures.filter((l) => (
          (l.year === year) && (l.semester === semester)
        ));
        setListLecturesDispatch(LectureListCode.CART, cartLecturesOfThisSemester);
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

    if (listCode === LectureListCode.SEARCH) {
      if (lists[LectureListCode.SEARCH].lectureGroups?.length) {
        closeSearchDispatch();
      }
      else {
        openSearchDispatch();
      }
    }

    const labelOfTabs = new Map([
      [LectureListCode.SEARCH, 'Search'],
      [LectureListCode.BASIC, 'Basic'],
      [LectureListCode.HUMANITY, 'Humanity'],
      [LectureListCode.CART, 'Cart'],
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
            <div
              className={classNames('tabs__elem', (selectedListCode === LectureListCode.SEARCH ? 'tabs__elem--selected' : null))}
              onClick={() => this.changeTab(LectureListCode.SEARCH)}
            >
              <i className={classNames('icon', 'icon--tab-search')} />
              <span>{t('ui.tab.searchShort')}</span>
            </div>
            <div
              className={classNames('tabs__elem', (selectedListCode === LectureListCode.BASIC ? 'tabs__elem--selected' : null))}
              onClick={() => this.changeTab(LectureListCode.BASIC)}
            >
              <i className={classNames('icon', 'icon--tab-basic')} />
              <span>{t('ui.tab.basicShort')}</span>
            </div>
            {!user ? null : user.departments.map((d) => (
              <div
                className={classNames('tabs__elem', (selectedListCode === d.code ? 'tabs__elem--selected' : null))}
                key={d.code}
                onClick={() => this.changeTab(d.code)}
              >
                <i className={classNames('icon', 'icon--tab-major')} />
                <span>{t('ui.tab.majorShort')}</span>
              </div>
            ))}
            <div
              className={classNames('tabs__elem', (selectedListCode === LectureListCode.HUMANITY ? 'tabs__elem--selected' : null))}
              onClick={() => this.changeTab(LectureListCode.HUMANITY)}
            >
              <i className={classNames('icon', 'icon--tab-humanity')} />
              <span>{t('ui.tab.humanityShort')}</span>
            </div>
            <div
              className={classNames('tabs__elem', (selectedListCode === LectureListCode.CART ? 'tabs__elem--selected' : null))}
              onClick={() => this.changeTab(LectureListCode.CART)}
            >
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
  setLastSearchOptionDispatch: (lastSearchOption) => {
    dispatch(setLastSearchOption(lastSearchOption));
  },
});

LectureListTabs.propTypes = {
  user: userShape,
  selectedListCode: PropTypes.string.isRequired,
  year: PropTypes.number,
  semester: PropTypes.oneOf([1, 2, 3, 4]),
  lists: lectureListsShape,

  openSearchDispatch: PropTypes.func.isRequired,
  closeSearchDispatch: PropTypes.func.isRequired,
  setSelectedListCodeDispatch: PropTypes.func.isRequired,
  setListLecturesDispatch: PropTypes.func.isRequired,
  clearAllListsLecturesDispatch: PropTypes.func.isRequired,
  setLastSearchOptionDispatch: PropTypes.func.isRequired,
};

export default withTranslation()(
  connect(mapStateToProps, mapDispatchToProps)(
    LectureListTabs
  )
);
