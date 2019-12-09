import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { appBoundClassNames as classNames } from '../../common/boundClassNames';

import { clearLectureActive } from "../../actions/timetable/lectureActive";
import { setCurrentList } from '../../actions/timetable/list';
import { openSearch, closeSearch } from '../../actions/timetable/search';
import { NONE, LIST, TABLE, MULTIPLE } from '../../reducers/timetable/lectureActive';
import lectureShape from '../../shapes/LectureShape';


class LectureListTabs extends Component {
  changeTab = (list) => {
    const { search, lectureActiveFrom, setCurrentListDispatch, openSearchDispatch, closeSearchDispatch, clearLectureActiveDispatch } = this.props;

    setCurrentListDispatch(list);

    if (list === 'SEARCH' && (search.courses === null || search.courses.length === 0)) {
      openSearchDispatch();
    }
    else {
      closeSearchDispatch();
    }

    if (lectureActiveFrom === LIST) {
      clearLectureActiveDispatch();
    }
  }

  render() {
    const { currentList, major } = this.props;

    return (
      <div className={classNames('tabs--lecture-list')}>
        <button className={classNames((currentList === 'SEARCH' ? 'tabs__elem--active' : ''))} onClick={() => this.changeTab('SEARCH')}><i className={classNames('icon', 'icon--tab-search')} /></button>
        {major.codes.map(code => (
          <button className={classNames((currentList === code ? 'tabs__elem--active' : ''))} key={code} onClick={() => this.changeTab(code)}><i className={classNames('icon', 'icon--tab-major')} /></button>
        ))}
        <button className={classNames((currentList === 'HUMANITY' ? 'tabs__elem--active' : ''))} onClick={() => this.changeTab('HUMANITY')}><i className={classNames('icon', 'icon--tab-humanity')} /></button>
        <button className={classNames((currentList === 'CART' ? 'tabs__elem--active' : ''))} onClick={() => this.changeTab('CART')}><i className={classNames('icon', 'icon--tab-cart')} /></button>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  currentList: state.timetable.list.currentList,
  search: state.timetable.list.search,
  major: state.timetable.list.major,
  humanity: state.timetable.list.humanity,
  cart: state.timetable.list.cart,
  lectureActiveFrom: state.timetable.lectureActive.from,
});

const mapDispatchToProps = dispatch => ({
  openSearchDispatch: () => {
    dispatch(openSearch());
  },
  closeSearchDispatch: () => {
    dispatch(closeSearch());
  },
  setCurrentListDispatch: (list) => {
    dispatch(setCurrentList(list));
  },
  clearLectureActiveDispatch: () => {
    dispatch(clearLectureActive());
  },
});

LectureListTabs.propTypes = {
  currentList: PropTypes.string.isRequired,
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
  lectureActiveFrom: PropTypes.oneOf([NONE, LIST, TABLE, MULTIPLE]).isRequired,
  openSearchDispatch: PropTypes.func.isRequired,
  closeSearchDispatch: PropTypes.func.isRequired,
  setCurrentListDispatch: PropTypes.func.isRequired,
  clearLectureActiveDispatch: PropTypes.func.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(LectureListTabs);
