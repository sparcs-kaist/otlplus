import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import axios from 'axios';
import ReactGA from 'react-ga';
import { min } from 'lodash';

import { appBoundClassNames as classNames } from '../../../../common/boundClassNames';

import {
  setPlanners, clearPlanners,
  setSelectedPlanner,
  createPlanner, deletePlanner, reorderPlanner,
} from '../../../../actions/planner/planner';

import userShape from '../../../../shapes/model/session/UserShape';
import plannerShape from '../../../../shapes/model/planner/PlannerShape';
import generalTrackShape from '../../../../shapes/model/graduation/GeneralTrackShape';
import majorTrackShape from '../../../../shapes/model/graduation/MajorTrackShape';
import additionalTrackShape from '../../../../shapes/model/graduation/AdditionalTrackShape';


class PlannerTabs extends Component {
  constructor(props) {
    super(props);

    this.state = {
      draggingPlannerId: undefined,
      dragStartPosition: undefined,
      dragCurrentPosition: undefined,
      dragOrderChanged: false,
    };
  }

  componentDidMount() {
    const { tracks } = this.props;

    if (tracks) {
      this._fetchPlanners();
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const {
      user, tracks,
      clearPlannersDispatch,
    } = this.props;

    if (!prevProps.tracks && tracks) {
      this._fetchPlanners();
    }
    if (tracks && !prevProps.user && user) {
      clearPlannersDispatch();
      this._fetchPlanners();
    }
  }

  _fetchPlanners = () => {
    const {
      user,
      setPlannersDispatch,
    } = this.props;

    if (!user) {
      setPlannersDispatch([]);
      this._performCreatePlanner();
      return;
    }

    axios.get(
      `/api/users/${user.id}/planners`,
      {
        params: {
          order: ['arrange_order', 'id'],
        },
        metadata: {
          gaCategory: 'Planner',
          gaVariable: 'GET / List',
        },
      },
    )
      .then((response) => {
        setPlannersDispatch(response.data);
        if (response.data.length === 0) {
          this._performCreatePlanner();
        }
      })
      .catch((error) => {
      });
  }

  _createRandomPlannerId = () => {
    return Math.floor(Math.random() * 100000000);
  }

  _getPlannerStartYear = (user) => {
    const currentYear = (new Date()).getFullYear();

    if (!user) {
      return currentYear;
    }

    if (user.student_id
      && user.student_id.length !== 8
      && user.student_id[4] === '0') {
      const userEntranceYear = parseInt(user.student_id.substring(0, 4), 10);
      if (userEntranceYear >= 2000 && userEntranceYear <= currentYear) {
        return userEntranceYear;
      }
    }

    if (user.review_writable_lectures.length > 0) {
      const firstTakenLectureYear = min(user.review_writable_lectures.map((l) => l.year));
      if (firstTakenLectureYear >= 2000 && firstTakenLectureYear <= currentYear) {
        return firstTakenLectureYear;
      }
    }

    return currentYear;
  }

  _getPlannerGeneralTrack = (user, startYear) => {
    const { tracks } = this.props;

    const yearedTracks = tracks.general.filter((gt) => (
      startYear >= gt.start_year
        && startYear <= gt.end_year
    ));
    const targetTracks = yearedTracks.filter((gt) => (
      !gt.is_foreign
    ));

    if (targetTracks.length > 0) {
      return targetTracks[0];
    }
    return yearedTracks[0];
  }

  _getPlannerMajorTrack = (user, startYear) => {
    const { tracks } = this.props;

    const yearedTracks = tracks.major.filter((mt) => (
      startYear >= mt.start_year
        && startYear <= mt.end_year
    ));
    const targetTracks = yearedTracks.filter((mt) => (
      mt.department.code === user?.department?.code
    ));

    if (targetTracks.length > 0) {
      return targetTracks[0];
    }
    return yearedTracks[0];
  }

  changeTab = (planner) => {
    const { setSelectedPlannerDispatch } = this.props;

    setSelectedPlannerDispatch(planner);

    ReactGA.event({
      category: 'Planner - Planner',
      action: 'Switched Planner',
    });
  }

  _performCreatePlanner = () => {
    const {
      user,
      createPlannerDispatch,
      planners,
    } = this.props;

    const startYear = this._getPlannerStartYear(user);
    const endYear = Math.max(startYear + 3, (new Date()).getFullYear());
    const generalTrack = this._getPlannerGeneralTrack(user, startYear);
    const majorTrack = this._getPlannerMajorTrack(user, startYear);

    const arrangeOrder = (planners && planners.length > 0)
      ? Math.max(...planners.map((t) => t.arrange_order)) + 1
      : 0;

    if (!user) {
      createPlannerDispatch({
        id: this._createRandomPlannerId(),
        start_year: startYear,
        end_year: endYear,
        general_track: generalTrack,
        major_track: majorTrack,
        additional_tracks: [],
        taken_items: [],
        future_items: [],
        arbitrary_items: [],
        arrange_order: arrangeOrder,
      });
    }
    else {
      axios.post(
        `/api/users/${user.id}/planners`,
        {
          start_year: startYear,
          end_year: endYear,
          general_track: generalTrack.id,
          major_track: majorTrack.id,
          additional_tracks: [],
          should_update_taken_semesters: true,
          taken_items_to_copy: [],
          future_items_to_copy: [],
          arbitrary_items_to_copy: [],
        },
        {
          metadata: {
            gaCategory: 'Planner',
            gaVariable: 'POST / List',
          },
        },
      )
        .then((response) => {
          createPlannerDispatch(response.data);
        })
        .catch((error) => {
        });
    }
  }

  createPlanner = () => {
    this._performCreatePlanner();

    ReactGA.event({
      category: 'Planner - Planner',
      action: 'Created Planner',
    });
  }

  deletePlanner = (event, planner) => {
    const { t } = this.props;
    const {
      user,
      planners,
      deletePlannerDispatch,
    } = this.props;

    event.stopPropagation();

    if (planners.length === 1) {
      // eslint-disable-next-line no-alert
      alert(t('ui.message.lastPlanner'));
      return;
    }
    // eslint-disable-next-line no-alert
    if (!window.confirm(t('ui.message.plannerDelete'))) {
      return;
    }

    if (!user) {
      deletePlannerDispatch(planner);
    }
    else {
      axios.delete(
        `/api/users/${user.id}/planners/${planner.id}`,
        {
          metadata: {
            gaCategory: 'Planner',
            gaVariable: 'DELETE / Instance',
          },
        },
      )
        .then((response) => {
          deletePlannerDispatch(planner);
        })
        .catch((error) => {
        });
    }

    ReactGA.event({
      category: 'Planner - Planner',
      action: 'Deleted Planner',
    });
  }

  duplicatePlanner = (event, planner) => {
    const {
      user, planners,
      createPlannerDispatch,
    } = this.props;

    event.stopPropagation();

    const arrangeOrder = Math.max(...planners.map((t) => t.arrange_order)) + 1;

    if (!user) {
      const newPlanner = {
        ...planner,
        id: this._createRandomPlannerId(),
        taken_items: planner.taken_items.map((i) => ({
          ...i,
          id: this._createRandomPlannerId(),
        })),
        future_items: planner.future_items.map((i) => ({
          ...i,
          id: this._createRandomPlannerId(),
        })),
        arbitrary_items: planner.arbitrary_items.map((i) => ({
          ...i,
          id: this._createRandomPlannerId(),
        })),
        arrange_order: arrangeOrder,
      };
      createPlannerDispatch(newPlanner);
    }
    else {
      axios.post(
        `/api/users/${user.id}/planners`,
        {
          start_year: planner.start_year,
          end_year: planner.end_year,
          general_track: planner.general_track.id,
          major_track: planner.major_track.id,
          additional_tracks: planner.additional_tracks.map((at) => at.id),
          taken_items_to_copy: planner.taken_items.map((i) => i.id),
          future_items_to_copy: planner.future_items.map((i) => i.id),
          arbitrary_items_to_copy: planner.arbitrary_items.map((i) => i.id),
        },
        {
          metadata: {
            gaCategory: 'Planner',
            gaVariable: 'POST / List',
          },
        },
      )
        .then((response) => {
          createPlannerDispatch(response.data);
        })
        .catch((error) => {
        });
    }

    ReactGA.event({
      category: 'Planner - Planner',
      action: 'Duplicated Planner',
    });
  }

  handlePointerDown = (e) => {
    e.stopPropagation();
    e.preventDefault();

    const { draggingPlannerId } = this.state;
    const { isPortrait } = this.props;

    if (draggingPlannerId === undefined) {
      this.setState({
        draggingPlannerId: Number(e.currentTarget.dataset.id),
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

  _checkAndReorderPlannerPrev = (dragPosition, isX) => {
    const { draggingPlannerId, dragStartPosition } = this.state;
    const { user, planners, reorderPlannerDispatch } = this.props;

    const endPositionName = isX ? 'right' : 'bottom';
    const sizeName = isX ? 'width' : 'height';
    const tabMargin = isX ? 6 : 8;

    const tabElements = Array.from(
      document.querySelectorAll(
        `.${classNames('tabs--planner')} .${classNames('tabs__elem--draggable')}`
      )
    );
    const draggingTabElement = document.querySelector(
      `.${classNames('tabs--planner')} .${classNames('tabs__elem--dragging')}`
    );

    const draggingTabIndex = tabElements.findIndex((te) => (te === draggingTabElement));
    if (draggingTabIndex === 0) {
      return;
    }

    const prevTabElement = tabElements[draggingTabIndex - 1];
    if (dragPosition < prevTabElement.getBoundingClientRect()[endPositionName]) {
      const draggingPlannerIndex = planners.findIndex((t) => (t.id === draggingPlannerId));
      const draggingPlanner = planners[draggingPlannerIndex];
      const prevPlanner = planners[draggingPlannerIndex - 1];
      if (user) {
        axios.post(
          `/api/users/${user.id}/planners/${draggingPlanner.id}/reorder`,
          {
            arrange_order: prevPlanner.arrange_order,
          },
          {
            metadata: {
              gaCategory: 'Planner',
              gaVariable: 'POST Reorder / Instance',
            },
          },
        )
          .then((response) => {
          })
          .catch((error) => {
          });
      }
      reorderPlannerDispatch(draggingPlanner, prevPlanner.arrange_order);
      this.setState({
        dragStartPosition:
          dragStartPosition - (prevTabElement.getBoundingClientRect()[sizeName] + tabMargin),
      });
    }
  }

  _checkAndReorderPlannerNext = (dragPosition, isX) => {
    const { draggingPlannerId, dragStartPosition } = this.state;
    const { user, planners, reorderPlannerDispatch } = this.props;

    const startPositionName = isX ? 'left' : 'top';
    const sizeName = isX ? 'width' : 'height';
    const tabMargin = isX ? 6 : 8;

    const tabElements = Array.from(
      document.querySelectorAll(
        `.${classNames('tabs--planner')} .${classNames('tabs__elem--draggable')}`
      )
    );
    const draggingTabElement = document.querySelector(
      `.${classNames('tabs--planner')} .${classNames('tabs__elem--dragging')}`
    );

    const draggingTabIndex = tabElements.findIndex((te) => (te === draggingTabElement));
    if (draggingTabIndex === tabElements.length - 1) {
      return;
    }

    const nextTabElement = tabElements[draggingTabIndex + 1];
    if (dragPosition > nextTabElement.getBoundingClientRect()[startPositionName]) {
      const draggingPlannerIndex = planners.findIndex((t) => (t.id === draggingPlannerId));
      const draggingPlanner = planners[draggingPlannerIndex];
      const nextPlanner = planners[draggingPlannerIndex + 1];
      if (user) {
        axios.post(
          `/api/users/${user.id}/planners/${draggingPlanner.id}/reorder`,
          {
            arrange_order: nextPlanner.arrange_order,
          },
          {
            metadata: {
              gaCategory: 'Planner',
              gaVariable: 'POST Reorder / Instance',
            },
          },
        )
          .then((response) => {
          })
          .catch((error) => {
          });
      }
      reorderPlannerDispatch(draggingPlanner, nextPlanner.arrange_order);
      this.setState({
        dragStartPosition:
          dragStartPosition + (nextTabElement.getBoundingClientRect()[sizeName] + tabMargin),
      });
    }
  }

  handlePointerMove = (e) => {
    const { dragStartPosition, dragCurrentPosition, draggingPlannerId } = this.state;
    const { isPortrait } = this.props;

    const newPosition = isPortrait ? e.clientY : e.clientX;
    const deltaPosition = newPosition - dragCurrentPosition;

    if (draggingPlannerId !== undefined) {
      this.setState({
        dragCurrentPosition: newPosition,
      });

      if (Math.abs(newPosition - dragStartPosition) > 10) {
        this.setState({
          dragOrderChanged: true,
        });
      }

      if (deltaPosition > 0) {
        this._checkAndReorderPlannerNext(newPosition, !isPortrait);
      }
      else if (deltaPosition < 0) {
        this._checkAndReorderPlannerPrev(newPosition, !isPortrait);
      }
    }
  }

  handlePointerUp = (e) => {
    const { draggingPlannerId } = this.state;

    if (draggingPlannerId !== undefined) {
      this.setState({
        draggingPlannerId: undefined,
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

  _isSelected = (planner) => {
    const { selectedPlanner } = this.props;

    return selectedPlanner && (planner.id === selectedPlanner.id);
  }

  _isDragging = (planner) => {
    const { draggingPlannerId } = this.state;

    return (draggingPlannerId !== undefined) && (planner.id === draggingPlannerId);
  }

  _getTabRelativePosition = (planner) => {
    if (!this._isDragging(planner)) {
      return undefined;
    }

    const { dragStartPosition, dragCurrentPosition } = this.state;
    const { planners } = this.props;

    const relativePosition = dragCurrentPosition - dragStartPosition;
    if ((planners.findIndex((t) => (t.id === planner.id)) === 0)
      && relativePosition < 0) {
      return 0;
    }
    if ((planners.findIndex((t) => (t.id === planner.id)) === planners.length - 1)
      && relativePosition > 0) {
      return 0;
    }
    return relativePosition;
  }

  render() {
    const { dragOrderChanged } = this.state;
    const { t } = this.props;
    const {
      isPortrait,
      planners,
    } = this.props;

    const normalPlannerTabs = (
      (planners && planners.length)
        ? (
          planners.map((tt, i) => (
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
                {`${t('ui.others.planner')} ${i + 1}`}
              </span>
              <button onClick={(event) => this.duplicatePlanner(event, tt)}>
                <i className={classNames('icon', 'icon--duplicate-table')} />
                <span>{t('ui.button.duplicatePlanner')}</span>
              </button>
              <button onClick={(event) => this.deletePlanner(event, tt)}>
                <i className={classNames('icon', 'icon--delete-table')} />
                <span>{t('ui.button.deletePlanner')}</span>
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
      (planners && planners.length)
        ? (
          <div className={classNames('tabs__elem', 'tabs__elem--add-button')} onClick={() => this.createPlanner()}>
            <i className={classNames('icon', 'icon--add-table')} />
          </div>
        )
        : null
    );

    return (
      <div className={classNames('tabs', 'tabs--planner')}>
        {normalPlannerTabs}
        {addTabButton}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.common.user.user,
  isPortrait: state.common.media.isPortrait,
  tracks: state.common.track.tracks,
  planners: state.planner.planner.planners,
  selectedPlanner: state.planner.planner.selectedPlanner,
  myPlanner: state.planner.planner.myPlanner,
});

const mapDispatchToProps = (dispatch) => ({
  setPlannersDispatch: (planners) => {
    dispatch(setPlanners(planners));
  },
  clearPlannersDispatch: () => {
    dispatch(clearPlanners());
  },
  setSelectedPlannerDispatch: (planner) => {
    dispatch(setSelectedPlanner(planner));
  },
  createPlannerDispatch: (newPlanner) => {
    dispatch(createPlanner(newPlanner));
  },
  deletePlannerDispatch: (planner) => {
    dispatch(deletePlanner(planner));
  },
  reorderPlannerDispatch: (timetable, arrangeOrder) => {
    dispatch(reorderPlanner(timetable, arrangeOrder));
  },
});

PlannerTabs.propTypes = {
  user: userShape,
  isPortrait: PropTypes.bool.isRequired,
  tracks: PropTypes.exact({
    general: PropTypes.arrayOf(generalTrackShape),
    major: PropTypes.arrayOf(majorTrackShape),
    additional: PropTypes.arrayOf(additionalTrackShape),
  }),
  planners: PropTypes.arrayOf(plannerShape),
  selectedPlanner: plannerShape,

  setPlannersDispatch: PropTypes.func.isRequired,
  clearPlannersDispatch: PropTypes.func.isRequired,
  setSelectedPlannerDispatch: PropTypes.func.isRequired,
  createPlannerDispatch: PropTypes.func.isRequired,
  deletePlannerDispatch: PropTypes.func.isRequired,
  reorderPlannerDispatch: PropTypes.func.isRequired,
};


export default withTranslation()(
  connect(mapStateToProps, mapDispatchToProps)(
    PlannerTabs
  )
);
