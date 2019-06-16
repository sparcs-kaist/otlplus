import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { openSearch, closeSearch, setCurrentList, clearLectureActive } from '../../actions/timetable/index';
import { NONE, LIST, TABLE, MULTIPLE } from '../../reducers/timetable/lectureActive';
import lectureShape from '../../shapes/LectureShape';


class ListSection extends Component {
  changeTab = (list) => {
    this.props.setCurrentListDispatch(list);

    if (list === 'SEARCH' && this.props.search.courses.length === 0) {
      this.props.openSearchDispatch();
    }
    else {
      this.props.closeSearchDispatch();
    }

    if (this.props.lectureActiveFrom === LIST) {
      this.props.clearLectureActiveDispatch();
    }
  }

  render() {
    return (
      <div id="list-tab-wrap">
        <button className={`list-tab search${this.props.currentList === 'SEARCH' ? ' active' : ''}`} onClick={() => this.changeTab('SEARCH')}><i className="list-tab-icon" /></button>
        {this.props.major.codes.map(code => (
          <button className={`list-tab major${this.props.currentList === code ? ' active' : ''}`} key={code} onClick={() => this.changeTab(code)}><i className="list-tab-icon" /></button>
        ))}
        <button className={`list-tab humanity${this.props.currentList === 'HUMANITY' ? ' active' : ''}`} onClick={() => this.changeTab('HUMANITY')}><i className="list-tab-icon" /></button>
        <button className={`list-tab cart${this.props.currentList === 'CART' ? ' active' : ''}`} onClick={() => this.changeTab('CART')}><i className="list-tab-icon" /></button>
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

ListSection.propTypes = {
  currentList: PropTypes.string.isRequired,
  search: PropTypes.shape({
    courses: PropTypes.arrayOf(PropTypes.arrayOf(lectureShape)).isRequired,
  }).isRequired,
  major: PropTypes.shape({
    codes: PropTypes.arrayOf(PropTypes.string).isRequired,
  }).isRequired,
  humanity: PropTypes.shape({
    courses: PropTypes.arrayOf(PropTypes.arrayOf(lectureShape)).isRequired,
  }).isRequired,
  cart: PropTypes.shape({
    courses: PropTypes.arrayOf(PropTypes.arrayOf(lectureShape)).isRequired,
  }).isRequired,
  lectureActiveFrom: PropTypes.oneOf([NONE, LIST, TABLE, MULTIPLE]).isRequired,
  openSearchDispatch: PropTypes.func.isRequired,
  closeSearchDispatch: PropTypes.func.isRequired,
  setCurrentListDispatch: PropTypes.func.isRequired,
  clearLectureActiveDispatch: PropTypes.func.isRequired,
};

ListSection = connect(mapStateToProps, mapDispatchToProps)(ListSection);

export default ListSection;
