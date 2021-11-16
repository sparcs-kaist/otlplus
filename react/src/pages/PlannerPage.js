import React, { Component } from 'react';

import { appBoundClassNames as classNames } from '../common/boundClassNames';
import PlannerTabs from '../components/sections/planner/PlannerTabs';
import PlannerSubSection from '../components/sections/planner/PlannerSubSection';
import CourseListTabs from '../components/sections/planner/CourseListTabs';
import CourseListSection from '../components/sections/planner/CourseListSection';
import CourseInfoSubSection from '../components/sections/planner/CourseInfoSubSection';
import CourseDetailSubSection from '../components/sections/planner/CourseDetailSubsection';
import CourseSettingSubSection from '../components/sections/planner/CourseSettingSubSection';
import Divider from '../components/Divider';

class PlannerPage extends Component {

    render() {
        return(
            <>
                <section className={classNames('content', 'content--no-scroll')}>
                    <div className={classNames('page-grid', 'page-grid--planner')}>
                        <PlannerTabs/>
                        <CourseListTabs/>
                        <PlannerSubSection/>
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
  