import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';

import { appBoundClassNames as classNames } from '../common/boundClassNames';


class ErrorPage extends Component {
  _getMessageName = (matchMessage) => {
    const messageName = {
      'invalid-login': 'invalidLogin',
      'no-such-user': 'noSuchUser',
      'problem-unregister': 'problemUnregister',
    }[matchMessage];

    if (messageName === undefined) {
      return 'unknown';
    }
    return messageName;
  }

  render() {
    const { t } = this.props;
    const { match } = this.props;

    const messageName = this._getMessageName(match.params.message);

    const title = t(`ui.error.${messageName}.title`);
    const message = t(`ui.error.${messageName}.message`);

    return (
      <section className={classNames('content', 'content--no-scroll')}>
        <div className={classNames('page-grid', 'page-grid--full')}>
          <div className={classNames('section')}>
            <div className={classNames('subsection', 'subsection--error')}>
              <div>
                { title }
              </div>
              <div>
                { message }
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }
}

ErrorPage.propTypes = {
};


export default withTranslation()(
  ErrorPage
);
