import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';

import userShape from '../../../shapes/model/session/UserShape';

import { getFullName } from '../../../common/guideline/components/Header';
import Attributes from '../../Attributes';


class MyInfoSubSection extends Component {
  render() {
    const { t } = this.props;
    const { user } = this.props;

    if (user == null) {
      return null;
    }

    return (
      <div className={classNames('subsection', 'subsection--my-info')}>
        <div className={classNames('title')}>
          {t('ui.title.myInformation')}
        </div>
        <Attributes
          entries={[
            { name: t('ui.attribute.name'), info: getFullName(user) },
            { name: t('ui.attribute.email'), info: user.email },
          ]}
        />
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
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.common.user.user,
});

const mapDispatchToProps = (dispatch) => ({
});

MyInfoSubSection.propTypes = {
  user: userShape,
};


export default withTranslation()(
  connect(mapStateToProps, mapDispatchToProps)(
    MyInfoSubSection
  )
);
