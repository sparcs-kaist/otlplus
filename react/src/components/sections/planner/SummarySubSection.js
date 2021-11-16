import React, { Component } from 'react';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';

class SummarySubSection extends Component {

    render() {
        return(
            <>
                <div className={classNames('subsection', 'subsection--planner-summary')}>
                    SummarySubSection
                </div>
            </>
        )
    }
}

export default (
    SummarySubSection
  );