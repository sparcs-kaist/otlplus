import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import axios from 'axios';
import ReactGA from 'react-ga';

import { appBoundClassNames as classNames } from '../../../../common/boundClassNames';

import {
  setTimetables, clearTimetables, setMyTimetableLectures,
  setSelectedTimetable,
  createTimetable, deleteTimetable, duplicateTimetable,
  reorderTimetable,
  setMobileIsTimetableTabsOpen,
} from '../../../../actions/timetable/timetable';

import userShape from '../../../../shapes/model/session/UserShape';
import timetableShape, { myPseudoTimetableShape } from '../../../../shapes/model/timetable/TimetableShape';


class TimetableTabs extends Component {
  constructor(props) {
    super(props);

    this.state = {
      draggingTimetableId: undefined,
      dragStartPosition: undefined,
      dragCurrentPosition: undefined,
      dragOrderChanged: false,
    };
  }


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
          order: ['arrange_order', 'id'],
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
    if ((timetable.lectures.length > 0) && !window.confirm(t('ui.message.timetableDelete'))) {
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

  handlePointerDown = (e) => {
    e.stopPropagation();
    e.preventDefault();

    const { draggingTimetableId } = this.state;
    const { isPortrait } = this.props;

    if (draggingTimetableId === undefined) {
      this.setState({
        draggingTimetableId: Number(e.currentTarget.dataset.id),
        dragStartPosition: isPortrait ? e.clientY : e.clientX,
        dragCurrentPosition: isPortrait ? e.clientY : e.clientX,
        dragOrderChanged: false,
      });

      document.addEventListener('pointermove', this.handlePointerMove);
      document.addEventListener('pointerup', this.handlePointerUp);
      // eslint-disable-next-line fp/no-mutation
      document.body.style.cursor = 'grabbing';
    }
  }

  _checkAndReorderTimetablePrev = (dragPosition, isX) => {
    const { draggingTimetableId, dragStartPosition } = this.state;
    const { user, timetables, reorderTimetableDispatch } = this.props;

    const endPositionName = isX ? 'right' : 'bottom';
    const sizeName = isX ? 'width' : 'height';
    const tabMargin = isX ? 6 : 8;

    const tabElements = Array.from(
      document.querySelectorAll(
        `.${classNames('tabs--timetable')} .${classNames('tabs__elem--draggable')}`
      )
    );
    const draggingTabElement = document.querySelector(
      `.${classNames('tabs--timetable')} .${classNames('tabs__elem--dragging')}`
    );

    const draggingTabIndex = tabElements.findIndex((te) => (te === draggingTabElement));
    if (draggingTabIndex === 0) {
      return;
    }

    const prevTabElement = tabElements[draggingTabIndex - 1];
    if (dragPosition < prevTabElement.getBoundingClientRect()[endPositionName]) {
      const draggingTimetableIndex = timetables.findIndex((t) => (t.id === draggingTimetableId));
      const draggingTimetable = timetables[draggingTimetableIndex];
      const prevTimetable = timetables[draggingTimetableIndex - 1];
      if (user) {
        axios.post(
          `/api/users/${user.id}/timetables/${draggingTimetable.id}/reorder`,
          {
            arrange_order: prevTimetable.arrange_order,
          },
          {
            metadata: {
              gaCategory: 'Timetable',
              gaVariable: 'POST Reorder / Instance',
            },
          },
        )
          .then((response) => {
          })
          .catch((error) => {
          });
      }
      reorderTimetableDispatch(draggingTimetable, prevTimetable.arrange_order);
      this.setState({
        dragStartPosition:
          dragStartPosition - (prevTabElement.getBoundingClientRect()[sizeName] + tabMargin),
      });
    }
  }

  _checkAndReorderTimetableNext = (dragPosition, isX) => {
    const { draggingTimetableId, dragStartPosition } = this.state;
    const { user, timetables, reorderTimetableDispatch } = this.props;

    const startPositionName = isX ? 'left' : 'top';
    const sizeName = isX ? 'width' : 'height';
    const tabMargin = isX ? 6 : 8;

    const tabElements = Array.from(
      document.querySelectorAll(
        `.${classNames('tabs--timetable')} .${classNames('tabs__elem--draggable')}`
      )
    );
    const draggingTabElement = document.querySelector(
      `.${classNames('tabs--timetable')} .${classNames('tabs__elem--dragging')}`
    );

    const draggingTabIndex = tabElements.findIndex((te) => (te === draggingTabElement));
    if (draggingTabIndex === tabElements.length - 1) {
      return;
    }

    const nextTabElement = tabElements[draggingTabIndex + 1];
    if (dragPosition > nextTabElement.getBoundingClientRect()[startPositionName]) {
      const draggingTimetableIndex = timetables.findIndex((t) => (t.id === draggingTimetableId));
      const draggingTimetable = timetables[draggingTimetableIndex];
      const nextTimetable = timetables[draggingTimetableIndex + 1];
      if (user) {
        axios.post(
          `/api/users/${user.id}/timetables/${draggingTimetable.id}/reorder`,
          {
            arrange_order: nextTimetable.arrange_order,
          },
          {
            metadata: {
              gaCategory: 'Timetable',
              gaVariable: 'POST Reorder / Instance',
            },
          },
        )
          .then((response) => {
          })
          .catch((error) => {
          });
      }
      reorderTimetableDispatch(draggingTimetable, nextTimetable.arrange_order);
      this.setState({
        dragStartPosition:
          dragStartPosition + (nextTabElement.getBoundingClientRect()[sizeName] + tabMargin),
      });
    }
  }

  handlePointerMove = (e) => {
    const { dragStartPosition, dragCurrentPosition, draggingTimetableId } = this.state;
    const { isPortrait } = this.props;

    const newPosition = isPortrait ? e.clientY : e.clientX;
    const deltaPosition = newPosition - dragCurrentPosition;

    if (draggingTimetableId !== undefined) {
      this.setState({
        dragCurrentPosition: newPosition,
      });

      if (Math.abs(newPosition - dragStartPosition) > 10) {
        this.setState({
          dragOrderChanged: true,
        });
      }

      if (deltaPosition > 0) {
        this._checkAndReorderTimetableNext(newPosition, !isPortrait);
      }
      else if (deltaPosition < 0) {
        this._checkAndReorderTimetablePrev(newPosition, !isPortrait);
      }
    }
  }

  handlePointerUp = (e) => {
    const { draggingTimetableId } = this.state;

    if (draggingTimetableId !== undefined) {
      this.setState({
        draggingTimetableId: undefined,
        dragStartPosition: undefined,
        dragCurrentPosition: undefined,
        dragOrderChanged: false,
      });

      document.removeEventListener('pointermove', this.handlePointerMove);
      document.removeEventListener('pointerup', this.handlePointerUp);
      // eslint-disable-next-line fp/no-mutation
      document.body.style.cursor = '';
    }
  }

  _isSelected = (timetable) => {
    const { selectedTimetable } = this.props;

    return selectedTimetable && (timetable.id === selectedTimetable.id);
  }

  _isDragging = (timetable) => {
    const { draggingTimetableId } = this.state;

    return (draggingTimetableId !== undefined) && (timetable.id === draggingTimetableId);
  }

  _getTabRelativePosition = (timetable) => {
    if (!this._isDragging(timetable)) {
      return undefined;
    }

    const { dragStartPosition, dragCurrentPosition } = this.state;
    const { timetables } = this.props;

    const relativePosition = dragCurrentPosition - dragStartPosition;
    if ((timetables.findIndex((t) => (t.id === timetable.id)) === 0)
      && relativePosition < 0) {
      return 0;
    }
    if ((timetables.findIndex((t) => (t.id === timetable.id)) === timetables.length - 1)
      && relativePosition > 0) {
      return 0;
    }
    return relativePosition;
  }

  render() {
    const { dragOrderChanged } = this.state;
    const { t } = this.props;
    const {
      user,
      isPortrait,
      timetables, myTimetable,
    } = this.props;

    const myTimetableTab = (
      user
        ? (
          <div
            className={classNames(
              'tabs__elem',
              (this._isSelected(myTimetable) ? 'tabs__elem--selected' : null),
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
          timetables.map((tt, i) => (
            <div
              className={classNames(
                'tabs__elem',
                'tabs__elem--draggable',
                (this._isSelected(tt) ? 'tabs__elem--selected' : null),
                (this._isDragging(tt) ? 'tabs__elem--dragging' : null),
              )}
              key={tt.id}
              onClick={() => this.changeTab(tt)}
              onPointerDown={this.handlePointerDown}
              data-id={tt.id}
              style={{
                [isPortrait ? 'top' : 'left']: this._getTabRelativePosition(tt),
                pointerEvents: dragOrderChanged ? 'none' : undefined,
              }}
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
        )
        : (
          <div className={classNames(('tabs__elem'))} style={{ pointerEvents: 'none' }}>
            <span>{t('ui.placeholder.loading')}</span>
          </div>
        )
    );
    const addTabButton = (
      (timetables && timetables.length)
        ? (
          <div className={classNames('tabs__elem', 'tabs__elem--add-button')} onClick={() => this.createTable()}>
            <i className={classNames('icon', 'icon--add-table')} />
          </div>
        )
        : null
    );

    return (
      <div className={classNames('tabs', 'tabs--timetable')}>
        { myTimetableTab }
        { normalTimetableTabs }
        { addTabButton }
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.common.user.user,
  isPortrait: state.common.media.isPortrait,
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
  reorderTimetableDispatch: (timetable, arrangeOrder) => {
    dispatch(reorderTimetable(timetable, arrangeOrder));
  },
  setMobileIsTimetableTabsOpenDispatch: (mobileIsTimetableTabsOpen) => {
    dispatch(setMobileIsTimetableTabsOpen(mobileIsTimetableTabsOpen));
  },
});

TimetableTabs.propTypes = {
  user: userShape,
  isPortrait: PropTypes.bool.isRequired,
  timetables: PropTypes.arrayOf(timetableShape),
  selectedTimetable: PropTypes.oneOfType([timetableShape, myPseudoTimetableShape]),
  myTimetable: myPseudoTimetableShape.isRequired,
  year: PropTypes.number,
  semester: PropTypes.oneOf([1, 2, 3, 4]),

  setTimetablesDispatch: PropTypes.func.isRequired,
  clearTimetablesDispatch: PropTypes.func.isRequired,
  setMyTimetableLecturesDispatch: PropTypes.func.isRequired,
  setSelectedTimetableDispatch: PropTypes.func.isRequired,
  createTimetableDispatch: PropTypes.func.isRequired,
  deleteTimetableDispatch: PropTypes.func.isRequired,
  duplicateTimetableDispatch: PropTypes.func.isRequired,
  reorderTimetableDispatch: PropTypes.func.isRequired,
  setMobileIsTimetableTabsOpenDispatch: PropTypes.func.isRequired,
};


export default withTranslation()(
  connect(mapStateToProps, mapDispatchToProps)(
    TimetableTabs
  )
);
