import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import { appBoundClassNames as classNames } from '../common/boundClassNames';

class CreditStatusBar extends Component {
  render() {
    const {
      credit,
      totalCredit,
      focusedCredit,
      statusColor,
    } = this.props;

    const statusWidth = credit >= totalCredit
      ? 100
      : credit / totalCredit * 100;

    return (
      <div className={classNames('credit-status--container')}>
        {statusWidth === 100 ? <></> : <div className={classNames('credit-status--back')} />}
        {focusedCredit <= 0 ? null
          : (
            <div
              className={classNames('credit-status--highlight')}
              style={{
                width: (credit + focusedCredit) > totalCredit ? 100 : (credit + focusedCredit) / totalCredit * 100,
              }}
            />
          )
        }
        <div
          className={statusWidth === 100 ? classNames('credit-status--front-full') : classNames('credit-status--front')}
          style={{
            width: statusWidth,
            backgroundColor: statusColor,
          }}
        />
        <div className={classNames('credit-status--textbox')}>
          {credit >= totalCredit
            ? (
              <div className={classNames('credit-status--text')}>
                {credit}
                {' '}
                /
                {' '}
                {totalCredit}
              </div>
            )
            : (
              <>
                <div className={classNames('credit-status--text')}>
                  {credit}
                  &nbsp;
                </div>
                {focusedCredit > 0
                  ? (
                    <div className={classNames('credit-status--text-focused')}>
                      (
                      {focusedCredit}
                      )
                    </div>
                  )
                  : null
                }
                <div className={classNames('credit-status--text')}>
                  &nbsp;/&nbsp;
                  {totalCredit}
                </div>
                {/* <div className={classNames('credit-status--text')}>{credit}&nbsp; ({totalCredit-credit}) / {totalCredit}</div> */}
              </>
            )
          }
        </div>
      </div>
    );
  }
}

CreditStatusBar.propTypes = {
  credit: PropTypes.number.isRequired,
  totalCredit: PropTypes.number.isRequired,
  focusedCredit: PropTypes.number.isRequired,
  statusColor: PropTypes.string.isRequired,
};

export default withTranslation()(
  CreditStatusBar
);
