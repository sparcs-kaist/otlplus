import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { appBoundClassNames as classNames } from '../../../../common/boundClassNames';
import Attributes from '../../../Attributes';

import { setIsTrackSettingsSectionOpen } from '../../../../actions/planner/planner';
import plannerShape from '../../../../shapes/model/PlannerShape';


class TrackSubSection extends Component {
  render() {
    const { t, selectedPlanner, setIsTrackSettingsSectionOpenDispatch } = this.props;

    if (!selectedPlanner?.general_track) {
      // TODO: Implement placeholder before planners loaded
      // TODO: support unsigned user
      return null;
    }

    return (
      <>
        <div
          className={classNames('subsection', 'subsection--track')}
          onClick={() => setIsTrackSettingsSectionOpenDispatch(true)} // TODO: Implement seperate button
        >
          <Attributes
            entries={[
              {
                name: t('ui.attribute.general'),
                info: `일반 (${selectedPlanner.general_track.start_year}~${selectedPlanner.general_track.end_year})`,
              },
              {
                name: t('ui.attribute.major'),
                info: `전공-${selectedPlanner.major_track.department.name} (${selectedPlanner.major_track.start_year}~${selectedPlanner.major_track.end_year})`,
              },
              {
                name: t('ui.attribute.additional'),
                info: selectedPlanner.additional_tracks.map((at) => (
                  `복수전공-${at.department.name} (${at.start_year}-${at.end_year})`
                )),
              },
            ]}
            longInfo
          />
        </div>
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  selectedPlanner: state.planner.planner.selectedPlanner,
});

const mapDispatchToProps = (dispatch) => ({
  setIsTrackSettingsSectionOpenDispatch: (isTrackSettingsSectionOpen) => {
    dispatch(setIsTrackSettingsSectionOpen(isTrackSettingsSectionOpen));
  },
});

TrackSubSection.propTypes = {
  selectedPlanner: plannerShape,

  setIsTrackSettingsSectionOpenDispatch: PropTypes.func.isRequired,
};

export default withTranslation()(
  connect(mapStateToProps, mapDispatchToProps)(
    TrackSubSection
  )
);
