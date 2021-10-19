import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { appBoundClassNames as classNames } from '../common/boundClassNames';


class Attributes extends Component {
  render() {
    const {
      t,
      rows,
      fixedWidthName, longName, longInfo,
    } = this.props;

    return (
      <div>
        {
          rows.map((r) => (
            <div
              className={classNames(
                'attribute',
                (longName ? 'attribute--long-name' : null),
                (longInfo ? 'attribute--long-info' : null),
              )}
              onMouseOver={r.onMouseOver}
              onMouseOut={r.onMouseOut}
              key={r.name}
            >
              <div
                className={classNames(
                  (fixedWidthName ? t('jsx.className.fixedByLang') : null)
                )}
              >
                { r.name }
              </div>
              <div>
                { r.info }
              </div>
            </div>
          ))
        }
      </div>
    );
  }
}

Attributes.propTypes = {
  rows: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      info: PropTypes.oneOf(PropTypes.string, PropTypes.node).isRequired,
      onMouseOver: PropTypes.func,
      onMouseOut: PropTypes.func,
    })
  ).isRequired,
  fixedWidthName: PropTypes.bool,
  longName: PropTypes.bool,
  longInfo: PropTypes.bool,
};

export default withTranslation()(
  Attributes
);
