/* eslint-disable react/prop-types */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { appBoundClassNames as classNames } from '../../../../common/boundClassNames';

import { clearCourseFocus } from '../../../../actions/planner/courseFocus';

import courseFocusShape from '../../../../shapes/state/CourseFocusShape';

import CreditStatusBar from '../../../CreditStatusBar';
import CourseStatus from '../../../CourseStatus';
import Scroller from '../../../Scroller';

const TAGET_TYPES = ['Total', 'Basic Required', 'Basic Elective', 'Major Required', 'Major Elective'];

const indexOfType = (type) => {
  const index = TAGET_TYPES.indexOf(type);
  if (index === -1) {
    //
  }
  return index;
};

class SummarySubSection extends Component {
  componentDidUpdate(prevProps) {
    const {
      selectedListCode,
      courseFocus, clearCourseFocusDispatch,
    } = this.props;

    if (prevProps.selectedListCode !== selectedListCode) {
      clearCourseFocusDispatch();
    }

    if (!prevProps.courseFocus.course && courseFocus.course) {
      // pass;
    }
    if ((prevProps.courseFocus.course && courseFocus.course) && (prevProps.courseFocus.course.id !== courseFocus.course.id)) {
      // pass;
    }
  }

  render() {
    const { t } = this.props;
    const { courseFocus } = this.props;

    // TODO: Retrieve data from planner
    const majors = [];

    const singleFocusedTypeCredit = (index) => {
      if (courseFocus.course && courseFocus.lectures) {
        switch (index) {
          case 0:
            return courseFocus.lectures.at(-1).credit;// total credit
          case 3: case 4:
            if (majors[0].name_en.toUpperCase() === courseFocus.course.department.name_en.toUpperCase()
              && indexOfType(courseFocus.course.type_en) === index) {
              return courseFocus.lectures.at(-1).credit;
            } return 0;
          default:
            if (indexOfType(courseFocus.course.type_en) === index) {
              return courseFocus.lectures.at(-1).credit;
            } return 0;
        }
      }
      else return 0;
    };


    return (
      <>
        <div className={classNames('subsection', 'subsection--planner-summary')}>
          <Scroller>
            <CourseStatus
              entries={[
                {
                  name: t('ui.attribute.all'),
                  info: [
                    { name: '총학점', controller: <CreditStatusBar credit={100} totalCredit={130} focusedCredit={singleFocusedTypeCredit(0)} statusColor="#cccccc" /> }],
                },
                {
                  name: t('ui.attribute.basic'),
                  info: [
                    { name: t('ui.type.basicRequired'), controller: <CreditStatusBar credit={10} totalCredit={23} focusedCredit={singleFocusedTypeCredit(1)} statusColor="#f3b6b5" /> },
                    { name: t('ui.type.basicElective'), controller: <CreditStatusBar credit={2} totalCredit={12} focusedCredit={singleFocusedTypeCredit(2)} statusColor="#f3c8ae" /> }],
                },
                ...majors.map((d) => (
                  {
                    name: `${t('ui.attribute.major')} - ${majors[0][t('js.property.name')]}`,
                    info: [
                      { name: t('ui.type.majorRequired'), controller: <CreditStatusBar credit={12} totalCredit={15} focusedCredit={singleFocusedTypeCredit(3)} statusColor="#eee9a0" /> },
                      { name: t('ui.type.majorElective'), controller: <CreditStatusBar credit={24} totalCredit={25} focusedCredit={singleFocusedTypeCredit(4)} statusColor="#e5f2a0" /> }],
                  }
                )),
                {
                  name: '복수전공',
                  info: [
                    { name: t('ui.type.majorRequired'), controller: <CreditStatusBar credit={19} totalCredit={19} focusedCredit={0} statusColor="#cdf2c1" /> },
                    { name: t('ui.type.majorElective'), controller: <CreditStatusBar credit={23} totalCredit={21} focusedCredit={0} statusColor="#c2ebcd" /> }],
                },
              ]}
            />
          </Scroller>


        </div>
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  courseFocus: state.planner.courseFocus,
  selectedListCode: state.planner.list.selectedListCode,
});

const mapDispatchToProps = (dispatch) => ({
  clearCourseFocusDispatch: () => {
    dispatch(clearCourseFocus());
  },
});

SummarySubSection.propTypes = {
  courseFocus: courseFocusShape.isRequired,

  clearCourseFocusDispatch: PropTypes.func.isRequired,
};

export default withTranslation()(
  connect(mapStateToProps, mapDispatchToProps)(
    SummarySubSection
  )
);
