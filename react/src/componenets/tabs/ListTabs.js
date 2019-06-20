import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { openSearch, closeSearch, setCurrentList, clearLectureActive } from '../../actions/timetable/index';
import { NONE, LIST, TABLE, MULTIPLE } from '../../reducers/timetable/lectureActive';
import lectureShape from '../../shapes/LectureShape';


class ListTabs extends Component {
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
      <div id="list-tab-wrap">
        <button className={`list-tab search${currentList === 'SEARCH' ? ' active' : ''}`} onClick={() => this.changeTab('SEARCH')}><i className="list-tab-icon" /></button>
        {major.codes.map(code => (
          <button className={`list-tab major${currentList === code ? ' active' : ''}`} key={code} onClick={() => this.changeTab(code)}><i className="list-tab-icon" /></button>
        ))}
        <button className={`list-tab humanity${currentList === 'HUMANITY' ? ' active' : ''}`} onClick={() => this.changeTab('HUMANITY')}><i className="list-tab-icon" /></button>
        <button className={`list-tab cart${currentList === 'CART' ? ' active' : ''}`} onClick={() => this.changeTab('CART')}><i className="list-tab-icon" /></button>
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

ListTabs.propTypes = {
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

export default connect(mapStateToProps, mapDispatchToProps)(ListTabs);
