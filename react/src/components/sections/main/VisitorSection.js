import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';


class VisitorSection extends Component {
  render() {
    const { t } = this.props;

    return (
      <div className={classNames('section-content', 'section-content--visitor')}>
        <div className={classNames('visitor')}>
          <div>{t('ui.placeholder.loginRequired')}</div>
          <div>{t('ui.message.signInForMore')}</div>
        </div>
        <div className={classNames('buttons')}>
          <a href={`/session/login/?next=${window.location.href}`} className={classNames('text-button')}>
            {t('ui.button.signInWithSso')}
          </a>
        </div>
      </div>
    );
  }
}

VisitorSection.propTypes = {
};


export default withTranslation()(VisitorSection);
