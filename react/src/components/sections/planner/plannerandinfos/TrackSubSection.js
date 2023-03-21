import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { appBoundClassNames as classNames } from '../../../../common/boundClassNames';
import Attributes from '../../../Attributes';

import { setIsTrackSettingsSectionOpen } from '../../../../actions/planner/planner';


class TrackSubSection extends Component {
  render() {
    const { t, setIsTrackSettingsSectionOpenDispatch } = this.props;

    // TODO: Retrieve data from planner
    const plannerStartYear = 2020;
    const majors = [];

    return (
      <>
        <div
          className={classNames('subsection', 'subsection--track')}
          onClick={() => setIsTrackSettingsSectionOpenDispatch(true)} // TODO: Implement seperate button
        >
          <Attributes
            entries={[
              { name: t('ui.attribute.general'), info: plannerStartYear },
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
  setIsTrackSettingsSectionOpenDispatch: (isTrackSettingsSectionOpen) => {
    dispatch(setIsTrackSettingsSectionOpen(isTrackSettingsSectionOpen));
  },
});

TrackSubSection.propTypes = {
  setIsTrackSettingsSectionOpenDispatch: PropTypes.func.isRequired,
};

export default withTranslation()(
  connect(mapStateToProps, mapDispatchToProps)(
    TrackSubSection
  )
);
