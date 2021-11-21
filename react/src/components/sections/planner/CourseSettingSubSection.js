import React, { Component } from 'react';
import { appBoundClassNames as classNames } from '../../../common/boundClassNames';

class CourseSettingSubSection extends Component {
    render() {
        return(
            <div className={classNames('subsection', 'subsection--course-info-setting')}>
                CSSubSection1
            </div>
        );
    }
}

export default (
    CourseSettingSubSection
);