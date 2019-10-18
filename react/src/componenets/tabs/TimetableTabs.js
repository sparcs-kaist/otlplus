import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { appBoundClassNames as classNames } from '../../common/boundClassNames';
import axios from '../../common/presetAxios';

import { BASE_URL } from '../../common/constants';
import { setTimetables, createTimetable, setCurrentTimetable, deleteTimetable, duplicateTimetable, setMobileShowTimetableTabs } from '../../actions/timetable/index';
import timetableShape from '../../shapes/TimetableShape';


class TimetableTabs extends Component {
  componentDidUpdate(prevProps, prevState, snapshot) {
    const { year, semester } = this.props;

    if (year !== prevProps.year || semester !== prevProps.semester) {
      this._fetchTables();
    }
  }

  _fetchTables = () => {
    const { year, semester, setTimetablesDispatch } = this.props;

    axios.post(`${BASE_URL}/api/timetable/table_load`, {
      year: year,
      semester: semester,
    })
      .then((response) => {
        const newProps = this.props;
        if (newProps.year !== year || newProps.semester !== semester) {
          return;
        }
        setTimetablesDispatch(response.data);
      })
      .catch((response) => {
      });
  }

  changeTab(timetable) {
    const { setCurrentTimetableDispatch, setMobileShowTimetableTabsDispatch } = this.props;

    setCurrentTimetableDispatch(timetable);
    setMobileShowTimetableTabsDispatch(false);
  }

  createTable() {
    const { year, semester, createTimetableDispatch } = this.props;

    axios.post(`${BASE_URL}/api/timetable/table_create`, {
      year: year,
      semester: semester,
    })
      .then((response) => {
        const newProps = this.props;
        if (newProps.year !== year || newProps.semester !== semester) {
          return;
        }
        createTimetableDispatch(response.data.id);
      })
      .catch((response) => {
      });
  }

  deleteTable(event, timetable) {
    const { year, semester, deleteTimetableDispatch } = this.props;

    event.stopPropagation();
    axios.post(`${BASE_URL}/api/timetable/table_delete`, {
      table_id: timetable.id,
      year: year,
      semester: semester,
    })
      .then((response) => {
        const newProps = this.props;
        if (newProps.year !== year || newProps.semester !== semester) {
          return;
        }
        deleteTimetableDispatch(timetable);
      })
      .catch((response) => {
      });
  }

  duplicateTable(event, timetable) {
    const { year, semester, duplicateTimetableDispatch } = this.props;

    event.stopPropagation();
    axios.post(`${BASE_URL}/api/timetable/table_copy`, {
      table_id: timetable.id,
      year: year,
      semester: semester,
    })
      .then((response) => {
        const newProps = this.props;
        if (newProps.year !== year || newProps.semester !== semester) {
          return;
        }
        duplicateTimetableDispatch(response.data.id, timetable);
      })
      .catch((response) => {
      });
  }

  render() {
    const { timetables, currentTimetable } = this.props;

    if (timetables && timetables.length) {
      return (
        <div className={classNames('tab--timetable')}>
          { timetables.map((timetable, idx) => (
            <div className={classNames((timetable.id === currentTimetable.id ? 'active' : ''))} key={timetable.id} onClick={() => this.changeTab(timetable)}>
              <span>
                {`시간표 ${idx + 1}`}
              </span>
              <span onClick={event => this.duplicateTable(event, timetable)}><i className={classNames('icon', 'icon--duplicate-table')} /></span>
              <span onClick={event => this.deleteTable(event, timetable)}><i className={classNames('icon', 'icon--delete-table')} /></span>
            </div>
          ))}
          <div onClick={() => this.createTable()}>
            <i className={classNames('icon', 'icon--add-table')} />
          </div>
        </div>
      );
    }
    return (
        // eslint-disable-next-line react/jsx-indent
        <div className={classNames('tab--timetable')}>
          <div style={{ pointerEvents: 'none' }}>
            <span>불러오는 중</span>
          </div>
        </div>
    );
  }
}

const mapStateToProps = state => ({
  timetables: state.timetable.timetable.timetables,
  currentTimetable: state.timetable.timetable.currentTimetable,
  year: state.timetable.semester.year,
  semester: state.timetable.semester.semester,
});

const mapDispatchToProps = dispatch => ({
  setTimetablesDispatch: (timetables) => {
    dispatch(setTimetables(timetables));
  },
  setCurrentTimetableDispatch: (timetable) => {
    dispatch(setCurrentTimetable(timetable));
  },
  createTimetableDispatch: (id) => {
    dispatch(createTimetable(id));
  },
  deleteTimetableDispatch: (timetable) => {
    dispatch(deleteTimetable(timetable));
  },
  duplicateTimetableDispatch: (id, timetable) => {
    dispatch(duplicateTimetable(id, timetable));
  },
  setMobileShowTimetableTabsDispatch: (mobileShowTimetableTabs) => {
    dispatch(setMobileShowTimetableTabs(mobileShowTimetableTabs));
  },
});

TimetableTabs.propTypes = {
  timetables: PropTypes.arrayOf(timetableShape),
  currentTimetable: timetableShape,
  year: PropTypes.number,
  semester: PropTypes.number,
  setTimetablesDispatch: PropTypes.func.isRequired,
  setCurrentTimetableDispatch: PropTypes.func.isRequired,
  createTimetableDispatch: PropTypes.func.isRequired,
  deleteTimetableDispatch: PropTypes.func.isRequired,
  duplicateTimetableDispatch: PropTypes.func.isRequired,
  setMobileShowTimetableTabsDispatch: PropTypes.func.isRequired,
};


export default connect(mapStateToProps, mapDispatchToProps)(TimetableTabs);
