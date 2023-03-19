/* eslint-disable react/prop-types */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { appBoundClassNames as classNames } from '../../../../common/boundClassNames';

import { clearItemFocus } from '../../../../actions/planner/itemFocus';

import itemFocusShape from '../../../../shapes/state/ItemFocusShape';

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
      itemFocus, clearItemFocusDispatch,
    } = this.props;

    if (prevProps.selectedListCode !== selectedListCode) {
      clearItemFocusDispatch();
    }

    if (!prevProps.itemFocus.course && itemFocus.course) {
      // pass;
    }
    if ((prevProps.itemFocus.course && itemFocus.course) && (prevProps.itemFocus.course.id !== itemFocus.course.id)) {
      // pass;
    }
  }

  render() {
    const { t } = this.props;
    const { itemFocus } = this.props;

    // TODO: Retrieve data from planner
    const majors = [];

    const singleFocusedTypeCredit = (index) => {
      if (itemFocus.course && itemFocus.lectures) {
        switch (index) {
          case 0:
            return itemFocus.lectures.at(-1).credit;// total credit
          case 3: case 4:
            if (majors[0].name_en.toUpperCase() === itemFocus.course.department.name_en.toUpperCase()
              && indexOfType(itemFocus.course.type_en) === index) {
              return itemFocus.lectures.at(-1).credit;
            } return 0;
          default:
            if (indexOfType(itemFocus.course.type_en) === index) {
              return itemFocus.lectures.at(-1).credit;
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
  itemFocus: state.planner.itemFocus,
  selectedListCode: state.planner.list.selectedListCode,
});

const mapDispatchToProps = (dispatch) => ({
  clearItemFocusDispatch: () => {
    dispatch(clearItemFocus());
  },
});

SummarySubSection.propTypes = {
  itemFocus: itemFocusShape.isRequired,

  clearItemFocusDispatch: PropTypes.func.isRequired,
};

export default withTranslation()(
  connect(mapStateToProps, mapDispatchToProps)(
    SummarySubSection
  )
);
