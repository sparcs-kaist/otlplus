import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { appBoundClassNames as classNames } from '../common/boundClassNames';

import { reset as resetLectureFocus } from '../actions/timetable/lectureFocus';
import { reset as resetList } from '../actions/timetable/list';
import { reset as resetSearch } from '../actions/timetable/search';
import { reset as resetSemester } from '../actions/timetable/semester';
import {
  reset as resetTimetable,
  setSelectedTimetable, setMobileIsTimetableTabsOpen,
} from '../actions/timetable/timetable';

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
    componentDidMount() {
        const { startInMyTable } = this.props.location.state || {};
        const { user, myTimetable, setSelectedTimetableDispatch } = this.props;
    
        if (startInMyTable && user) {
          setSelectedTimetableDispatch(myTimetable);
        }
    }

    componentWillUnmount() {
      const {
        resetLectureFocusDispatch, resetListDispatch, resetSearchDispatch,
        resetSemesterDispatch, resetTimetableDispatch,
      } = this.props;

      resetLectureFocusDispatch();
      resetListDispatch();
      resetSearchDispatch();
      resetSemesterDispatch();
      resetTimetableDispatch();
    }


    render() {
        return(
            <>
                <section className={classNames('content', 'content--no-scroll')}>
                    <div className={classNames('page-grid', 'page-grid--planner')}>
                        <PlannerTabs/>
                        <CourseListTabs/>
                        <div className={classNames('section', 'section--planner-detial')}>
                            <PlannerSubSection/>
                            <Divider orientation={{ desktop: Divider.Orientation.VERTICAL, mobile: Divider.Orientation.HORIZONTAL }} isVisible={true} gridArea="divider-main" />
                            <SettingSubSection/>
                            <Divider orientation={Divider.Orientation.HORIZONTAL} isVisible={{ desktop: true, mobile: false }} gridArea="divider-sub-1" />
                            <SummarySubSection/>
                            <Divider orientation={Divider.Orientation.HORIZONTAL} isVisible={{ desktop: true, mobile: false }} gridArea="divider-sub-2" />
                            <ShareSubSection/>
                        </div>
                        <CourseListSection/>
                        {/* <div className={classNames('section', 'section--course-info')}>
                            <CourseInfoSubSection/>
                            <Divider orientation={Divider.Orientation.VERTICAL} isVisible={true} gridArea="divider-main" />
                            <CourseDetailSubSection/>
                            <Divider orientation={Divider.Orientation.HORIZONTAL} isVisible={{ desktop: true, mobile: false }} gridArea="divider-sub-1" />
                            <CourseSettingSubSection/>
                        </div> */}
                        <CourseDetailSection/>
                    </div>
                </section>
            </>
        )
    }
}

const mapStateToProps = (state) => ({
    user: state.common.user.user,
    myTimetable: state.timetable.timetable.myTimetable,
    mobileIsTimetableTabsOpen: state.timetable.timetable.mobileIsTimetableTabsOpen,
    mobileIsLectureListOpen: state.timetable.list.mobileIsLectureListOpen,
  });
  
  const mapDispatchToProps = (dispatch) => ({
    setSelectedTimetableDispatch: (timetable) => {
      dispatch(setSelectedTimetable(timetable));
    },
    resetLectureFocusDispatch: () => {
      dispatch(resetLectureFocus());
    },
    resetListDispatch: () => {
      dispatch(resetList());
    },
    resetSearchDispatch: () => {
      dispatch(resetSearch());
    },
    resetSemesterDispatch: () => {
      dispatch(resetSemester());
    },
    resetTimetableDispatch: () => {
      dispatch(resetTimetable());
    },
    setMobileIsTimetableTabsOpenDispatch: (mobileIsTimetableTabsOpen) => {
      dispatch(setMobileIsTimetableTabsOpen(mobileIsTimetableTabsOpen));
    },
  });

  // PlannerPage.PropTypes = {

  // }


export default connect(mapStateToProps, mapDispatchToProps)(
    PlannerPage
  );
  