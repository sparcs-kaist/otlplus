import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { appBoundClassNames as classNames } from '../../common/boundClassNames';
import axios from '../../common/presetAxios';

import { BASE_URL } from '../../common/constants';
import { setTimetables, clearTimetables, setMyTimetableLectures, createTimetable, setCurrentTimetable, deleteTimetable, duplicateTimetable, setMobileShowTimetableTabs } from '../../actions/timetable/timetable';
import userShape from '../../shapes/UserShape';
import timetableShape from '../../shapes/TimetableShape';


class TimetableTabs extends Component {
  componentDidMount() {
    const { user } = this.props;

    if (user) {
      this._setMyTimetable();
    }
  }


  componentDidUpdate(prevProps, prevState, snapshot) {
    const { user, year, semester, clearTimetablesDispatch } = this.props;

    if (year !== prevProps.year || semester !== prevProps.semester) {
      clearTimetablesDispatch();
      this._fetchTables();
    }

    if (!prevProps.user && user) {
      this._setMyTimetable();
    }
    else if (user && ((prevProps.year !== year) || (semester !== prevProps.semester))) {
      this._setMyTimetable();
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

  _setMyTimetable = () => {
    const { user, year, semester, setMyTimetableLecturesDispatch } = this.props;

    const lectures = user.taken_lectures.filter(l => ((l.year === year) && (l.semester === semester)));
    setMyTimetableLecturesDispatch(lectures);
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
    const { t } = this.props;
    const { timetables, year, semester, deleteTimetableDispatch } = this.props;

    event.stopPropagation();

    if (timetables.length === 1) {
      // eslint-disable-next-line no-alert
      alert(t('ui.message.lastTimetable'));
      return;
    }
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
    const { t } = this.props;
    const { user, timetables, currentTimetable, myTimetable } = this.props;

    if (timetables && timetables.length) {
      return (
        <div className={classNames('tabs', 'tabs--timetable')}>
          { user
            ? (
              <div className={classNames((myTimetable.id === currentTimetable.id ? 'tabs__elem--active' : ''))} key={myTimetable.id} onClick={() => this.changeTab(myTimetable)}>
                <span>
                  {`${t('ui.others.myTable')}`}
                </span>
                <button>
                  <i className={classNames('icon', 'icon--duplicate-table')} />
                  <span>{t('ui.button.duplicateTable')}</span>
                </button>
                <button className={classNames('disabled')}>
                  <i className={classNames('icon', 'icon--delete-table')} />
                  <span>{t('ui.button.deleteTable')}</span>
                </button>
              </div>
            )
            : null
          }
          { timetables.map((timetable, idx) => (
            <div className={classNames((timetable.id === currentTimetable.id ? 'tabs__elem--active' : ''))} key={timetable.id} onClick={() => this.changeTab(timetable)}>
              <span>
                {`${t('ui.others.table')} ${idx + 1}`}
              </span>
              <button onClick={event => this.duplicateTable(event, timetable)}>
                <i className={classNames('icon', 'icon--duplicate-table')} />
                <span>{t('ui.button.duplicateTable')}</span>
              </button>
              <button onClick={event => this.deleteTable(event, timetable)}>
                <i className={classNames('icon', 'icon--delete-table')} />
                <span>{t('ui.button.deleteTable')}</span>
              </button>
            </div>
          ))}
          <div onClick={() => this.createTable()}>
            <i className={classNames('icon', 'icon--add-table')} />
          </div>
        </div>
      );
    }
    return (
      <div className={classNames('tabs', 'tabs--timetable')}>
        <div style={{ pointerEvents: 'none' }}>
          <span>{t('ui.placeholder.loading')}</span>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  user: state.common.user.user,
  timetables: state.timetable.timetable.timetables,
  currentTimetable: state.timetable.timetable.currentTimetable,
  myTimetable: state.timetable.timetable.myTimetable,
  year: state.timetable.semester.year,
  semester: state.timetable.semester.semester,
});

const mapDispatchToProps = dispatch => ({
  setTimetablesDispatch: (timetables) => {
    dispatch(setTimetables(timetables));
  },
  clearTimetablesDispatch: () => {
    dispatch(clearTimetables());
  },
  setMyTimetableLecturesDispatch: (lectures) => {
    dispatch(setMyTimetableLectures(lectures));
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
  user: userShape,
  timetables: PropTypes.arrayOf(timetableShape),
  currentTimetable: timetableShape,
  myTimetable: timetableShape.isRequired,
  year: PropTypes.number,
  semester: PropTypes.number,
  setTimetablesDispatch: PropTypes.func.isRequired,
  clearTimetablesDispatch: PropTypes.func.isRequired,
  setMyTimetableLecturesDispatch: PropTypes.func.isRequired,
  setCurrentTimetableDispatch: PropTypes.func.isRequired,
  createTimetableDispatch: PropTypes.func.isRequired,
  deleteTimetableDispatch: PropTypes.func.isRequired,
  duplicateTimetableDispatch: PropTypes.func.isRequired,
  setMobileShowTimetableTabsDispatch: PropTypes.func.isRequired,
};


export default withTranslation()(connect(mapStateToProps, mapDispatchToProps)(TimetableTabs));
