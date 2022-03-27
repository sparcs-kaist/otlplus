import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import courseFocusShape from '../../../shapes/state/CourseFocusShape';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';
import CreditStatusBar from '../../CreditStatusBar';
import Setting from '../../Setting';
import Scroller from '../../Scroller';

class SummarySubSection extends Component {
	constructor(props) {
		super(props);
	}

	setCreditStatus = (credit, totalCredit) => {
		const status = document.getElementsByClassName(classNames('credit-status--front'))[0]

		status.style.width=(credit/totalCredit)*100
	}

	componentDidUpdate(prevProps) {
		const {
			selectedListCode,
			courseFocus, clearCourseFocusDispatch,
		} = this.props;


		if (prevProps.selectedListCode !== selectedListCode) {
      // clearCourseFocusDispatch();
    }

    if (!prevProps.courseFocus.course && courseFocus.course) {
      console.log("changed");
    }
    if ((prevProps.courseFocus.course && courseFocus.course)
    && (prevProps.courseFocus.course.id !== courseFocus.course.id)) {
      console.log(courseFocus.course.type, courseFocus.course.department.name);
		}
	}

	render() {
		const { courseFocus } = this.props;
		
		// if (!courseFocus.course || !courseFocus.lectures) {
    //   return null;
    // }
		
		// const recentLecture = courseFocus.lectures[courseFocus.lectures.length-1];
		// console.log(recentLecture.credit);

		return(
			<>
				<div className={classNames('subsection', 'subsection--planner-summary')}>
					<Scroller>
						<Setting 
							entries={[
								{name: '전체', info: [
									{name: '총학점', controller: <CreditStatusBar credit={147} totalCredit={130} statusColor={'#cccccc'}/>}]},
								{name: '기초', info: [
									{name: '기초필수', controller: <CreditStatusBar credit={23} totalCredit={23} statusColor={'#f3b6b5'}/>},
									{name: '기초선택', controller: <CreditStatusBar credit={6} totalCredit={6} statusColor={'#f3c8ae'}/>}]},
								{name: '전공', info: [
									{name: '전공필수', controller: <CreditStatusBar credit={12} totalCredit={15} statusColor={'#eee9a0'}/>},
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

const mapStateToProps = (state) => ({
  user: state.common.user.user,
	courseFocus: state.dictionary.courseFocus,
	selectedListCode: state.dictionary.list.selectedListCode,
});

const mapDispatchToProps = (dispatch) => ({
	// clearCourseFocusDispatch: () => {
  //   dispatch(clearCourseFocus());
  // },
});

SummarySubSection.propTypes = {
  courseFocus: courseFocusShape.isRequired,
};

export default withTranslation()(
	connect(mapStateToProps, mapDispatchToProps)(
		SummarySubSection
	)
);