import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { appBoundClassNames as classNames } from '../common/boundClassNames';


class Setting extends Component {
  render() {
    const {
      t,
      entries,
    } = this.props;

    return (
      <div>
        {
          entries.map((e) => (
            <div
              className={classNames(
                'setting',
              )}
              key={e.name}
            >
              <div className={classNames('setting--name')}>
                { e.name }
              </div>
              <div>
              {
                  e.info.map((k) => (
                    <div className={classNames('setting--info')}>
                        <div className={classNames('setting--info--name')}>{k.name}</div>
                        <div/>
                        {k.controller}
                    </div>
                  ))
              }
              </div>
            </div>
          ))
        }
      </div>
    );
  }
}

Setting.propTypes = {
  entries: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      info: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
    })
  ).isRequired,
};

export default withTranslation()(
  Setting
);
