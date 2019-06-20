import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import axios from '../../common/presetAxios';
import { BASE_URL } from '../../common/constants';
import { setTimetables, createTimetable, setCurrentTimetable, deleteTimetable, duplicateTimetable } from '../../actions/timetable/index';
import timetableShape from '../../shapes/TimetableShape';


class TimetableTabs extends Component {
  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props.year !== prevProps.year || this.props.semester !== prevProps.semester) {
      this._fetchTables();
    }
  }

  _fetchTables = () => {
    axios.post(`${BASE_URL}/api/timetable/table_load`, {
      year: this.props.year,
      semester: this.props.semester,
    })
      .then((response) => {
        this.props.setTimetablesDispatch(response.data);
      })
      .catch((response) => {
      });
  }

  changeTab(timetable) {
    this.props.setCurrentTimetableDispatch(timetable);
  }

  createTable() {
    axios.post(`${BASE_URL}/api/timetable/table_create`, {
      year: this.props.year,
      semester: this.props.semester,
    })
      .then((response) => {
        this.props.createTimetableDispatch(response.data.id);
      })
      .catch((response) => {
      });
  }

  deleteTable(event, timetable) {
    event.stopPropagation();
    axios.post(`${BASE_URL}/api/timetable/table_delete`, {
      table_id: timetable.id,
      year: this.props.year,
      semester: this.props.semester,
    })
      .then((response) => {
        this.props.deleteTimetableDispatch(timetable);
      })
      .catch((response) => {
      });
  }

  duplicateTable(event, timetable) {
    event.stopPropagation();
    axios.post(`${BASE_URL}/api/timetable/table_copy`, {
      table_id: timetable.id,
      year: this.props.year,
      semester: this.props.semester,
    })
      .then((response) => {
        this.props.duplicateTimetableDispatch(response.data.id, timetable);
      })
      .catch((response) => {
      });
  }

  render() {
    if (this.props.timetables && this.props.timetables.length) {
      return (
        <div id="timetable-tabs">
          { this.props.timetables.map((timetable, idx) => (
            <div className={`timetable-tab${timetable.id === this.props.currentTimetable.id ? ' active' : ''}`} key={timetable.id} onClick={() => this.changeTab(timetable)}>
              <span className="timetable-num">
                {`시간표 ${idx + 1}`}
              </span>
              {
                this.props.showTimetableListFlag
                  ? (
                    <>
                      <span className="hidden-option delete-table" onClick={event => this.deleteTable(event, timetable)}><i /></span>
                      <span className="hidden-option duplicate-table" onClick={event => this.duplicateTable(event, timetable)}><i /></span>
                    </>
                  )
                  : (
                    <>
                      <span className="hidden-option duplicate-table" onClick={event => this.duplicateTable(event, timetable)}><i /></span>
                      <span className="hidden-option delete-table" onClick={event => this.deleteTable(event, timetable)}><i /></span>
                    </>
                  )
              }
            </div>
          ))}
          <div className="timetable-add" onClick={() => this.createTable()}>
            <span className="timetable-num"><i className="add-table" /></span>
          </div>
        </div>
      );
    }
    return (
        // eslint-disable-next-line react/jsx-indent
        <div id="timetable-tabs">
          <div className="timetable-tab" style={{ pointerEvents: 'none' }}>
            <span className="timetable-num">불러오는 중</span>
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
  showTimetableListFlag: state.timetable.mobile.showTimetableListFlag,
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
});

TimetableTabs.propTypes = {
  timetables: PropTypes.arrayOf(timetableShape).isRequired,
  currentTimetable: timetableShape.isRequired,
  year: PropTypes.number,
  semester: PropTypes.number,
  showTimetableListFlag: PropTypes.bool.isRequired,
  setTimetablesDispatch: PropTypes.func.isRequired,
  setCurrentTimetableDispatch: PropTypes.func.isRequired,
  createTimetableDispatch: PropTypes.func.isRequired,
  deleteTimetableDispatch: PropTypes.func.isRequired,
  duplicateTimetableDispatch: PropTypes.func.isRequired,
};


export default connect(mapStateToProps, mapDispatchToProps)(TimetableTabs);
