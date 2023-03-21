import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { appBoundClassNames as classNames } from '../../../../common/boundClassNames';
import Attributes from '../../../Attributes';

import { setIsTrackSettingsSectionOpen } from '../../../../actions/planner/planner';
import plannerShape from '../../../../shapes/model/PlannerShape';
import { getAdditionalTrackName, getGeneralTrackName, getMajorTrackName } from '../../../../utils/trackUtils';


class TrackSubSection extends Component {
  render() {
    const { t, selectedPlanner, setIsTrackSettingsSectionOpenDispatch } = this.props;

    if (!selectedPlanner) {
      // TODO: Implement placeholder before planners loaded
      return null;
    }

    return (
      <>
        <div className={classNames('subsection', 'subsection--track')}>
          <Attributes
            entries={[
              {
                name: t('ui.attribute.general'),
                info: getGeneralTrackName(selectedPlanner.general_track, 'GENERAL'),
              },
              {
                name: t('ui.attribute.major'),
                info: getMajorTrackName(selectedPlanner.major_track, 'MAJOR'),
              },
              {
                name: t('ui.attribute.additional'),
                info: selectedPlanner.additional_tracks.map((at) => (
                  getAdditionalTrackName(at, 'ADDITIONAL')
                )).join(', '),
              },
            ]}
            longInfo
          />
          <div className={classNames('buttons')}>
            <button
              className={classNames('text-button')}
              onClick={() => setIsTrackSettingsSectionOpenDispatch(true)}
            >
              {t('ui.button.change')}
            </button>
          </div>
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