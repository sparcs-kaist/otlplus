import React, { Component } from 'react';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';
import CreditStatusBar from '../../CreditStatusBar';
import Setting from '../../Setting';
import Scroller from '../../Scroller';

class SummarySubSection extends Component {
	setCreditStatus = (credit, totalCredit) => {
		const status = document.getElementsByClassName(classNames('credit-status--front'))[0]

		status.style.width=(credit/totalCredit)*100
	}

	render() {
		return(
			<>
				<div className={classNames('subsection', 'subsection--planner-summary')}>
					<Scroller>
						<Setting 
							entries={[
								{name: '전체', info: [
									{name: '총학점', controller: <CreditStatusBar credit={147} totalCredit={130} statusColor={'#d6d6d6'}/>}]},
								{name: '기초', info: [
									{name: '기초필수', controller: <CreditStatusBar credit={23} totalCredit={23} statusColor={'#f3b6b5'}/>},
									{name: '기초선택', controller: <CreditStatusBar credit={6} totalCredit={6} statusColor={'#f3c8ae'}/>}]},
								{name: '전공', info: [
									{name: '전공필수', controller: <CreditStatusBar credit={15} totalCredit={15} statusColor={'#eee9a0'}/>},
									{name: '전공선택', controller: <CreditStatusBar credit={28} totalCredit={30} statusColor={'#e5f2a0'}/>}]},
								{name: '복수전공', info: [
									{name: '전공필수', controller: <CreditStatusBar credit={19} totalCredit={19} statusColor={'#cdf2c1'}/>},
									{name: '전공선택', controller: <CreditStatusBar credit={23} totalCredit={21} statusColor={'#c2ebcd'}/>}]},
								// {name: '복수전공', info: [
								// 	{name: '전공필수', controller: <CreditStatusBar credit={19} totalCredit={19} statusColor={'#cdf2c1'}/>},
								// 	{name: '전공선택', controller: <CreditStatusBar credit={23} totalCredit={21} statusColor={'#c2ebcd'}/>}]},
								// {name: '교양필수', info: [
								// 	{name: '교양', controller: <CreditStatusBar credit={9} totalCredit={21} statusColor={'#c2ebcd'}/>}]},
							]}
						/>
					</Scroller>
					
					
				</div>
			</>
		)
	}
}

export default (
	SummarySubSection
);