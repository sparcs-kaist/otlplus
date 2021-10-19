import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import axios from 'axios';
import ReactGA from 'react-ga';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';

import {
  setTimetables, clearTimetables, setMyTimetableLectures,
  setSelectedTimetable,
  createTimetable, deleteTimetable, duplicateTimetable,
  setMobileIsTimetableTabsOpen,
} from '../../../actions/timetable/timetable';

import userShape from '../../../shapes/UserShape';
import timetableShape from '../../../shapes/TimetableShape';


class TimetableTabs extends Component {
  componentDidMount() {
    const { user } = this.props;

    if (user) {
      this._setMyTimetable();
    }
  }


  componentDidUpdate(prevProps, prevState, snapshot) {
    const {
      user,
      year, semester,
      clearTimetablesDispatch,
    } = this.props;

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
    const {
      user,
      year, semester,
      setTimetablesDispatch,
    } = this.props;

    if (!user) {
      setTimetablesDispatch([]);
      this._performCreateTable();
      return;
    }

    if ((year == null) || (semester == null)) {
      return;
    }

    axios.get(
      `/api/users/${user.id}/timetables`,
      {
        params: {
          year: year,
          semester: semester,
          order: ['id'],
        },
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
        if (response.data.length === 0) {
          this._performCreateTable();
        }
      })
      .catch((error) => {
      });
  }

  _createRandomTimetableId = () => {
    return Math.floor(Math.random() * 100000000);
  }

  _setMyTimetable = () => {
    const {
      user,
      year, semester,
      setMyTimetableLecturesDispatch,
    } = this.props;

    const lectures = user.my_timetable_lectures
      .filter((l) => ((l.year === year) && (l.semester === semester)));
    setMyTimetableLecturesDispatch(lectures);
  }

  changeTab = (timetable) => {
    const { setSelectedTimetableDispatch, setMobileIsTimetableTabsOpenDispatch } = this.props;

    setSelectedTimetableDispatch(timetable);
    setMobileIsTimetableTabsOpenDispatch(false);

    ReactGA.event({
      category: 'Timetable - Timetable',
      action: 'Switched Timetable',
    });
  }

  _performCreateTable = () => {
    const {
      user,
      year, semester,
      createTimetableDispatch,
    } = this.props;

    if (!user) {
      createTimetableDispatch(this._createRandomTimetableId());
    }
    else {
      axios.post(
        `/api/users/${user.id}/timetables`,
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
  }

  createTable = () => {
    this._performCreateTable();

    ReactGA.event({
      category: 'Timetable - Timetable',
      action: 'Created Timetable',
    });
  }

  deleteTable = (event, timetable) => {
    const { t } = this.props;
    const {
      user,
      timetables,
      year, semester,
      deleteTimetableDispatch,
    } = this.props;

    event.stopPropagation();

    if (timetables.length === 1) {
      // eslint-disable-next-line no-alert
      alert(t('ui.message.lastTimetable'));
      return;
    }
    // eslint-disable-next-line no-alert
    if (!window.confirm(t('ui.message.timetableDelete'))) {
      return;
    }

    if (!user) {
      deleteTimetableDispatch(timetable);
    }
    else {
      axios.delete(
        `/api/users/${user.id}/timetables/${timetable.id}`,
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

  duplicateTable = (event, timetable) => {
    const {
      user,
      year, semester,
      duplicateTimetableDispatch,
    } = this.props;

    event.stopPropagation();

    if (!user) {
      duplicateTimetableDispatch(this._createRandomTimetableId(), timetable);
    }
    else {
      axios.post(
        `/api/users/${user.id}/timetables`,
        {
          year: year,
          semester: semester,
          lectures: timetable.lectures.map((l) => l.id),
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
    const {
      user,
      timetables, selectedTimetable, myTimetable,
    } = this.props;

    const myTimetableTab = (
      user
        ? (
          <div
            className={classNames(
              'tabs__elem',
              ((selectedTimetable && (myTimetable.id === selectedTimetable.id)) ? 'tabs__elem--selected' : null),
            )}
            key={myTimetable.id}
            onClick={() => this.changeTab(myTimetable)}
          >
            <span>
              {`${t('ui.others.myTable')}`}
            </span>
            <button onClick={(event) => this.duplicateTable(event, myTimetable)}>
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
    );

    const normalTimetableTabs = (
      (timetables && timetables.length)
        ? (
          <>
            {
              timetables.map((tt, i) => (
                <div
                  className={classNames(
                    'tabs__elem',
                    (tt.id === selectedTimetable.id ? 'tabs__elem--selected' : null),
                  )}
                  key={tt.id}
                  onClick={() => this.changeTab(tt)}
                >
                  <span>
                    {`${t('ui.others.table')} ${i + 1}`}
                  </span>
                  <button onClick={(event) => this.duplicateTable(event, tt)}>
                    <i className={classNames('icon', 'icon--duplicate-table')} />
                    <span>{t('ui.button.duplicateTable')}</span>
                  </button>
                  <button onClick={(event) => this.deleteTable(event, tt)}>
                    <i className={classNames('icon', 'icon--delete-table')} />
                    <span>{t('ui.button.deleteTable')}</span>
                  </button>
                </div>
              ))
            }
            <div className={classNames('tabs__elem', 'tabs__elem--add-button')} onClick={() => this.createTable()}>
              <i className={classNames('icon', 'icon--add-table')} />
            </div>
          </>
        )
        : (
          <div className={classNames(('tabs__elem'))} style={{ pointerEvents: 'none' }}>
            <span>{t('ui.placeholder.loading')}</span>
          </div>
        )
    );

    return (
      <div className={classNames('tabs', 'tabs--timetable')}>
        { myTimetableTab }
        { normalTimetableTabs }
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.common.user.user,
  timetables: state.timetable.timetable.timetables,
  selectedTimetable: state.timetable.timetable.selectedTimetable,
  myTimetable: state.timetable.timetable.myTimetable,
  year: state.timetable.semester.year,
  semester: state.timetable.semester.semester,
});

const mapDispatchToProps = (dispatch) => ({
  setTimetablesDispatch: (timetables) => {
    dispatch(setTimetables(timetables));
  },
  clearTimetablesDispatch: () => {
    dispatch(clearTimetables());
  },
  setMyTimetableLecturesDispatch: (lectures) => {
    dispatch(setMyTimetableLectures(lectures));
  },
  setSelectedTimetableDispatch: (timetable) => {
    dispatch(setSelectedTimetable(timetable));
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
  setMobileIsTimetableTabsOpenDispatch: (mobileIsTimetableTabsOpen) => {
    dispatch(setMobileIsTimetableTabsOpen(mobileIsTimetableTabsOpen));
  },
});

TimetableTabs.propTypes = {
  user: userShape,
  timetables: PropTypes.arrayOf(timetableShape),
  selectedTimetable: timetableShape,
  myTimetable: timetableShape.isRequired,
  year: PropTypes.number,
  semester: PropTypes.number,

  setTimetablesDispatch: PropTypes.func.isRequired,
  clearTimetablesDispatch: PropTypes.func.isRequired,
  setMyTimetableLecturesDispatch: PropTypes.func.isRequired,
  setSelectedTimetableDispatch: PropTypes.func.isRequired,
  createTimetableDispatch: PropTypes.func.isRequired,
  deleteTimetableDispatch: PropTypes.func.isRequired,
  duplicateTimetableDispatch: PropTypes.func.isRequired,
  setMobileIsTimetableTabsOpenDispatch: PropTypes.func.isRequired,
};


export default withTranslation()(
  connect(mapStateToProps, mapDispatchToProps)(
    TimetableTabs
  )
);
