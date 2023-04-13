import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { appBoundClassNames as classNames } from '../common/boundClassNames';

import { reset as resetCourseFocus } from '../actions/planner/itemFocus';
import { reset as resetList } from '../actions/planner/list';
import { reset as resetSearch } from '../actions/planner/search';
import { reset as resetPlanner } from '../actions/planner/planner';

import plannerShape from '../shapes/model/planner/PlannerShape';

import Divider from '../components/Divider';
import PlannerTabs from '../components/sections/planner/plannerandinfos/PlannerTabs';
import PlannerSubSection from '../components/sections/planner/plannerandinfos/PlannerSubSection';
import CourseListTabs from '../components/sections/planner/courselist/CourseListTabs';
import CourseListSection from '../components/sections/planner/courselist/CourseListSection';
import CourseManageSection from '../components/sections/planner/coursemanage/CourseManageSection';
import TrackSubSection from '../components/sections/planner/plannerandinfos/TrackSubSection';
import SummarySubSection from '../components/sections/planner/plannerandinfos/SummarySubSection';
// import ShareSubSection from '../components/sections/planner/plannerandinfos/ShareSubSection';
import TrackSettingsSection from '../components/sections/planner/TrackSettingsSection';


class PlannerPage extends Component {
  componentWillUnmount() {
    const {
      resetCourseFocusDispatch, resetListDispatch, resetSearchDispatch,
      resetPlannerDispatch,
    } = this.props;

    resetCourseFocusDispatch();
    resetListDispatch();
    resetSearchDispatch();
    resetPlannerDispatch();
  }


  render() {
    const { isTrackSettingsSectionOpen, selectedPlanner } = this.props;

    return (
      <>
        <section className={classNames('content', 'content--no-scroll')}>
          <div className={classNames('page-grid', 'page-grid--planner')}>
            <PlannerTabs />
            <CourseListTabs />
            <div className={classNames('section', 'section--planner-and-infos')}>
              <PlannerSubSection />
              <Divider
                orientation={{
                  desktop: Divider.Orientation.VERTICAL,
                  mobile: Divider.Orientation.HORIZONTAL,
                }}
                isVisible={{
                  desktop: true,
                  mobile: false,
                }}
                gridArea="divider-main"
              />
              <TrackSubSection />
              <Divider
                orientation={Divider.Orientation.HORIZONTAL}
                isVisible={{
                  desktop: true,
                  mobile: false,
                }}
                gridArea="divider-sub-1"
              />
              <SummarySubSection />
              {/* TODO: Implement ShareSubSection */}
              {/* <Divider
                orientation={Divider.Orientation.HORIZONTAL}
                isVisible={{
                  desktop: true,
                  mobile: false,
                }}
                gridArea="divider-sub-2"
              />
              <ShareSubSection /> */}
            </div>
            <CourseListSection />
            <CourseManageSection />
            { isTrackSettingsSectionOpen && selectedPlanner && <TrackSettingsSection /> }
          </div>
        </section>
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  isTrackSettingsSectionOpen: state.planner.planner.isTrackSettingsSectionOpen,
  selectedPlanner: state.planner.planner.selectedPlanner,
});

const mapDispatchToProps = (dispatch) => ({
  resetCourseFocusDispatch: () => {
    dispatch(resetCourseFocus());
  },
  resetListDispatch: () => {
    dispatch(resetList());
  },
  resetSearchDispatch: () => {
    dispatch(resetSearch());
  },
  resetPlannerDispatch: () => {
    dispatch(resetPlanner());
  },
});

PlannerPage.propTypes = {
  isTrackSettingsSectionOpen: PropTypes.bool.isRequired,
  selectedPlanner: plannerShape,

  resetCourseFocusDispatch: PropTypes.func.isRequired,
  resetListDispatch: PropTypes.func.isRequired,
  resetSearchDispatch: PropTypes.func.isRequired,
  resetPlannerDispatch: PropTypes.func.isRequired,
};


export default connect(mapStateToProps, mapDispatchToProps)(
  PlannerPage
);
