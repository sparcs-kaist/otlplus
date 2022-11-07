import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { appBoundClassNames as classNames } from '../common/boundClassNames';

import { reset as resetCourseFocus } from '../actions/planner/courseFocus';
import { reset as resetList } from '../actions/planner/list';
import { reset as resetSearch } from '../actions/planner/search';
import { reset as resetPlanner } from '../actions/planner/planner';

import Divider from '../components/Divider';
import PlannerTabs from '../components/sections/planner/PlannerTabs';
import PlannerSubSection from '../components/sections/planner/PlannerSubSection';
import CourseListTabs from '../components/sections/planner/CourseListTabs';
import CourseListSection from '../components/sections/planner/CourseListSection';
import CourseDetailSection from '../components/sections/planner/CourseDetailSection';
import SettingSubSection from '../components/sections/planner/SettingSubSection';
import SummarySubSection from '../components/sections/planner/SummarySubSection';
import ShareSubSection from '../components/sections/planner/ShareSubSection';


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
    return (
      <>
        <section className={classNames('content', 'content--no-scroll')}>
          <div className={classNames('page-grid', 'page-grid--planner')}>
            <PlannerTabs />
            <CourseListTabs />
            <div className={classNames('section', 'section--planner-detial')}>
              <PlannerSubSection />
              <Divider orientation={{ desktop: Divider.Orientation.VERTICAL, mobile: Divider.Orientation.HORIZONTAL }} isVisible={true} gridArea="divider-main" />
              <SettingSubSection />
              <Divider orientation={Divider.Orientation.HORIZONTAL} isVisible={{ desktop: true, mobile: false }} gridArea="divider-sub-1" />
              <SummarySubSection />
              <Divider orientation={Divider.Orientation.HORIZONTAL} isVisible={{ desktop: true, mobile: false }} gridArea="divider-sub-2" />
              <ShareSubSection />
            </div>
            <CourseListSection />
            {/* <div className={classNames('section', 'section--course-info')}>
                <CourseInfoSubSection/>
                <Divider orientation={Divider.Orientation.VERTICAL} isVisible={true} gridArea="divider-main" />
                <CourseDetailSubSection/>
                <Divider orientation={Divider.Orientation.HORIZONTAL} isVisible={{ desktop: true, mobile: false }} gridArea="divider-sub-1" />
                <CourseSettingSubSection/>
            </div> */}
            <CourseDetailSection />
          </div>
        </section>
      </>
    );
  }
}

const mapStateToProps = (state) => ({
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
  resetCourseFocusDispatch: PropTypes.func.isRequired,
  resetListDispatch: PropTypes.func.isRequired,
  resetSearchDispatch: PropTypes.func.isRequired,
  resetPlannerDispatch: PropTypes.func.isRequired,
};


export default connect(mapStateToProps, mapDispatchToProps)(
  PlannerPage
);
