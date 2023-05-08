import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import { appBoundClassNames as classNames } from '../common/boundClassNames';
import { ItemFocusFrom } from '../reducers/planner/itemFocus';

class CreditBar extends Component {
  render() {
    const {
      takenCredit, plannedCredit, totalCredit, focusedCredit,
      colorIndex,
      isCategoryFocused,
      focusFrom,
    } = this.props;

    const getWidth = (credit) => {
      if (totalCredit === 0) {
        return 100;
      }
      return credit / totalCredit * 100;
    };

    const focusPosition = (
      focusedCredit === 0
        ? 0
        : focusFrom === ItemFocusFrom.LIST
          ? 3
          : focusFrom === ItemFocusFrom.TABLE_TAKEN
            ? 1
            : 2
    );

    const text = (
      <>
        {takenCredit}
        {
          focusPosition === 1 && (
            <span>
              {`(${focusedCredit})`}
            </span>
          )
        }
        {' \u2192 '}
        {takenCredit + plannedCredit}
        {
          focusPosition === 2 && (
            <span>
              {`(${focusedCredit})`}
            </span>
          )
        }
        {
          focusPosition === 3 && (
            <span>
              {`+${focusedCredit}`}
            </span>
          )
        }
        {' / '}
        {totalCredit}
      </>
    );

    const widths = [
      getWidth(takenCredit - ((focusPosition === 1) ? focusedCredit : 0)),
      getWidth((focusPosition === 1) ? focusedCredit : 0),
      getWidth(plannedCredit - ((focusPosition === 2) ? focusedCredit : 0)),
      getWidth((focusPosition === 2 || focusPosition === 3) ? focusedCredit : 0),
    ];

    return (
      <div className={classNames('credit-bar')}>
        <div className={classNames('credit-bar__text')}>
          {text}
        </div>
        <div className={classNames('credit-bar__body')}>
          <div
            className={classNames(
              'credit-bar__body__bar',
              'credit-bar__body__bar--taken',
              `background-color--${isCategoryFocused ? 19 : colorIndex}`,
              'background-color--dark',
            )}
            style={{ width: `${widths[0]}%` }}
          />
          <div
            className={classNames(
              'credit-bar__body__bar',
              'credit-bar__body__bar--focused',
              'background-color--19',
              'background-color--dark',
            )}
            style={{ width: `${widths[1]}%` }}
          />
          <div
            className={classNames(
              'credit-bar__body__bar',
              'credit-bar__body__bar--planned',
              `background-color--${isCategoryFocused ? 19 : colorIndex}`,
              'background-color--dark',
              'background-color--stripe',
            )}
            style={{ width: `${widths[2]}%` }}
          />
          <div
            className={classNames(
              'credit-bar__body__bar',
              'credit-bar__body__bar--focused',
              'background-color--19',
              'background-color--dark',
              'background-color--stripe',
            )}
            style={{ width: `${widths[3]}%` }}
          />
        </div>
      </div>
    );
  }
}

CreditBar.propTypes = {
  takenCredit: PropTypes.number.isRequired,
  plannedCredit: PropTypes.number.isRequired,
  totalCredit: PropTypes.number.isRequired,
  focusedCredit: PropTypes.number.isRequired,
  colorIndex: PropTypes.number.isRequired,
  isCategoryFocused: PropTypes.bool.isRequired,
  focusFrom: PropTypes.oneOf(Object.values(ItemFocusFrom)).isRequired,
};

export default withTranslation()(
  CreditBar
);
