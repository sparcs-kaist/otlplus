import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import courseFocusShape from '../../../shapes/state/CourseFocusShape';
import userShape from '../../../shapes/model/UserShape';

import { appBoundClassNames as classNames } from '../../../common/boundClassNames';
import CreditStatusBar from '../../CreditStatusBar';
import Setting from '../../Setting';
import Scroller from '../../Scroller';

const TAGET_TYPES = ['Total', 'Basic Required', 'Basic Elective', 'Major Required', 'Major Elective'];

const indexOfType = (type) => {
	console.log("index of type", type);
	const index = TAGET_TYPES.indexOf(type);
	if (index === -1){
		//
	}
	return index;
}

class SummarySubSection extends Component {
	constructor(props) {
		super(props);
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
      console.log(courseFocus.course.type, courseFocus.course.department.name);
    }
    if ((prevProps.courseFocus.course && courseFocus.course)
    && (prevProps.courseFocus.course.id !== courseFocus.course.id)) {
      console.log(courseFocus.course.type, courseFocus.course.department.name);
		}
	}

	render() {
		const { t, user } = this.props;
		const { courseFocus } = this.props;

		if (user == null) {
      return null;
    }

		const singleFocusedTypeCredit = [0, 1, 2, 3, 4].map((i) => (courseFocus.course && courseFocus.lectures) ? (
			(i === 0) ? courseFocus.lectures.at(-1).credit
				:	!(indexOfType(courseFocus.course.type_en) === i)
        	? 0
					: courseFocus.lectures.at(-1).credit
    ):
		0);

		// const recentLecture = courseFocus.lectures[courseFocus.lectures.length-1];
		// console.log(recentLecture.credit);

		return(
			<>
				<div className={classNames('subsection', 'subsection--planner-summary')}>
					<Scroller>
						<Setting 
							entries={[
								{name: '전체', info: [
									{name: '총학점', controller: <CreditStatusBar credit={100} totalCredit={130} focused={singleFocusedTypeCredit[0]} statusColor={'#cccccc'}/>}]},
								{name: '기초', info: [
									{name: '기초필수', controller: <CreditStatusBar credit={10} totalCredit={23} focused={singleFocusedTypeCredit[1]} statusColor={'#f3b6b5'}/>},
									{name: '기초선택', controller: <CreditStatusBar credit={2} totalCredit={12} focused={singleFocusedTypeCredit[2]} statusColor={'#f3c8ae'}/>}]},
								{name: `전공 - ${user.majors[0][t('js.property.name')]}`, info: [
									{name: '전공필수', controller: <CreditStatusBar credit={12} totalCredit={15} focused={singleFocusedTypeCredit[3]} statusColor={'#eee9a0'}/>},
									{name: '전공선택', controller: <CreditStatusBar credit={24} totalCredit={30} focused={singleFocusedTypeCredit[4]} statusColor={'#e5f2a0'}/>}]},
								{name: '복수전공', info: [
									{name: '전공필수', controller: <CreditStatusBar credit={19} totalCredit={19} focused={0} statusColor={'#cdf2c1'}/>},
									{name: '전공선택', controller: <CreditStatusBar credit={23} totalCredit={21} focused={0} statusColor={'#c2ebcd'}/>}]},
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
	courseFocus: state.planner.courseFocus,
	selectedListCode: state.planner.list.selectedListCode,
});

const mapDispatchToProps = (dispatch) => ({
	// clearCourseFocusDispatch: () => {
  //   dispatch(clearCourseFocus());
  // },
});

SummarySubSection.propTypes = {
	user: userShape,
  courseFocus: courseFocusShape.isRequired,
};

export default withTranslation()(
	connect(mapStateToProps, mapDispatchToProps)(
		SummarySubSection
	)
);