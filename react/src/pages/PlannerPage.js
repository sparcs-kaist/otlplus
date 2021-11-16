import React, { Component } from 'react';

import { appBoundClassNames as classNames } from '../common/boundClassNames';

import Divider from '../components/Divider';
import PlannerTabs from '../components/sections/planner/PlannerTabs';
import PlannerSubSection from '../components/sections/planner/PlannerSubSection';
import CourseListTabs from '../components/sections/planner/CourseListTabs';
import CourseListSection from '../components/sections/planner/CourseListSection';
import CourseInfoSubSection from '../components/sections/planner/CourseInfoSubSection';
import CourseDetailSubSection from '../components/sections/planner/CourseDetailSubsection';
import CourseSettingSubSection from '../components/sections/planner/CourseSettingSubSection';
import Divider from '../components/Divider';
import SettingSubSection from '../components/sections/planner/SettingSubSection';
import SummarySubSection from '../components/sections/planner/SummarySubSection';
import ShareSubSection from '../components/sections/planner/ShareSubSection';

class PlannerPage extends Component {

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
                        <div className={classNames('section', 'section--course-info')}>
                            <CourseInfoSubSection/>
                            <Divider orientation={Divider.Orientation.VERTICAL} isVisible={true} gridArea="divider-main" />
                            <CourseDetailSubSection/>
                            <Divider orientation={Divider.Orientation.HORIZONTAL} isVisible={{ desktop: true, mobile: false }} gridArea="divider-sub-1" />
                            <CourseSettingSubSection/>
                        </div>
                    </div>
                </section>
            </>
        )
    }
}


export default (
    PlannerPage
  );
  