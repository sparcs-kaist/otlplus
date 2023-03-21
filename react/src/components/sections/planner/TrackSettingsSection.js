import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';
import CloseButton from '../../CloseButton';
import SearchFilter from '../../SearchFilter';

import { setIsTrackSettingsSectionOpen } from '../../../actions/planner/planner';
import { getAdditionalTrackName, getGeneralTrackName, getMajorTrackName } from '../../../utils/trackUtils';
import plannerShape from '../../../shapes/model/PlannerShape';


class TrackSettingsSection extends Component {
  constructor(props) {
    super(props);

    const { selectedPlanner } = props;

    this.state = {
      selectedGeneralTracks: new Set([selectedPlanner.general_track.id.toString()]),
      selectedMajorTracks: new Set([selectedPlanner.major_track.id.toString()]),
      selectedAdditionalTracks: new Set([]),
    };
  }

  updateCheckedValues = (filterName) => (checkedValues) => {
    this.setState({
      [filterName]: checkedValues,
    });
  }


  close = () => {
    const { setIsTrackSettingsSectionOpenDispatch } = this.props;
    setIsTrackSettingsSectionOpenDispatch(false);
  }


  render() {
    const { selectedGeneralTracks, selectedMajorTracks, selectedAdditionalTracks } = this.state;
    const { t, tracks } = this.props;

    return (
      <div className={classNames('section', 'section--modal')}>
        <CloseButton onClick={this.close} />
        <div className={classNames('title')}>
          {t('ui.title.plannerSettings')}
        </div>
        <SearchFilter
          updateCheckedValues={this.updateCheckedValues('selectedGeneralTracks')}
          inputName="general"
          titleName={t('ui.attribute.general')}
          options={
            tracks.general
              .map((gt) => [gt.id.toString(), getGeneralTrackName(gt)])
          }
          checkedValues={selectedGeneralTracks}
        />
        <SearchFilter
          updateCheckedValues={this.updateCheckedValues('selectedMajorTracks')}
          inputName="major"
          titleName={t('ui.attribute.major')}
          options={
            tracks.major
              .map((mt) => [mt.id.toString(), getMajorTrackName(mt)])
          }
          checkedValues={new Set(selectedMajorTracks)}
        />
        <SearchFilter
          updateCheckedValues={this.updateCheckedValues('selectedAdditionalTracks')}
          inputName="additional"
          titleName={t('ui.attribute.additional')}
          options={
            tracks.additional
              .map((at) => [at.id.toString(), getAdditionalTrackName(at)])
          }
          checkedValues={new Set(selectedAdditionalTracks)}
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  tracks: state.common.track.tracks,
  selectedPlanner: state.planner.planner.selectedPlanner,
});

const mapDispatchToProps = (dispatch) => ({
  setIsTrackSettingsSectionOpenDispatch: (isTrackSettingsSectionOpen) => {
    dispatch(setIsTrackSettingsSectionOpen(isTrackSettingsSectionOpen));
  },
});

TrackSettingsSection.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  tracks: PropTypes.any,
  selectedPlanner: plannerShape.isRequired,

  setIsTrackSettingsSectionOpenDispatch: PropTypes.func.isRequired,
};

export default withTranslation()(
  connect(mapStateToProps, mapDispatchToProps)(
    TrackSettingsSection
  )
);
