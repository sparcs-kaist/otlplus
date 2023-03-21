import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';
import CloseButton from '../../CloseButton';
import SearchFilter from '../../SearchFilter';

import { setIsTrackSettingsSectionOpen } from '../../../actions/planner/planner';


class TrackSettingsSection extends Component {
  close = () => {
    const { setIsTrackSettingsSectionOpenDispatch } = this.props;
    setIsTrackSettingsSectionOpenDispatch(false);
  }


  render() {
    const { t } = this.props;

    return (
      <div className={classNames('section', 'section--modal')}>
        <CloseButton onClick={this.close} />
        <div className={classNames('title')}>
          {t('ui.title.plannerSettings')}
        </div>
        <SearchFilter
          updateCheckedValues={() => null}
          inputName="general"
          titleName={t('ui.attribute.general')}
          options={[]}
          checkedValues={[]}
        />
        <SearchFilter
          updateCheckedValues={() => null}
          inputName="major"
          titleName={t('ui.attribute.major')}
          options={[]}
          checkedValues={[]}
        />
        <SearchFilter
          updateCheckedValues={() => null}
          inputName="additional"
          titleName={t('ui.attribute.additional')}
          options={[]}
          checkedValues={[]}
        />
      </div>
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

TrackSettingsSection.propTypes = {
  setIsTrackSettingsSectionOpenDispatch: PropTypes.func.isRequired,
};

export default withTranslation()(
  connect(mapStateToProps, mapDispatchToProps)(
    TrackSettingsSection
  )
);
