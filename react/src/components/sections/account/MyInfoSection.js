import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';

import userShape from '../../../shapes/UserShape';

import { getFullName } from '../../../common/guideline/components/Header';


class CourseDetailSection extends Component {
  render() {
    const { t } = this.props;
    const { user } = this.props;

    if (user == null) {
      return null;
    }

    return (
      <>
        <div className={classNames('title')}>
          {t('ui.title.myInformation')}
        </div>
        <div className={classNames('attribute')}>
          <div>{t('ui.attribute.name')}</div>
          <div>{getFullName(user)}</div>
        </div>
        <div className={classNames('attribute')}>
          <div>{t('ui.attribute.email')}</div>
          <div>{user.email}</div>
        </div>
        <div className={classNames('caption')}>
          {t('ui.message.myInfoCaptionHead')}
          <a
            href="https://sparcssso.kaist.ac.kr/"
            className={classNames('text-button')}
            target="_blank"
            rel="noopener noreferrer"
          >
            SPARCS SSO
          </a>
          {t('ui.message.myInfoCaptionTail')}
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

CourseDetailSection.propTypes = {
  user: userShape,
};


export default withTranslation()(connect(mapStateToProps, mapDispatchToProps)(CourseDetailSection));
