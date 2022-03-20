import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { appBoundClassNames as classNames } from '../common/boundClassNames';

class Attributes extends Component {
  render() {
    const { t, entries, fixedWidthName, longName, longInfo } = this.props;

    return (
      <div>
        {entries.map((e) => (
          <div
            className={classNames(
              'attribute',
              longName ? 'attribute--long-name' : null,
              longInfo ? 'attribute--long-info' : null,
            )}
            onMouseOver={e.onMouseOver}
            onMouseOut={e.onMouseOut}
            key={e.name}
          >
            <div className={classNames(fixedWidthName ? t('jsx.className.fixedByLang') : null)}>
              {e.name}
            </div>
            <div>{e.info}</div>
          </div>
        ))}
      </div>
    );
  }
}

Attributes.propTypes = {
  entries: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      info: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
      onMouseOver: PropTypes.func,
      onMouseOut: PropTypes.func,
    }),
  ).isRequired,
  fixedWidthName: PropTypes.bool,
  longName: PropTypes.bool,
  longInfo: PropTypes.bool,
};

export default withTranslation()(Attributes);
