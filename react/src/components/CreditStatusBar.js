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
      focused,
      statusColor
    } = this.props;

    let statusWidth = 0;

    {credit>=totalCredit ?
      statusWidth = 100 :
      statusWidth = credit/totalCredit*100}

    console.log("hi", focused, focused<=0);

    return(
      <div className={classNames('credit-status--container')}>
        {statusWidth==100?<></>:<div className={classNames('credit-status--back')}/>}
        {focused <= 0 ? null
          :
          <div className={classNames('credit-status--highlight')}
					style={{
            width: (credit+focused)/totalCredit*100,
          }}
				  />
        }
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
              { focused > 0 ?
                <div className={classNames('credit-status--text')}>({focused})</div>
                : null
              }
              <div className={classNames('credit-status--text')}>/&nbsp;{totalCredit}</div>
              {/* <div className={classNames('credit-status--text')}>{credit}&nbsp; ({totalCredit-credit}) / {totalCredit}</div> */}
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