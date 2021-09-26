import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';

import userShape from '../../../shapes/UserShape';


class AcademicInfoSection extends Component {
  render() {
    const { t } = this.props;
    const { user } = this.props;

    if (user == null) {
      return null;
    }

    return (
      <>
        <div className={classNames('title')}>
          {t('ui.title.academicInformation')}
        </div>
        <div className={classNames('attribute')}>
          <div>{t('ui.attribute.studentId')}</div>
          <div>{user.student_id}</div>
        </div>
        <div className={classNames('attribute')}>
          <div>{t('ui.attribute.major')}</div>
          <div>{user.majors.map((d) => d[t('js.property.name')]).join(', ')}</div>
        </div>
        <div className={classNames('caption')}>
          {t('ui.message.academicInfoCaptionHead')}
          <a
            href="mailto:otlplus@sparcs.org"
            className={classNames('text-button')}
          >
            otlplus@sparcs.org
          </a>
          {t('ui.message.academicInfoCaptionTail')}
        </div>
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.common.user.user,
});

const mapDispatchToProps = (dispatch) => ({
});

AcademicInfoSection.propTypes = {
  user: userShape,
};


export default withTranslation()(
  connect(mapStateToProps, mapDispatchToProps)(
    AcademicInfoSection
  )
);
