import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';

import { appBoundClassNames as classNames } from '../../../../common/boundClassNames';
import Attributes from '../../../Attributes';

class SettingsSubSection extends Component {
  render() {
    const { t } = this.props;

    // TODO: Retrieve data from planner
    const plannerStartYear = 2020;
    const majors = [];

    return (
      <>
        <div className={classNames('subsection', 'subsection--planner-setting')}>
          <Attributes
            entries={[
              { name: t('ui.attribute.default'), info: plannerStartYear },
              { name: t('ui.attribute.major'), info: majors.map((d) => d[t('js.property.name')]).join(', ') },
              { name: t('ui.attribute.additional'), info: '복수 - 전산학부' },
            ]}
            longInfo
          />
        </div>
      </>
    );
  }
}

const mapStateToProps = (state) => ({
});

const mapDispatchToProps = (dispatch) => ({
});

SettingsSubSection.propTypes = {
};

export default withTranslation()(
  connect(mapStateToProps, mapDispatchToProps)(
    SettingsSubSection
  )
);
