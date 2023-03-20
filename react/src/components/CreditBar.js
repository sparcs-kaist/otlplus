import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import { appBoundClassNames as classNames } from '../common/boundClassNames';

class CreditBar extends Component {
  render() {
    const {
      credit,
      totalCredit,
      colorIndex,
    } = this.props;

    const statusWidth = credit >= totalCredit
      ? 100
      : credit / totalCredit * 100;

    return (
      <div className={classNames('credit-bar')}>
        <div className={classNames('credit-bar__body')}>
          <div
            className={classNames('credit-bar__body__taken', `background-color--${colorIndex}`)}
            style={{ width: statusWidth }}
          />
        </div>
        <div className={classNames('credit-bar__text')}>
          {`${credit} / ${totalCredit}`}
        </div>
      </div>
    );
  }
}

CreditBar.propTypes = {
  credit: PropTypes.number.isRequired,
  totalCredit: PropTypes.number.isRequired,
  colorIndex: PropTypes.number.isRequired,
};

export default withTranslation()(
  CreditBar
);
