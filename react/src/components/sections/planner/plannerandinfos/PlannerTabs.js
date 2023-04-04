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
  createPlanner, deletePlanner, duplicatePlanner,
} from '../../../../actions/planner/planner';

import userShape from '../../../../shapes/model/session/UserShape';
import plannerShape from '../../../../shapes/model/planner/PlannerShape';
import generalTrackShape from '../../../../shapes/model/graduation/GeneralTrackShape';
import majorTrackShape from '../../../../shapes/model/graduation/MajorTrackShape';
import additionalTrackShape from '../../../../shapes/model/graduation/AdditionalTrackShape';


class PlannerTabs extends Component {
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
          order: ['id'],
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

    const targetTracks = tracks.general.filter((gt) => (
      startYear >= gt.start_year
        && startYear <= gt.end_year
        && !gt.is_foreign
    ));

    if (targetTracks.length > 0) {
      return targetTracks[0];
    }
    return tracks.general[0];
  }

  _getPlannerMajorTrack = (user, startYear) => {
    const { tracks } = this.props;

    const targetTracks = tracks.major.filter((mt) => (
      startYear >= mt.start_year
        && startYear <= mt.end_year
        && mt.department.id === user?.department?.id
    ));

    if (targetTracks.length > 0) {
      return targetTracks[0];
    }
    return tracks.major[0];
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
        arrange_order: planners ? planners.length : 0,
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
          taken_items: [],
          future_items: [],
          arbitrary_items: [],
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
      user,
      duplicatePlannerDispatch,
    } = this.props;

    event.stopPropagation();

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
        arrange_order: planner.arrange_order,
      };
      duplicatePlannerDispatch(newPlanner);
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
          taken_items: planner.taken_items.map((i) => i.id),
          future_items: planner.future_items.map((i) => i.id),
          arbitrary_items: planner.arbitrary_items.map((i) => i.id),
        },
        {
          metadata: {
            gaCategory: 'Planner',
            gaVariable: 'POST / List',
          },
        },
      )
        .then((response) => {
          duplicatePlannerDispatch(response.data);
        })
        .catch((error) => {
        });
    }

    ReactGA.event({
      category: 'Planner - Planner',
      action: 'Duplicated Planner',
    });
  }

  render() {
    const { t } = this.props;
    const {
      planners, selectedPlanner,
    } = this.props;

    const normalPlannerTabs = (
      (planners && planners.length)
        ? (
          planners.map((tt, i) => (
            <div
              className={classNames(
                'tabs__elem',
                (tt.id === selectedPlanner.id ? 'tabs__elem--selected' : null),
              )}
              key={tt.id}
              onClick={() => this.changeTab(tt)}
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
  duplicatePlannerDispatch: (newPlanner) => {
    dispatch(duplicatePlanner(newPlanner));
  },
});

PlannerTabs.propTypes = {
  user: userShape,
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
  duplicatePlannerDispatch: PropTypes.func.isRequired,
};


export default withTranslation()(
  connect(mapStateToProps, mapDispatchToProps)(
    PlannerTabs
  )
);
