import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { appBoundClassNames as classNames } from '../../common/boundClassNames';
import axios from '../../common/presetAxios';

import { BASE_URL } from '../../common/constants';
import { setListMajorCodes, setCurrentList, setListLectures, clearListsLectures, setListMajorLectures } from '../../actions/timetable/list';
import { openSearch, closeSearch } from '../../actions/timetable/search';
import userShape from '../../shapes/UserShape';
import lectureShape from '../../shapes/LectureShape';


class LectureListTabs extends Component {
  componentDidMount() {
    const { user, setListMajorCodesDispatch } = this.props;

    if (user) {
      setListMajorCodesDispatch(user.departments);
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const { user, major, year, semester, setListMajorCodesDispatch, clearListsLecturesDispatch } = this.props;

    if (user && (user !== prevProps.user)) {
      setListMajorCodesDispatch(user.departments);
    }

    if (!this._codesAreSame(major.codes, prevProps.major.codes)) {
      this._fetchLists(true);
    }

    if (year !== prevProps.year || semester !== prevProps.semester) {
      clearListsLecturesDispatch();
      this._fetchLists(false);
    }
  }

  _codesAreSame = (codes1, codes2) => (
    codes1.length === codes2.length
    && codes1.every((c, i) => (c === codes2[i]))
  )

  _fetchLists = (majorOnly) => {
    const { year, semester, major, setListMajorLecturesDispatch, setListLecturesDispatch } = this.props;
    const majorCodes = major.codes;

    axios.get(`${BASE_URL}/api/lectures`, { params: {
      year: year,
      semester: semester,
      group: majorCodes,
    } })
      .then((response) => {
        const newProps = this.props;
        if ((newProps.year !== year || newProps.semester !== semester)
          || !this._codesAreSame(newProps.major.codes, majorCodes)
        ) {
          return;
        }
        major.codes.forEach((code) => {
          setListMajorLecturesDispatch(code, response.data.filter(lecture => (lecture.major_code === code)));
        });
      })
      .catch((response) => {
      });

    if (majorOnly) {
      return;
    }

    axios.get(`${BASE_URL}/api/lectures`, { params: {
      year: year,
      semester: semester,
      group: 'Humanity',
    } })
      .then((response) => {
        const newProps = this.props;
        if (newProps.year !== year || newProps.semester !== semester) {
          return;
        }
        setListLecturesDispatch('humanity', response.data);
      })
      .catch((response) => {
      });

    axios.post(`${BASE_URL}/api/timetable/wishlist_load`, {
      year: year,
      semester: semester,
    })
      .then((response) => {
        const newProps = this.props;
        if (newProps.year !== year || newProps.semester !== semester
        ) {
          return;
        }
        setListLecturesDispatch('cart', response.data);
      })
      .catch((response) => {
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
        <div className={classNames((currentList === 'CART' ? 'tabs__elem--active' : ''))} onClick={() => this.changeTab('CART')}>
          <i className={classNames('icon', 'icon--tab-cart')} />
          <span>{t('ui.tab.wishlistShort')}</span>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  user: state.common.user.user,
  currentList: state.timetable.list.currentList,
  year: state.timetable.semester.year,
  semester: state.timetable.semester.semester,
  search: state.timetable.list.search,
  major: state.timetable.list.major,
  humanity: state.timetable.list.humanity,
  cart: state.timetable.list.cart,
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
  currentList: PropTypes.string.isRequired,
  year: PropTypes.number,
  semester: PropTypes.number,
  search: PropTypes.shape({
    courses: PropTypes.arrayOf(PropTypes.arrayOf(lectureShape)),
  }).isRequired,
  major: PropTypes.shape({
    codes: PropTypes.arrayOf(PropTypes.string).isRequired,
  }).isRequired,
  humanity: PropTypes.shape({
    courses: PropTypes.arrayOf(PropTypes.arrayOf(lectureShape)),
  }).isRequired,
  cart: PropTypes.shape({
    courses: PropTypes.arrayOf(PropTypes.arrayOf(lectureShape)),
  }).isRequired,
  openSearchDispatch: PropTypes.func.isRequired,
  closeSearchDispatch: PropTypes.func.isRequired,
  setListMajorCodesDispatch: PropTypes.func.isRequired,
  setCurrentListDispatch: PropTypes.func.isRequired,
  setListLecturesDispatch: PropTypes.func.isRequired,
  clearListsLecturesDispatch: PropTypes.func.isRequired,
  setListMajorLecturesDispatch: PropTypes.func.isRequired,
};

export default withTranslation()(connect(mapStateToProps, mapDispatchToProps)(LectureListTabs));
