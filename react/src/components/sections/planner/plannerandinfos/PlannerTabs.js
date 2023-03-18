import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import axios from 'axios';
import ReactGA from 'react-ga';

import { appBoundClassNames as classNames } from '../../../../common/boundClassNames';

import {
  setPlanners, clearPlanners,
  setSelectedPlanner,
  createPlanner, deletePlanner, duplicatePlanner,
} from '../../../../actions/planner/planner';

import userShape from '../../../../shapes/model/UserShape';
import plannerShape from '../../../../shapes/model/PlannerShape';


class PlannerTabs extends Component {
  componentDidMount() {
    this._fetchPlanners();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const {
      user,
      clearPlannersDispatch,
    } = this.props;

    if (!prevProps.user && user) {
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
    if (!user.student_id.length !== 8) {
      return currentYear;
    }
    const userEntranceYear = parseInt(user.student_id.substring(0, 4), 10);
    if (userEntranceYear < 2000 && userEntranceYear > currentYear) {
      return currentYear;
    }
    return userEntranceYear;
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
    } = this.props;

    const startYear = this._getPlannerStartYear(user);
    const endYear = startYear + 3;

    console.log(startYear, endYear);

    if (!user) {
      createPlannerDispatch(this._createRandomPlannerId(), startYear, endYear);
    }
    else {
      axios.post(
        `/api/users/${user.id}/planners`,
        {
          start_year: startYear,
          end_year: endYear,
          // lectures: [],
        },
        {
          metadata: {
            gaCategory: 'Planner',
            gaVariable: 'POST / List',
          },
        },
      )
        .then((response) => {
          createPlannerDispatch(response.data.id, startYear, endYear);
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
      duplicatePlannerDispatch(this._createRandomPlannerId(), planner);
    }
    else {
      axios.post(
        `/api/users/${user.id}/planners`,
        {
          // lectures: planner.lectures.map((l) => l.id),
        },
        {
          metadata: {
            gaCategory: 'Planner',
            gaVariable: 'POST / List',
          },
        },
      )
        .then((response) => {
          duplicatePlannerDispatch(response.data.id, planner);
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
  createPlannerDispatch: (id, startYear, endYear) => {
    dispatch(createPlanner(id, startYear, endYear));
  },
  deletePlannerDispatch: (planner) => {
    dispatch(deletePlanner(planner));
  },
  duplicatePlannerDispatch: (id, planner) => {
    dispatch(duplicatePlanner(id, planner));
  },
});

PlannerTabs.propTypes = {
  user: userShape,
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
