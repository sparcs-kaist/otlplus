import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import { appBoundClassNames as classNames } from '../common/boundClassNames';

class CreditBar extends Component {
  render() {
    const {
      takenCredit, plannedCredit, totalCredit,
      colorIndex,
    } = this.props;

    const getWidth = (credit) => {
      if (totalCredit === 0) {
        return 100;
      }
      return credit / totalCredit * 100;
    };

    return (
      <div className={classNames('credit-bar')}>
        <div className={classNames('credit-bar__body')}>
          <div
            className={classNames(
              'credit-bar__body__taken',
              `background-color--${colorIndex}`,
              'background-color--dark',
            )}
            style={{ width: `${getWidth(takenCredit)}%` }}
          />
          <div
            className={classNames(
              'credit-bar__body__planned',
              `background-color--${colorIndex}`,
              'background-color--dark',
              'background-color--stripe',
            )}
            style={{ width: `${getWidth(plannedCredit)}%` }}
          />
        </div>
        <div className={classNames('credit-bar__text')}>
          {`${takenCredit} \u2192 ${takenCredit + plannedCredit} / ${totalCredit}`}
        </div>
      </div>
    );
  }
}

CreditBar.propTypes = {
  takenCredit: PropTypes.number.isRequired,
  plannedCredit: PropTypes.number.isRequired,
  totalCredit: PropTypes.number.isRequired,
  colorIndex: PropTypes.number.isRequired,
};

export default withTranslation()(
  CreditBar
);
