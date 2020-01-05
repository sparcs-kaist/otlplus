import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { appBoundClassNames as classNames } from '../../common/boundClassNames';

import { openSearch, closeSearch } from '../../actions/dictionary/search';
import { setListMajorCodes, setCurrentList } from '../../actions/dictionary/list';
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
    const { user } = this.props;

    if (user && !prevProps.user) {
      this._setMajorCodes(user.departments);
    }
    else if (!this._codesAreSame(user.departments.map(d => d.code), prevProps.user.departments.map(d => d.code))) {
      this._setMajorCodes(user.departments);
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
};

export default withTranslation()(connect(mapStateToProps, mapDispatchToProps)(CourseListTabs));
