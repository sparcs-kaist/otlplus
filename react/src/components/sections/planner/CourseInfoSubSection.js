import React, { Component } from 'react';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';

class CourseInfoSubSection extends Component {

    render() {
        return(
            <>
                <div className={classNames('section', 'section--course-info')}>
                    CourseInfoSection
                </div>
            </>
        )
    }
}

export default (
    CourseInfoSubSection
  );