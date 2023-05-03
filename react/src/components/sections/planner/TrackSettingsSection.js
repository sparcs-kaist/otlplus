import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import axios from 'axios';
import PropTypes from 'prop-types';
import { range, sum } from 'lodash';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';

import Scroller from '../../Scroller';
import CloseButton from '../../CloseButton';
import SearchFilter from '../../SearchFilter';

import { setIsTrackSettingsSectionOpen, updatePlanner } from '../../../actions/planner/planner';

import { getAdditionalTrackName, getGeneralTrackName, getMajorTrackName } from '../../../utils/trackUtils';

import plannerShape from '../../../shapes/model/planner/PlannerShape';
import userShape from '../../../shapes/model/session/UserShape';
import generalTrackShape from '../../../shapes/model/graduation/GeneralTrackShape';
import majorTrackShape from '../../../shapes/model/graduation/MajorTrackShape';
import additionalTrackShape from '../../../shapes/model/graduation/AdditionalTrackShape';


class TrackSettingsSection extends Component {
  constructor(props) {
    super(props);

    const { selectedPlanner } = props;

    const selectedPlannerDuration = selectedPlanner.end_year - selectedPlanner.start_year + 1;

    this.state = {
      selectedStartYears: new Set([selectedPlanner.start_year.toString()]),
      selectedDurations: new Set([(selectedPlannerDuration).toString()]),
      selectedGeneralTracks: new Set([selectedPlanner.general_track.id.toString()]),
      selectedMajorTracks: new Set([selectedPlanner.major_track.id.toString()]),
      selectedMinorTracks: new Set(
        selectedPlanner.additional_tracks
          .filter((at) => (at.type === 'MINOR'))
          .map((at) => at.id.toString())
      ),
      selectedDoubleTracks: new Set(
        selectedPlanner.additional_tracks
          .filter((at) => (at.type === 'DOUBLE'))
          .map((at) => at.id.toString())
      ),
      selectedAdvancedTracks: new Set(
        selectedPlanner.additional_tracks
          .filter((at) => (at.type === 'ADVANCED'))
          .map((at) => at.id.toString())
      ),
      selectedInterdisciplinaryTracks: new Set(
        selectedPlanner.additional_tracks
          .filter((at) => (at.type === 'INTERDISCIPLINARY'))
          .map((at) => at.id.toString())
      ),
    };
  }


  _getSelectedStartYear = () => {
    const { selectedStartYears } = this.state;

    return parseInt(Array.from(selectedStartYears)[0], 10);
  }


  _getSelectedDuration = () => {
    const { selectedDurations } = this.state;

    return parseInt(Array.from(selectedDurations)[0], 10);
  }


  _getSelectedGeneralTrack = () => {
    const { selectedGeneralTracks } = this.state;
    const { tracks } = this.props;


    const generalTrackId = parseInt(Array.from(selectedGeneralTracks)[0], 10);
    return tracks.general.find((gt) => (gt.id === generalTrackId));
  }


  _getSelectedMajorTrack = () => {
    const { selectedMajorTracks } = this.state;
    const { tracks } = this.props;


    const majorTrackId = parseInt(Array.from(selectedMajorTracks)[0], 10);
    return tracks.major.find((gt) => (gt.id === majorTrackId));
  }


  _getSelectedAdditionalTracks = () => {
    const {
      selectedMinorTracks, selectedDoubleTracks,
      selectedAdvancedTracks, selectedInterdisciplinaryTracks,
    } = this.state;
    const { tracks } = this.props;

    const additionalTrackIds = (
      [
        ...selectedMinorTracks,
        ...selectedDoubleTracks,
        ...selectedAdvancedTracks,
        ...selectedInterdisciplinaryTracks,
      ]
        .map((i) => parseInt(i, 10))
    );
    return additionalTrackIds.map((i) => tracks.additional.find((at) => (at.id === i)));
  }


  updateCheckedValues = (filterName) => (checkedValues) => {
    this.setState({
      [filterName]: checkedValues,
    });
  }


  submit = () => {
    const {
      user, selectedPlanner,
      updatePlannerDispatch,
    } = this.props;

    const startYear = this._getSelectedStartYear();
    const duration = this._getSelectedDuration();
    const endYear = startYear + duration - 1;

    const generalTrack = this._getSelectedGeneralTrack();
    const majorTrack = this._getSelectedMajorTrack();
    const additionalTracks = this._getSelectedAdditionalTracks();

    if (additionalTracks.some((at) => (
      (at.type === 'DOUBLE' || at.type === 'MINOR')
      && at.department.code === majorTrack.department.code
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
          && at2.department.code === at1.department.code
        )).length > 1
      )
    ))) {
      // eslint-disable-next-line no-alert
      alert('동일한 학과의 부전공 또는 복수전공을 여러 개 추가할 수 없습니다.');
      return;
    }
    if (additionalTracks.some((at) => (
      at.type === 'ADVANCED'
      && at.department.code !== majorTrack.department.code
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

    const removedItemCount = sum([
      selectedPlanner.taken_items
        .filter((ti) => !this._checkYearInRange(startYear, endYear, ti.lecture.year))
        .length,
      selectedPlanner.future_items
        .filter((fi) => !this._checkYearInRange(startYear, endYear, fi.year))
        .length,
      selectedPlanner.arbitrary_items
        .filter((gi) => !this._checkYearInRange(startYear, endYear, gi.year))
        .length,
    ]);
    // eslint-disable-next-line no-alert
    if (removedItemCount > 0 && !window.confirm(`플래너 기간을 ${startYear}~${endYear}년으로 변경하면 ${removedItemCount}개의 과목이 삭제됩니다. 정말 변경하시겠습니까?`)) {
      return;
    }
    const unmatchingPeriodTracksCount = (
      (this._checkYearInTrackRange(generalTrack, startYear) ? 0 : 1)
        + (this._checkYearInTrackRange(majorTrack, startYear) ? 0 : 1)
        + additionalTracks.filter((at) => !this._checkYearInTrackRange(at, startYear)).length
    );
    // eslint-disable-next-line no-alert
    if (unmatchingPeriodTracksCount > 0 && !window.confirm(`선택한 졸업요건 중 ${unmatchingPeriodTracksCount}개의 졸업요건은 입학년도가 ${startYear}년일 경우 적용이 불가능할 수 있습니다. 정말 변경하시겠습니까? 해당 요건의 적용 가능 여부는 학사요람을 참고 바랍니다.`)) {
      return;
    }

    if (!user) {
      updatePlannerDispatch({
        ...selectedPlanner,
        start_year: startYear,
        end_year: endYear,
        general_track: generalTrack,
        major_track: majorTrack,
        additional_tracks: additionalTracks,
        taken_items: selectedPlanner.taken_items.filter((ti) => (
          ti.lecture.year >= startYear && ti.lecture.year <= endYear
        )),
        future_items: selectedPlanner.future_items.filter((fi) => (
          fi.year >= startYear && fi.year <= endYear
        )),
        arbitrary_items: selectedPlanner.arbitrary_items.filter((gi) => (
          gi.year >= startYear && gi.year <= endYear
        )),
      });

      this.close();
      return;
    }

    axios.patch(
      `/api/users/${user.id}/planners/${selectedPlanner.id}`,
      {
        start_year: startYear,
        end_year: endYear,
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


  _checkYearInRange = (startYear, endYear, year) => (
    startYear <= year && year <= endYear
  );


  _checkYearInTrackRange = (track, year) => (
    this._checkYearInRange(track.start_year, track.end_year, year)
  );


  render() {
    const {
      selectedStartYears, selectedDurations,
      selectedGeneralTracks, selectedMajorTracks,
      selectedMinorTracks, selectedDoubleTracks,
      selectedAdvancedTracks, selectedInterdisciplinaryTracks,
    } = this.state;
    const { t, tracks } = this.props;

    const startYear = this._getSelectedStartYear();
    const majorTrack = this._getSelectedMajorTrack();

    return (
      <div className={classNames('section', 'section--modal', 'section--track-settings')}>
        <CloseButton onClick={this.close} />
        <div className={classNames('title')}>
          {t('ui.title.plannerSettings')}
        </div>
        <Scroller>
          <SearchFilter
            updateCheckedValues={this.updateCheckedValues('selectedStartYears')}
            inputName="startYear"
            titleName={t('ui.attribute.entranceYear')}
            options={
              range(2015, (new Date()).getFullYear() + 1).map((y) => [y.toString(), y.toString()])
            }
            checkedValues={selectedStartYears}
            isRadio={true}
          />
          <SearchFilter
            updateCheckedValues={this.updateCheckedValues('selectedDurations')}
            inputName="duration"
            titleName={t('ui.attribute.enrollmentPeriod')}
            options={
              range(4, 9).map((d) => [d.toString(), t('ui.others.yearCount', { count: d })])
            }
            checkedValues={selectedDurations}
            isRadio={true}
          />
          <SearchFilter
            updateCheckedValues={this.updateCheckedValues('selectedGeneralTracks')}
            inputName="general"
            titleName={t('ui.attribute.general')}
            options={
              // eslint-disable-next-line fp/no-mutating-methods
              tracks.general
                .filter((at) => at.end_year >= 2020)
                .sort((at1, at2) => {
                  return at1.start_year - at2.start_year;
                })
                .map((gt) => [
                  gt.id.toString(),
                  getGeneralTrackName(gt, true),
                  !this._checkYearInTrackRange(gt, startYear),
                ])
            }
            checkedValues={selectedGeneralTracks}
            isRadio={true}
          />
          <SearchFilter
            updateCheckedValues={this.updateCheckedValues('selectedMajorTracks')}
            inputName="major"
            titleName={t('ui.attribute.major')}
            options={
              // eslint-disable-next-line fp/no-mutating-methods
              tracks.major
                .filter((at) => at.end_year >= 2020)
                .sort((at1, at2) => {
                  if (at1.department[t('js.property.name')] < at2.department[t('js.property.name')]) {
                    return -1000;
                  }
                  if (at1.department[t('js.property.name')] > at2.department[t('js.property.name')]) {
                    return 1000;
                  }
                  return at1.start_year - at2.start_year;
                })
                .map((mt) => [
                  mt.id.toString(),
                  getMajorTrackName(mt, true),
                  !this._checkYearInTrackRange(mt, startYear),
                ])
            }
            checkedValues={new Set(selectedMajorTracks)}
            isRadio={true}
          />
          <SearchFilter
            updateCheckedValues={this.updateCheckedValues('selectedMinorTracks')}
            inputName="minor"
            titleName={`${t('ui.attribute.additional')} - ${t('ui.type.minor')}`}
            options={
              // eslint-disable-next-line fp/no-mutating-methods
              tracks.additional
                .filter((at) => (at.end_year >= 2020 && at.type === 'MINOR'))
                .sort((at1, at2) => {
                  if (at1.department[t('js.property.name')] < at2.department[t('js.property.name')]) {
                    return -1000;
                  }
                  if (at1.department[t('js.property.name')] > at2.department[t('js.property.name')]) {
                    return 1000;
                  }
                  return at1.start_year - at2.start_year;
                })
                .map((at) => [
                  at.id.toString(),
                  getAdditionalTrackName(at, true),
                  !this._checkYearInTrackRange(at, startYear)
                    || at.department.code === majorTrack.department.code,
                ])
            }
            checkedValues={new Set(selectedMinorTracks)}
          />
          <SearchFilter
            updateCheckedValues={this.updateCheckedValues('selectedDoubleTracks')}
            inputName="double"
            titleName={`${t('ui.attribute.additional')} - ${t('ui.type.doubleMajor')}`}
            options={
              // eslint-disable-next-line fp/no-mutating-methods
              tracks.additional
                .filter((at) => (at.end_year >= 2020 && at.type === 'DOUBLE'))
                .sort((at1, at2) => {
                  if (at1.department[t('js.property.name')] < at2.department[t('js.property.name')]) {
                    return -1000;
                  }
                  if (at1.department[t('js.property.name')] > at2.department[t('js.property.name')]) {
                    return 1000;
                  }
                  return at1.start_year - at2.start_year;
                })
                .map((at) => [
                  at.id.toString(),
                  getAdditionalTrackName(at, true),
                  !this._checkYearInTrackRange(at, startYear)
                    || at.department.code === majorTrack.department.code,
                ])
            }
            checkedValues={new Set(selectedDoubleTracks)}
          />
          <SearchFilter
            updateCheckedValues={this.updateCheckedValues('selectedAdvancedTracks')}
            inputName="advanced"
            titleName={`${t('ui.attribute.additional')} - ${t('ui.type.advancedMajor')}`}
            options={
              // eslint-disable-next-line fp/no-mutating-methods
              tracks.additional
                .filter((at) => (at.end_year >= 2020 && at.type === 'ADVANCED'))
                .sort((at1, at2) => {
                  if (at1.department[t('js.property.name')] < at2.department[t('js.property.name')]) {
                    return -1000;
                  }
                  if (at1.department[t('js.property.name')] > at2.department[t('js.property.name')]) {
                    return 1000;
                  }
                  return at1.start_year - at2.start_year;
                })
                .map((at) => [
                  at.id.toString(),
                  getAdditionalTrackName(at, true),
                  !this._checkYearInTrackRange(at, startYear)
                    || at.department.code !== majorTrack.department.code,
                ])
            }
            checkedValues={new Set(selectedAdvancedTracks)}
          />
          <SearchFilter
            updateCheckedValues={this.updateCheckedValues('selectedInterdisciplinaryTracks')}
            inputName="interdisciplinary"
            titleName={`${t('ui.attribute.additional')} - ${t('ui.type.interdisciplinaryMajor')}`}
            options={
              // eslint-disable-next-line fp/no-mutating-methods
              tracks.additional
                .filter((at) => (at.end_year >= 2020 && at.type === 'INTERDISCIPLINARY'))
                .sort((at1, at2) => {
                  return at1.start_year - at2.start_year;
                })
                .map((at) => [
                  at.id.toString(),
                  getAdditionalTrackName(at, true),
                  !this._checkYearInTrackRange(at, startYear),
                ])
            }
            checkedValues={new Set(selectedInterdisciplinaryTracks)}
          />
          <div className={classNames('caption')}>
            Beta UI:
            <br />
            본 UI는 완성되지 않은 임시 UI로, 추후 다른 UI로 대체될 예정입니다.
            <br />
            일부 요건은 함께 선택할 수 없습니다.
          </div>
        </Scroller>
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
  tracks: PropTypes.exact({
    general: PropTypes.arrayOf(generalTrackShape),
    major: PropTypes.arrayOf(majorTrackShape),
    additional: PropTypes.arrayOf(additionalTrackShape),
  }),
  selectedPlanner: plannerShape.isRequired,

  setIsTrackSettingsSectionOpenDispatch: PropTypes.func.isRequired,
  updatePlannerDispatch: PropTypes.func.isRequired,
};

export default withTranslation()(
  connect(mapStateToProps, mapDispatchToProps)(
    TrackSettingsSection
  )
);
