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

    return (
      <div className={classNames('credit-bar')}>
        <div className={classNames('credit-bar__text')}>
          {text}
        </div>
        <div className={classNames('credit-bar__body')}>
          <div
            className={classNames(
              'credit-bar__body__taken',
              `background-color--${isCategoryFocused ? 18 : colorIndex}`,
              'background-color--dark',
            )}
            style={{ width: `${getWidth(takenCredit - (focusPosition === 1 ? focusedCredit : 0))}%` }}
          />
          {
            focusPosition === 1 && (
              <div
                className={classNames(
                  'credit-bar__body__focused',
                )}
                style={{ width: `${getWidth(focusedCredit)}%` }}
              />
            )
          }
          <div
            className={classNames(
              'credit-bar__body__planned',
              `background-color--${isCategoryFocused ? 18 : colorIndex}`,
              'background-color--dark',
              'background-color--stripe',
            )}
            style={{ width: `${getWidth(plannedCredit - (focusPosition === 2 ? focusedCredit : 0))}%` }}
          />
          {
            (focusPosition === 2 || focusPosition === 3) && (
              <div
                className={classNames(
                  'credit-bar__body__focused',
                )}
                style={{ width: `${getWidth(focusedCredit)}%` }}
              />
            )
          }
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
