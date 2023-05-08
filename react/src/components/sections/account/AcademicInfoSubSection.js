import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';

import userShape from '../../../shapes/model/session/UserShape';
import { CONTACT } from '../../../common/constants';
import Attributes from '../../Attributes';


class AcademicInfoSubSection extends Component {
  render() {
    const { t } = this.props;
    const { user } = this.props;

    if (user == null) {
      return null;
    }

    return (
      <div className={classNames('subsection', 'subsection--academic-info')}>
        <div className={classNames('title')}>
          {t('ui.title.academicInformation')}
        </div>
        <Attributes
          entries={[
            { name: t('ui.attribute.studentId'), info: user.student_id },
            { name: t('ui.attribute.major'), info: user.majors.map((d) => d[t('js.property.name')]).join(', ') },
          ]}
        />
        <div className={classNames('caption')}>
          {t('ui.message.academicInfoCaptionHead')}
          <a
            href={`mailto:${CONTACT}`}
            className={classNames('text-button')}
          >
            { CONTACT }
          </a>
          {t('ui.message.academicInfoCaptionTail')}
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.common.user.user,
});

const mapDispatchToProps = (dispatch) => ({
});

AcademicInfoSubSection.propTypes = {
  user: userShape,
};


export default withTranslation()(
  connect(mapStateToProps, mapDispatchToProps)(
    AcademicInfoSubSection
  )
);
