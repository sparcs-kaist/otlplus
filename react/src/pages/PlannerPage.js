import React, { Component } from 'react';

import { appBoundClassNames as classNames } from '../common/boundClassNames';
import PlannerTabs from '../components/sections/planner/PlannerTabs';
import PlannerSubSection from '../components/sections/planner/PlannerSubSection';
import CourseListTabs from '../components/sections/planner/CourseListTabs';
import CourseListSection from '../components/sections/planner/CourseListSection';
import CourseInfoSubSection from '../components/sections/planner/CourseInfoSubSection';

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
                        <CourseInfoSubSection/>
                    </div>
                </section>
            </>
        )
    }
}


export default (
    PlannerPage
  );
  