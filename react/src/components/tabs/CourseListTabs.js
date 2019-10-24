import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { appBoundClassNames as classNames } from '../../common/boundClassNames';

import { /* openSearch, closeSearch, */setCurrentList } from '../../actions/dictionary/list';
import { clearCourseActive } from '../../actions/dictionary/courseActive';
// import { NONE, LIST, TABLE, MULTIPLE } from '../../reducers/timetable/lectureActive';
import courseShape from '../../shapes/CourseShape';


class CourseListTabs extends Component {
  changeTab = (list) => {
    const { search, setCurrentListDispatch/* , openSearchDispatch, closeSearchDispatch */, clearCourseActiveDispatch } = this.props;

    setCurrentListDispatch(list);

    if (list === 'SEARCH' && (search.courses === null || search.courses.length === 0)) {
      // openSearchDispatch();
    }
    else {
      // closeSearchDispatch();
    }

    clearCourseActiveDispatch();
  }

  render() {
    const { currentList, major } = this.props;

    return (
      <div className={classNames('tab--lecture-list')}>
        <button className={classNames((currentList === 'SEARCH' ? 'tab__elem--active' : ''))} onClick={() => this.changeTab('SEARCH')}><i className={classNames('icon', 'icon--block-search')} /></button>
        {major.codes.map(code => (
          <button className={classNames((currentList === code ? 'tab__elem--active' : ''))} key={code} onClick={() => this.changeTab(code)}><i className={classNames('icon', 'icon--block-major')} /></button>
        ))}
        <button className={classNames((currentList === 'HUMANITY' ? 'tab__elem--active' : ''))} onClick={() => this.changeTab('HUMANITY')}><i className={classNames('icon', 'icon--block-humanity')} /></button>
        <button className={classNames((currentList === 'TAKEN' ? 'tab__elem--active' : ''))} onClick={() => this.changeTab('TAKEN')}><i className={classNames('icon', 'icon--block-taken')} /></button>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  currentList: state.dictionary.list.currentList,
  search: state.dictionary.list.search,
  major: state.dictionary.list.major,
  humanity: state.dictionary.list.humanity,
  taken: state.dictionary.list.taken,
});

const mapDispatchToProps = dispatch => ({
  /*
  openSearchDispatch: () => {
    dispatch(openSearch());
  },
  closeSearchDispatch: () => {
    dispatch(closeSearch());
  },
  */
  setCurrentListDispatch: (list) => {
    dispatch(setCurrentList(list));
  },
  clearCourseActiveDispatch: () => {
    dispatch(clearCourseActive());
  },
});

CourseListTabs.propTypes = {
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
  /*
  openSearchDispatch: PropTypes.func.isRequired,
  closeSearchDispatch: PropTypes.func.isRequired,
  */
  setCurrentListDispatch: PropTypes.func.isRequired,
  clearCourseActiveDispatch: PropTypes.func.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(CourseListTabs);
