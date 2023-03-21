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

    const getYearName = (year) => {
      if (year <= 2000 || year >= 2100) {
        return '';
      }
      return year.toString();
    };

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
                info: `일반 (${getYearName(selectedPlanner.general_track.start_year)}~${getYearName(selectedPlanner.general_track.end_year)})`,
              },
              {
                name: t('ui.attribute.major'),
                info: `전공-${getYearName(selectedPlanner.major_track.department.name)} (${getYearName(selectedPlanner.major_track.start_year)}~${selectedPlanner.major_track.end_year})`,
              },
              {
                name: t('ui.attribute.additional'),
                info: selectedPlanner.additional_tracks.map((at) => (
                  `복수전공-${at.department.name} (${getYearName(at.start_year)}-${getYearName(at.end_year)})`
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
