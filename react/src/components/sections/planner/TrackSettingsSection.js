import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import axios from 'axios';
import PropTypes from 'prop-types';
import { range } from 'lodash';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';
import CloseButton from '../../CloseButton';
import SearchFilter from '../../SearchFilter';

import { setIsTrackSettingsSectionOpen, updatePlanner } from '../../../actions/planner/planner';
import { getAdditionalTrackName, getGeneralTrackName, getMajorTrackName } from '../../../utils/trackUtils';
import plannerShape from '../../../shapes/model/PlannerShape';
import userShape from '../../../shapes/model/UserShape';


class TrackSettingsSection extends Component {
  constructor(props) {
    super(props);

    const { selectedPlanner } = props;

    this.state = {
      selectedStartYears: new Set([selectedPlanner.start_year.toString()]),
      selectedDurations: new Set([(selectedPlanner.end_year - selectedPlanner.start_year + 1).toString()]),
      selectedGeneralTracks: new Set([selectedPlanner.general_track.id.toString()]),
      selectedMajorTracks: new Set([selectedPlanner.major_track.id.toString()]),
      selectedAdditionalTracks: new Set(selectedPlanner.additional_tracks.map((at) => at.id.toString())),
    };
  }

  updateCheckedValues = (filterName) => (checkedValues) => {
    this.setState({
      [filterName]: checkedValues,
    });
  }


  submit = () => {
    const {
      selectedStartYears, selectedDurations,
      selectedGeneralTracks, selectedMajorTracks, selectedAdditionalTracks,
    } = this.state;
    const {
      user, selectedPlanner, tracks,
      updatePlannerDispatch,
    } = this.props;

    const startYear = parseInt(Array.from(selectedStartYears)[0], 10);
    const duration = parseInt(Array.from(selectedDurations)[0], 10);

    const generalTrackId = parseInt(Array.from(selectedGeneralTracks)[0], 10);
    const generalTrack = tracks.general.find((gt) => (gt.id === generalTrackId));

    const majorTrackId = parseInt(Array.from(selectedMajorTracks)[0], 10);
    const majorTrack = tracks.major.find((nt) => (nt.id === majorTrackId));

    const additionalTrackIds = Array.from(selectedAdditionalTracks).map((i) => parseInt(i, 10));
    const additionalTracks = additionalTrackIds.map((i) => tracks.additional.find((at) => (at.id === i)));
    if (additionalTracks.some((at) => (
      (at.type === 'DOUBLE' || at.type === 'MINOR')
      && at.department.id === majorTrack.department.id
    ))) {
      // eslint-disable-next-line no-alert
      alert('전공과 동일한 학과의 부전공 또는 복수전공은 추가할 수 없습니다.');
      return;
    }
    if (additionalTracks.some((at1) => (
      (at1.type === 'DOUBLE' || at1.type === 'MINOR')
      && (
        additionalTracks.filter((at2) => (
          (at2.type === 'DOUBLE' || at2.type === 'MINOR')
          && at2.department.id === at1.department.id
        )).length > 1
      )
    ))) {
      // eslint-disable-next-line no-alert
      alert('동일한 학과의 부전공 또는 복수전공을 여러 개 추가할 수 없습니다.');
      return;
    }
    if (additionalTracks.some((at) => (
      at.type === 'ADVANCED'
      && at.department.id !== majorTrack.department.id
    ))) {
      // eslint-disable-next-line no-alert
      alert('전공과 다른 학과의 심화전공은 추가할 수 없습니다.');
      return;
    }
    if (additionalTracks.filter((at) => (at.type === 'ADVANCED')).length > 1) {
      // eslint-disable-next-line no-alert
      alert('심화전공은 여러 개 추가할 수 없습니다.');
      return;
    }
    if (additionalTracks.filter((at) => (at.type === 'INTERDISCIPLINARY')).length > 1) {
      // eslint-disable-next-line no-alert
      alert('자유융합전공은 여러 개 추가할 수 없습니다.');
      return;
    }

    if (!user) {
      updatePlannerDispatch({
        ...selectedPlanner,
        start_year: startYear,
        end_year: startYear + duration - 1,
        general_track: generalTrack,
        major_track: majorTrack,
        additional_tracks: additionalTracks,
        taken_items: selectedPlanner.taken_items.filter((ti) => (
          ti.lecture.year >= startYear && ti.lecture.year < startYear + duration
        )),
        future_items: selectedPlanner.future_items.filter((fi) => (
          fi.year >= startYear && fi.year < startYear + duration
        )),
        generic_items: selectedPlanner.generic_items.filter((gi) => (
          gi.year >= startYear && gi.year < startYear + duration
        )),
      });

      this.close();
      return;
    }

    axios.patch(
      `/api/users/${user.id}/planners/${selectedPlanner.id}`,
      {
        start_year: startYear,
        end_year: startYear + duration - 1,
        general_track: generalTrack.id,
        major_track: majorTrack.id,
        additional_tracks: additionalTracks.map((at) => at.id),
        should_update_taken_semesters: true,
      },
      {
        metadata: {
          gaCategory: 'Review',
          gaVariable: 'POST / List',
        },
      },
    )
      .then((response) => {
        updatePlannerDispatch(response.data);
        this.close();
      })
      .catch((error) => {
      });
  }


  close = () => {
    const { setIsTrackSettingsSectionOpenDispatch } = this.props;
    setIsTrackSettingsSectionOpenDispatch(false);
  }


  render() {
    const {
      selectedStartYears, selectedDurations,
      selectedGeneralTracks, selectedMajorTracks, selectedAdditionalTracks,
    } = this.state;
    const { t, tracks } = this.props;

    return (
      <div className={classNames('section', 'section--modal')}>
        <CloseButton onClick={this.close} />
        <div className={classNames('title')}>
          {t('ui.title.plannerSettings')}
        </div>
        <SearchFilter
          updateCheckedValues={this.updateCheckedValues('selectedStartYears')}
          inputName="startYear"
          titleName={t('ui.attribute.startYear')}
          options={
            range(2015, (new Date()).getFullYear() + 1).map((y) => [y.toString(), y.toString()])
          }
          checkedValues={selectedStartYears}
          isRadio={true}
        />
        <SearchFilter
          updateCheckedValues={this.updateCheckedValues('selectedDurations')}
          inputName="duration"
          titleName={t('ui.attribute.duration')}
          options={
            range(4, 9).map((d) => [d.toString(), d.toString()])
          }
          checkedValues={selectedDurations}
          isRadio={true}
        />
        <SearchFilter
          updateCheckedValues={this.updateCheckedValues('selectedGeneralTracks')}
          inputName="general"
          titleName={t('ui.attribute.general')}
          options={
            tracks.general
              .map((gt) => [gt.id.toString(), getGeneralTrackName(gt)])
          }
          checkedValues={selectedGeneralTracks}
          isRadio={true}
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
          isRadio={true}
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
        <div className={classNames('caption')}>
          Beta UI:
          <br />
          본 UI는 완성되지 않은 임시 UI입니다.
          <br />
          시작년도와 기간은 하나씩만 선택해 주세요.
          <br />
          기본과 전공 요건은 하나씩만 선택해 주세요.
          <br />
          일부 요건은 함께 선택할 수 없습니다.
        </div>
        <div className={classNames('buttons')}>
          <button className={classNames('text-button')} onClick={this.submit}>
            {t('ui.button.confirm')}
          </button>
          <button className={classNames('text-button')} onClick={this.close}>
            {t('ui.button.cancel')}
          </button>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.common.user.user,
  tracks: state.common.track.tracks,
  selectedPlanner: state.planner.planner.selectedPlanner,
});

const mapDispatchToProps = (dispatch) => ({
  setIsTrackSettingsSectionOpenDispatch: (isTrackSettingsSectionOpen) => {
    dispatch(setIsTrackSettingsSectionOpen(isTrackSettingsSectionOpen));
  },
  updatePlannerDispatch: (updatedPlanner) => {
    dispatch(updatePlanner(updatedPlanner));
  },
});

TrackSettingsSection.propTypes = {
  user: userShape,
  // eslint-disable-next-line react/forbid-prop-types
  tracks: PropTypes.any,
  selectedPlanner: plannerShape.isRequired,

  setIsTrackSettingsSectionOpenDispatch: PropTypes.func.isRequired,
  updatePlannerDispatch: PropTypes.func.isRequired,
};

export default withTranslation()(
  connect(mapStateToProps, mapDispatchToProps)(
    TrackSettingsSection
  )
);
