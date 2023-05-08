import React, { Component } from 'react';

import { appBoundClassNames as classNames } from '../../../../common/boundClassNames';

class ShareSubSection extends Component {
  render() {
    return (
      <>
        <div className={classNames('subsection', 'subsection--planner-share', 'mobile-hidden')}>
          ShareSubSection
        </div>
      </>
    );
  }
}

export default (
  ShareSubSection
);
