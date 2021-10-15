import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { withTranslation } from 'react-i18next';

import { appBoundClassNames as classNames } from '../common/boundClassNames';


class OtlplusPlaceholder extends Component {
  render() {
    const { t } = this.props;

    return (
      <div className={classNames('otlplus-placeholder')}>
        <div>
          OTL PLUS
        </div>
        <div>
          <Link to="/credits/">{t('ui.menu.credit')}</Link>
          &nbsp;|&nbsp;
          <Link to="/licenses/">{t('ui.menu.licences')}</Link>
        </div>
        <div>
          <a href="mailto:otlplus@sparcs.org">otlplus@sparcs.org</a>
        </div>
        <div>
          © 2016,&nbsp;
          <a href="http://sparcs.org">SPARCS</a>
          &nbsp;OTL Team
        </div>
      </div>
    );
  }
}

OtlplusPlaceholder.propTypes = {
};

export default withTranslation()(
  OtlplusPlaceholder
);
