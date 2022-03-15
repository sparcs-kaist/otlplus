import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';

import { appBoundClassNames as classNames } from '../common/boundClassNames';

class CreditStatusBar extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      credit,
      totalCredit,
      statusColor
    } = this.props;

    let statusWidth = 0;

    {credit>=totalCredit ?
      statusWidth = 100 :
      statusWidth = credit/totalCredit*100}

    return(
      <div className={classNames('credit-status--container')}>
        {statusWidth==100?<></>:<div className={classNames('credit-status--back')}/>}
				<div className={statusWidth==100?classNames('credit-status--front-full'):classNames('credit-status--front')}
					style={{
            width: statusWidth,
            backgroundColor: statusColor
          }}
				/>
        <div className={classNames('credit-status--textbox')}>
          { credit>=totalCredit ? 
            <div className={classNames('credit-status--text')}>{credit} / {totalCredit}</div> :
            <>
              <div className={classNames('credit-status--text')}>{credit}&nbsp;</div>
              <div className={classNames('credit-status--text')}>({totalCredit-credit}) / </div>
              <div className={classNames('credit-status--text')}>{totalCredit}</div>
            </>
          }
        </div>
			</div>
    )
  }
}

export default withTranslation()(
  CreditStatusBar
);