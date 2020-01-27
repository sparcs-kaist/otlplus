import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import axios from 'axios';
import ReactGA from 'react-ga';

import { appBoundClassNames as classNames } from '../../common/boundClassNames';

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
    else if (!prevProps.user && user) {
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
    const { user, year, semester, setTimetablesDispatch } = this.props;

    if (!user) {
      setTimetablesDispatch([
        {
          id: this._createRandomTimetableId(),
          lectures: [],
        },
      ]);
      return;
    }

    if ((year == null) || (semester == null)) {
      return;
    }

    axios.post(
      '/api/timetable/table_load',
      {
        year: year,
        semester: semester,
      },
      {
        metadata: {
          gaCategory: 'Timetable',
          gaVariable: 'GET / List',
        },
      },
    )
      .then((response) => {
        const newProps = this.props;
        if (newProps.year !== year || newProps.semester !== semester) {
          return;
        }
        setTimetablesDispatch(response.data);
      })
      .catch((error) => {
      });
  }

  _createRandomTimetableId = () => {
    return Math.floor(Math.random() * 100000000);
  }

  _setMyTimetable = () => {
    const { user, year, semester, setMyTimetableLecturesDispatch } = this.props;

    const lectures = user.my_timetable_lectures.filter(l => ((l.year === year) && (l.semester === semester)));
    setMyTimetableLecturesDispatch(lectures);
  }

  changeTab(timetable) {
    const { setCurrentTimetableDispatch, setMobileShowTimetableTabsDispatch } = this.props;

    setCurrentTimetableDispatch(timetable);
    setMobileShowTimetableTabsDispatch(false);

    ReactGA.event({
      category: 'Timetable - Timetable',
      action: 'Switched Timetable',
    });
  }

  createTable() {
    const { user, year, semester, createTimetableDispatch } = this.props;

    if (!user) {
      createTimetableDispatch(this._createRandomTimetableId());
    }
    else {
      axios.post(
        '/api/timetable/table_create',
        {
          year: year,
          semester: semester,
          lectures: [],
        }, 
        {
          metadata: {
            gaCategory: 'Timetable',
            gaVariable: 'POST / List',
          },
        }, 
      )
        .then((response) => {
          const newProps = this.props;
          if (newProps.year !== year || newProps.semester !== semester) {
            return;
          }
          createTimetableDispatch(response.data.id);
        })
        .catch((error) => {
        });
    }

    ReactGA.event({
      category: 'Timetable - Timetable',
      action: 'Created Timetable',
    });
  }

  deleteTable(event, timetable) {
    const { t } = this.props;
    const { user, timetables, year, semester, deleteTimetableDispatch } = this.props;

    event.stopPropagation();

    if (!user) {
      deleteTimetableDispatch(timetable);
      return;
    }

    if (timetables.length === 1) {
      // eslint-disable-next-line no-alert
      alert(t('ui.message.lastTimetable'));
    }
    else {
      axios.post(
        '/api/timetable/table_delete',
        {
          table_id: timetable.id,
          year: year,
          semester: semester,
        }, 
        {
          metadata: {
            gaCategory: 'Timetable',
            gaVariable: 'DELETE / Instance',
          },
        }, 
      )
        .then((response) => {
          const newProps = this.props;
          if (newProps.year !== year || newProps.semester !== semester) {
            return;
          }
          deleteTimetableDispatch(timetable);
        })
        .catch((error) => {
        });
    }

    ReactGA.event({
      category: 'Timetable - Timetable',
      action: 'Deleted Timetable',
    });
  }

  duplicateTable(event, timetable) {
    const { user, year, semester, duplicateTimetableDispatch } = this.props;

    event.stopPropagation();

    if (!user) {
      duplicateTimetableDispatch(this._createRandomTimetableId(), timetable);
    }
    else {
      axios.post(
        '/api/timetable/table_create',
        {
          year: year,
          semester: semester,
          lectures: timetable.lectures.map(l => l.id),
        }, 
        {
          metadata: {
            gaCategory: 'Timetable',
            gaVariable: 'POST / List',
          },
        }, 
      )
        .then((response) => {
          const newProps = this.props;
          if (newProps.year !== year || newProps.semester !== semester) {
            return;
          }
          duplicateTimetableDispatch(response.data.id, timetable);
        })
        .catch((error) => {
        });
    }

    ReactGA.event({
      category: 'Timetable - Timetable',
      action: 'Duplicated Timetable',
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
                <button onClick={event => this.duplicateTable(event, myTimetable)}>
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
          <div className={classNames('tabs--timetable__add-button')} onClick={() => this.createTable()}>
            <i className={classNames('icon', 'icon--add-table')} />
          </div>
        </div>
      );
    }
    return (
      <div className={classNames('tabs', 'tabs--timetable')}>
        { user
          ? (
            <div className={classNames(((currentTimetable && (myTimetable.id === currentTimetable.id)) ? 'tabs__elem--active' : ''))} key={myTimetable.id} style={{ pointerEvents: 'none' }}>
              <span>
                {`${t('ui.others.myTable')}`}
              </span>
              <button className={classNames('disabled')}>
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
